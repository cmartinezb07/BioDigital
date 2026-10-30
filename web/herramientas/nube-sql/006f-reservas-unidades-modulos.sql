-- 006f · Reservas, parte 5 (se aplica después de 006a a 006d; para la demostración en vivo, junto con 006e). Solo reemplaza funciones: no toca disparadores ni datos.
--  1. UNIDAD ASIGNADA: cada reserva guarda qué unidad le tocó ("Cabaña Copihue 2"); se muestra al cliente, en el aviso y en el panel. Al modificar se conserva si sigue libre.
--  2. MOVER DE UNIDAD: la recepción o el jefe cambian la unidad (si está libre esas fechas); queda en el historial.
--  3. RESERVA POR TELÉFONO desde el panel: el equipo puede reservar sin correo (basta el celular o el correo), sin la anticipación mínima y sin los campos obligatorios.
--  4. CAMPOS PROPIOS por negocio (config.campos): texto, número, opciones o sí/no, obligatorios u opcionales; el servidor valida y guarda las respuestas.
--  5. MÓDULOS (config.modulos): pagos, promociones, extras, avisos, espera, campos y modificar se encienden y apagan sin romper nada. Apagar un módulo
--     cambia lo que viene; las reservas ya hechas conservan lo suyo. Sin la clave, el módulo está encendido (las agendas de antes siguen igual).
--  6. BLOQUEOS por unidad o de todas las unidades (antes un bloqueo quitaba solo 1 unidad), y un bloqueo también cierra una salida de tour.
-- Errores nuevos: unidad_invalida, unidad_ocupada:COD, campo:ID, sin_espera, bloqueado.

-- ---------- Módulos ----------
create or replace function demo.rv_mod(p_cfg jsonb, p_k text) returns boolean language sql immutable set search_path = '' as $$
  select coalesce((p_cfg->'modulos'->>p_k)::boolean, true) $$;
-- La configuración "efectiva": la publicada, con los módulos apagados ya aplicados (todas las reglas usan esta)
create or replace function demo.rv_cfg(p_neg text, p_ag text) returns jsonb language sql stable security definer set search_path = '' as $$
  select c
    || case when demo.rv_mod(c, 'pagos') then '{}'::jsonb else jsonb_build_object('politicas', coalesce(c->'politicas', '{}'::jsonb) || '{"deposito":0}'::jsonb, 'pagoDemo', false) end
    || case when demo.rv_mod(c, 'promociones') then '{}'::jsonb else '{"reglas":[]}'::jsonb end
    || case when demo.rv_mod(c, 'avisos') then '{}'::jsonb else '{"notif":{}}'::jsonb end
    || case when demo.rv_mod(c, 'campos') then '{}'::jsonb else '{"campos":[]}'::jsonb end
    || case when c->>'modo' = 'noches' and not demo.rv_mod(c, 'extras') then '{"servicios":[]}'::jsonb else '{}'::jsonb end
  from (select data->'config' as c from demo.items where negocio = p_neg and col = 'config' and id = 'cfg-' || p_ag) q $$;
create or replace function demo.rv_promos(p_neg text, p_ag text) returns jsonb language sql stable security definer set search_path = '' as $$
  select case when demo.rv_mod(demo.rv_cfg(p_neg, p_ag), 'promociones')
    then coalesce((select data->'lista' from demo.items where negocio = p_neg and col = 'promos' and data->>'agenda' = p_ag limit 1), '[]'::jsonb) else '[]'::jsonb end $$;

-- ---------- Unidades ----------
create or replace function demo.rv_unombre(p_rec jsonb, p_u int) returns text language sql immutable set search_path = '' as $$
  select case when p_u is null then null else coalesce(nullif(p_rec->'nombresUnidades'->>(p_u - 1), ''),
    (p_rec->>'nombre') || case when coalesce((p_rec->>'unidades')::int, 1) > 1 then ' ' || p_u else '' end) end $$;
-- Unidades con nombre propio ya tomadas entre dos instantes (reservas vigentes y bloqueos de una unidad)
create or replace function demo.rv_tomadas(p_neg text, p_ag text, p_rec text, p_d bigint, p_h bigint, p_salvo text) returns int[]
language sql volatile security definer set search_path = '' as $$
  select coalesce(array_agg(distinct u), '{}') from (
    select (data->>'unidad')::int u from demo.items
    where negocio = p_neg and col = 'reservas' and id <> coalesce(p_salvo, '') and data->>'agenda' = p_ag and data->>'recurso' = p_rec and data->>'unidad' ~ '^\d{1,3}$'
      and data->>'estado' in ('retenida','confirmada','pagada','checkin','completada','noshow')
      and not (data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) < demo.rv_ahora())
      and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d
    union all
    select (data->>'unidad')::int from demo.items
    where negocio = p_neg and col = 'bloqueos' and data->>'agenda' = p_ag and data->>'recurso' = p_rec and data->>'unidad' ~ '^\d{1,3}$' and coalesce(data->>'quitado', '') <> 'true'
      and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d) q $$;
-- La unidad que le toca: la preferida si sigue libre (al modificar), si no la primera libre todo el periodo; null si ninguna queda libre de punta a punta
create or replace function demo.rv_unidad(p_neg text, p_ag text, p_rec jsonb, p_d bigint, p_h bigint, p_salvo text, p_pref int) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare unid int := greatest(1, coalesce((p_rec->>'unidades')::int, 1)); t int[] := demo.rv_tomadas(p_neg, p_ag, p_rec->>'id', p_d, p_h, p_salvo); u int;
begin
  if p_pref between 1 and unid and not (p_pref = any(t)) then return p_pref; end if;
  for u in 1 .. unid loop if not (u = any(t)) then return u; end if; end loop;
  return null;
end $$;

-- ---------- Resolver (igual que 006b + un bloqueo cierra una salida de tour) ----------
create or replace function demo.rv_resolver(p_neg text, p_ag text, p_cfg jsonb, p_sel jsonb, p_ahora bigint, p_salvo text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  modo text := p_cfg->>'modo'; pol jsonb := coalesce(p_cfg->'politicas', '{}'::jsonb); r jsonb; s jsonb; a bigint; b bigint; desde_lim bigint; hasta_lim bigint;
  pers int; hrs int; dur int; paso int; buf int; ok boolean; i0 int; i1 int; mn int; tr jsonb; unid numeric; n int; i int; f text; alta jsonb;
  lleg text; sali text; fecha text; quedan numeric; elegido text; c record; min_h int;
begin
  if jsonb_typeof(p_sel) is distinct from 'object' then raise exception 'seleccion'; end if;
  desde_lim := p_ahora + (coalesce((pol->>'anticipacionHoras')::numeric, 0) * 3600000)::bigint;
  hasta_lim := demo.rv_ms(((demo.rv_hoy())::date + coalesce((pol->>'maxDias')::int, 365))::text, 0);
  pers := case when p_sel->>'personas' ~ '^[0-9]{1,3}$' then (p_sel->>'personas')::int else 1 end;
  if pers < 1 then raise exception 'seleccion'; end if;

  if modo = 'noches' then
    r := null; select e into r from jsonb_array_elements(p_cfg->'recursos') e where e->>'id' = p_sel->>'recurso';
    if r is null then raise exception 'seleccion'; end if;
    lleg := p_sel->>'llegada'; sali := p_sel->>'salida';
    if coalesce(lleg, '') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(sali, '') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'fechas'; end if;
    begin perform lleg::date, sali::date; exception when others then raise exception 'fechas'; end;
    if sali::date <= lleg::date then raise exception 'fechas'; end if;
    n := sali::date - lleg::date;
    if n > 60 then raise exception 'estadia_larga'; end if;
    alta := demo.rv_temporada(p_cfg, lleg);
    mn := case when alta is not null then coalesce((pol->>'estadiaMinAlta')::int, 1) else coalesce((pol->>'estadiaMin')::int, 1) end;
    if n < mn then raise exception 'estadia_min:%', mn; end if;
    if pers > coalesce((r->>'capacidad')::int, 99) then raise exception 'capacidad:%', coalesce((r->>'capacidad')::int, 99); end if;
    a := demo.rv_ms(lleg);
    if a + 86400000 <= desde_lim then raise exception 'ya_paso'; end if;
    if a > hasta_lim or demo.rv_ms(sali) > hasta_lim then raise exception 'lejos'; end if;
    unid := coalesce((r->>'unidades')::numeric, 1);
    for i in 0 .. n - 1 loop
      f := (lleg::date + i)::text;
      if demo.rv_ocupa(p_neg, p_ag, r->>'id', demo.rv_ms(f), demo.rv_ms((f::date + 1)::text), p_salvo) >= unid then raise exception 'ocupado'; end if;
    end loop;
    return jsonb_build_object('recurso', r->>'id', 'servicio', null, 'desde', a, 'hasta', demo.rv_ms(sali), 'personas', pers, 'horas', null, 'unidades', 1);

  elsif modo = 'cupos' then
    s := null; select e into s from jsonb_array_elements(p_cfg->'servicios') e where e->>'id' = p_sel->>'servicio';
    if s is null then raise exception 'seleccion'; end if;
    fecha := p_sel->>'fecha';
    if coalesce(fecha, '') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(p_sel->>'min', '') !~ '^\d{1,4}$' then raise exception 'fechas'; end if;
    begin perform fecha::date; exception when others then raise exception 'fechas'; end;
    mn := (p_sel->>'min')::int;
    if not coalesce((s->'dias') @> to_jsonb(extract(dow from fecha::date)::int), false) then raise exception 'sin_salida'; end if;
    if not exists (select 1 from jsonb_array_elements_text(s->'salidas') h where demo.rv_minh(h) = mn) then raise exception 'sin_salida'; end if;
    a := demo.rv_ms(fecha, mn);
    if a < desde_lim then raise exception 'ya_paso'; end if;
    if a > hasta_lim then raise exception 'lejos'; end if;
    if exists (select 1 from demo.items where negocio = p_neg and col = 'bloqueos' and data->>'agenda' = p_ag and data->>'recurso' = s->>'id' and coalesce(data->>'quitado', '') <> 'true'
      and (data->>'desde')::bigint <= a and (data->>'hasta')::bigint > a) then raise exception 'bloqueado'; end if;
    if pers < coalesce((s->>'minPersonas')::int, 1) then raise exception 'minimo_personas:%', coalesce((s->>'minPersonas')::int, 1); end if;
    quedan := coalesce((s->>'capacidad')::numeric, 1) - demo.rv_usados_cupo(p_neg, p_ag, s->>'id', a, p_salvo);
    if quedan < pers then raise exception 'cupos:%', greatest(0, quedan); end if;
    return jsonb_build_object('recurso', s->>'id', 'servicio', s->>'id', 'desde', a, 'hasta', a + (coalesce((s->>'duracion')::int, 60)) * 60000::bigint, 'personas', pers, 'horas', null, 'unidades', 1);

  elsif modo in ('horas', 'bloques') then
    fecha := p_sel->>'fecha';
    if coalesce(fecha, '') !~ '^\d{4}-\d{2}-\d{2}$' or coalesce(p_sel->>'min', '') !~ '^\d{1,4}$' then raise exception 'fechas'; end if;
    begin perform fecha::date; exception when others then raise exception 'fechas'; end;
    mn := (p_sel->>'min')::int;
    paso := coalesce((p_cfg->>'intervalo')::int, 30); buf := coalesce((p_cfg->>'buffer')::int, 0);
    if modo = 'horas' then
      s := null; select e into s from jsonb_array_elements(p_cfg->'servicios') e where e->>'id' = p_sel->>'servicio';
      if s is null then raise exception 'seleccion'; end if;
      dur := coalesce((s->>'duracion')::int, 30); hrs := null;
    else
      r := null; select e into r from jsonb_array_elements(p_cfg->'recursos') e where e->>'id' = p_sel->>'recurso';
      if r is null then raise exception 'seleccion'; end if;
      min_h := coalesce((r->>'minHoras')::int, 1);
      hrs := case when p_sel->>'horas' ~ '^[0-9]{1,2}$' then (p_sel->>'horas')::int else min_h end;
      if hrs < min_h then raise exception 'horas_min:%', min_h; end if;
      if hrs > 12 then raise exception 'horas_max'; end if;
      if pers > coalesce((r->>'capacidad')::int, 999) then raise exception 'capacidad:%', coalesce((r->>'capacidad')::int, 999); end if;
      dur := hrs * 60;
    end if;
    ok := false;
    for tr in select e from jsonb_array_elements(coalesce(p_cfg->'horario'->demo.rv_dia(fecha), '[]'::jsonb)) e loop
      i0 := demo.rv_minh(tr->>0); i1 := demo.rv_minh(tr->>1);
      if mn >= i0 and mn + dur <= i1 and (mn - i0) % greatest(paso, 1) = 0 then ok := true; end if;
    end loop;
    if not ok then raise exception 'fuera_horario'; end if;
    a := demo.rv_ms(fecha, mn); b := a + (dur + buf) * 60000::bigint;
    if a < desde_lim then raise exception 'ya_paso'; end if;
    if a > hasta_lim then raise exception 'lejos'; end if;
    elegido := null;
    if modo = 'horas' then
      for c in select e, ord from jsonb_array_elements(p_cfg->'recursos') with ordinality t(e, ord) order by ord loop
        continue when not coalesce((c.e->'servicios') @> to_jsonb(s->>'id'), false);
        continue when coalesce(p_sel->>'recurso', '') <> '' and p_sel->>'recurso' <> c.e->>'id';
        if demo.rv_ocupa(p_neg, p_ag, c.e->>'id', a, b, p_salvo) < coalesce((c.e->>'unidades')::numeric, 1) then elegido := c.e->>'id'; exit; end if;
      end loop;
      if elegido is null then raise exception 'ocupado'; end if;
      return jsonb_build_object('recurso', elegido, 'servicio', s->>'id', 'desde', a, 'hasta', b, 'personas', 1, 'horas', null, 'unidades', 1);
    else
      if demo.rv_ocupa(p_neg, p_ag, r->>'id', a, b, p_salvo) >= coalesce((r->>'unidades')::numeric, 1) then raise exception 'ocupado'; end if;
      return jsonb_build_object('recurso', r->>'id', 'servicio', null, 'desde', a, 'hasta', a + hrs * 3600000::bigint, 'personas', pers, 'horas', hrs, 'unidades', 1);
    end if;
  end if;
  raise exception 'sin_agenda';
end $$;

-- ---------- Avisos: dicen la unidad o el profesional asignado ----------
create or replace function demo.rv_texto(p_cfg jsonb, p_r jsonb, p_tipo text) returns text language sql immutable set search_path = '' as $$
  select case p_tipo
    when 'confirmacion' then case when p_r->>'estado' = 'retenida' then 'Reservamos tu cupo por ' || coalesce(p_cfg->'politicas'->>'retencionMin', '10') || ' minutos. Paga el depósito para confirmar ' || (p_cfg->>'nombre') || ' (' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' · ' || (p_r->>'unidadNombre'), '') || '). Código ' || (p_r->>'codigo') || '.'
      else 'Tu reserva en ' || (p_cfg->>'nombre') || ' está confirmada: ' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' · ' || (p_r->>'unidadNombre'), '') || '. Código ' || (p_r->>'codigo') || '.' end
    when 'recordatorio' then 'Recordatorio: te esperamos en ' || (p_cfg->>'nombre') || ' el ' || demo.rv_fechahora(p_cfg, p_r) || coalesce(' (' || (p_r->>'unidadNombre') || ')', '') || '. Si no puedes venir, cancela desde tu enlace.'
    when 'resena' then '¿Cómo te fue en ' || (p_cfg->>'nombre') || '? Cuéntanos en 1 minuto.'
    when 'cancelacion' then 'Tu reserva ' || (p_r->>'codigo') || ' en ' || (p_cfg->>'nombre') || ' fue cancelada.' || case when coalesce((p_r->'reembolso'->>'monto')::numeric, 0) > 0 then ' Te devolvemos ' || demo.rv_clp((p_r->'reembolso'->>'monto')::numeric) || '.' else '' end
    when 'espera' then 'Se liberó un cupo en ' || (p_cfg->>'nombre') || ' para la fecha que esperabas. Reserva antes que otro.'
    else '' end $$;

-- ---------- Respuestas a los campos propios del negocio ----------
create or replace function demo.rv_respuestas(p_cfg jsonb, p_resp jsonb, p_staff boolean) returns jsonb language plpgsql immutable set search_path = '' as $$
declare cp jsonb; v text; out jsonb := '{}'::jsonb;
begin
  for cp in select e from jsonb_array_elements(coalesce(p_cfg->'campos', '[]'::jsonb)) e loop
    v := left(btrim(coalesce(case when jsonb_typeof(p_resp) = 'object' then p_resp->>(cp->>'id') end, '')), 300);
    if v = '' then
      if coalesce((cp->>'obligatorio')::boolean, false) and not p_staff then raise exception 'campo:%', cp->>'id'; end if;
      continue;
    end if;
    if cp->>'tipo' = 'numero' and v !~ '^\d{1,6}$' then raise exception 'campo:%', cp->>'id'; end if;
    if cp->>'tipo' = 'opciones' and not coalesce((cp->'opciones') @> to_jsonb(v), false) then raise exception 'campo:%', cp->>'id'; end if;
    if cp->>'tipo' = 'si' and v not in ('Sí', 'No') then raise exception 'campo:%', cp->>'id'; end if;
    out := out || jsonb_build_object(cp->>'id', v);
  end loop;
  return out;
end $$;

-- ---------- Armar una reserva (crear o modificar): con unidad, campos propios y reserva del equipo ----------
create or replace function demo.rv_armar(p_neg text, p_id text, p_new jsonb, p_old jsonb, p_rol text, p_nom text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  ag text := coalesce(p_old->>'agenda', p_new->>'agenda'); cfg jsonb; cfg_res jsonb; promos jsonb; sel jsonb; cin jsonb; cli jsonb; res jsonb; pr jsonb; ahora bigint := demo.rv_ahora();
  staff boolean := p_rol in ('dueno', 'recepcion'); pol jsonb; dep numeric; con_dep boolean; est text; exp bigint; doc jsonb; canal text; promo text; tel text; cor text; n_ret int; edic jsonb; sin_pago boolean;
  rec jsonb; uni int; resp jsonb;
begin
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' then raise exception 'sin_agenda'; end if;
  cfg := demo.rv_cfg(p_neg, ag);
  if cfg is null then raise exception 'sin_agenda'; end if;
  promos := demo.rv_promos(p_neg, ag); pol := coalesce(cfg->'politicas', '{}'::jsonb);
  -- el equipo reserva por teléfono o en el mostrador: sin la anticipación mínima
  cfg_res := case when staff then jsonb_set(cfg, '{politicas}', pol || '{"anticipacionHoras":0}'::jsonb) else cfg end;
  perform pg_advisory_xact_lock(hashtext(p_neg || ':rv:' || ag));
  sel := demo.rv_sel(coalesce(p_new->'sel', p_old->'sel'));
  cin := coalesce(p_new->'cliente', p_old->'cliente', '{}'::jsonb);
  if length(btrim(coalesce(cin->>'nombre', ''))) < 3 or length(btrim(cin->>'nombre')) > 60 then raise exception 'datos:nombre'; end if;
  cor := lower(btrim(coalesce(cin->>'correo', '')));
  tel := regexp_replace(coalesce(cin->>'telefono', ''), '[^0-9+]', '', 'g');
  if staff then   -- basta un dato de contacto; el que venga debe ser válido
    if cor = '' and tel = '' then raise exception 'datos:contacto'; end if;
    if cor <> '' and (cor !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(cor) > 120) then raise exception 'datos:correo'; end if;
    if tel <> '' and length(regexp_replace(tel, '\D', '', 'g')) not between 8 and 15 then raise exception 'datos:telefono'; end if;
  else
    if cor !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(cor) > 120 then raise exception 'datos:correo'; end if;
    if length(regexp_replace(tel, '\D', '', 'g')) not between 8 and 15 then raise exception 'datos:telefono'; end if;
  end if;
  cli := jsonb_build_object('nombre', btrim(cin->>'nombre'), 'correo', cor, 'telefono', left(tel, 20), 'pais', left(coalesce(nullif(btrim(cin->>'pais'), ''), 'Chile'), 40), 'idioma', case when cin->>'idioma' in ('es', 'en', 'pt') then cin->>'idioma' else 'es' end);
  resp := demo.rv_respuestas(cfg, coalesce(p_new->'respuestas', p_old->'respuestas'), staff);
  promo := upper(btrim(coalesce(p_new->>'codigoPromo', '')));
  if promo !~ '^[A-Z0-9]{0,20}$' then promo := ''; end if;
  res := demo.rv_resolver(p_neg, ag, cfg_res, sel, ahora, case when p_old is null then null else p_id end);
  pr := demo.rv_precio(p_neg, ag, cfg, promos, sel, promo, ahora, case when p_old is null then null else p_id end);
  -- unidad: en todo menos tours; al modificar se conserva la misma si sigue libre
  uni := null; rec := null;
  if cfg->>'modo' <> 'cupos' then
    select e into rec from jsonb_array_elements(cfg->'recursos') e where e->>'id' = res->>'recurso';
    if rec is not null then
      uni := demo.rv_unidad(p_neg, ag, rec, (res->>'desde')::bigint, (res->>'hasta')::bigint, case when p_old is null then null else p_id end,
        case when p_old is not null and p_old->>'recurso' = res->>'recurso' and p_old->>'unidad' ~ '^\d{1,3}$' then (p_old->>'unidad')::int end);
    end if;
  end if;

  if p_old is null then
    canal := case when staff and (p_new->>'canal') in ('Sitio web', 'WhatsApp', 'Teléfono', 'Presencial', 'Airbnb (iCal)', 'Booking (iCal)') then p_new->>'canal' when staff then 'Presencial' else 'Sitio web' end;
    if not staff then
      select count(*) into n_ret from demo.items where negocio = p_neg and col = 'reservas' and data->>'agenda' = ag and data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) >= ahora and data->'cliente'->>'correo' = cli->>'correo';
      if n_ret >= 2 then raise exception 'demasiadas_retenciones'; end if;
    end if;
    dep := (pr->>'deposito')::numeric; sin_pago := staff and coalesce((p_new->>'sinPago')::boolean, false);
    con_dep := dep > 0 and not sin_pago;
    est := case when con_dep then 'retenida' else 'confirmada' end;
    exp := case when con_dep then ahora + coalesce((pol->>'retencionMin')::int, 10) * 60000::bigint else null end;
    return jsonb_build_object('id', p_id, 'agenda', ag, 'neg', ag, 'codigo', demo.rv_codigo(p_neg), 'creada', ahora, 'modo', cfg->>'modo', 'recurso', res->>'recurso', 'servicio', res->'servicio',
      'extras', coalesce(sel->'extras', '[]'::jsonb), 'desde', res->'desde', 'hasta', res->'hasta', 'personas', res->'personas', 'horas', res->'horas', 'unidades', 1, 'unidad', uni, 'unidadNombre', demo.rv_unombre(rec, uni),
      'cliente', cli, 'respuestas', resp, 'precio', pr, 'pagado', 0, 'moneda', 'CLP',
      'estado', est, 'expira', exp, 'canal', canal, 'idioma', cli->>'idioma', 'sel', sel, 'codigoPromo', promo, 'rev', 1, 'ediciones', '[]'::jsonb,
      'historial', jsonb_build_array(jsonb_build_object('estado', est, 't', ahora, 'por', p_rol, 'quien', p_nom)));
  end if;

  -- modificar: se conserva el código, el estado, el pago y el historial; la versión anterior queda guardada
  edic := coalesce(p_old->'ediciones', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('rev', p_old->'rev', 't', ahora, 'sel', p_old->'sel', 'desde', p_old->'desde', 'hasta', p_old->'hasta', 'recurso', p_old->>'recurso', 'unidadNombre', p_old->>'unidadNombre', 'total', p_old->'precio'->'total', 'por', p_rol));
  doc := p_old || jsonb_build_object('recurso', res->>'recurso', 'servicio', res->'servicio', 'extras', coalesce(sel->'extras', '[]'::jsonb), 'desde', res->'desde', 'hasta', res->'hasta', 'personas', res->'personas', 'horas', res->'horas',
    'unidad', uni, 'unidadNombre', demo.rv_unombre(rec, uni), 'cliente', cli, 'respuestas', resp, 'precio', pr, 'sel', sel, 'codigoPromo', promo, 'rev', (p_old->>'rev')::int + 1, 'ediciones', edic,
    'ajuste', (pr->>'total')::numeric - coalesce((p_old->>'pagado')::numeric, 0));
  return jsonb_set(doc, '{historial}', (p_old->'historial') || jsonb_build_array(jsonb_build_object('estado', p_old->>'estado', 't', ahora, 'por', p_rol, 'quien', p_nom, 'modificada', true)));
end $$;

-- ---------- Mover una reserva a otra unidad del mismo alojamiento o recurso (equipo) ----------
create or replace function demo.rv_mover(p_neg text, p_r jsonb, p_u text, p_rol text, p_nom text, p_cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare rec jsonb; u int; otra text;
begin
  if coalesce(p_u, '') !~ '^\d{1,3}$' then raise exception 'unidad_invalida'; end if;
  u := p_u::int;
  select e into rec from jsonb_array_elements(p_cfg->'recursos') e where e->>'id' = p_r->>'recurso';
  if rec is null or u < 1 or u > coalesce((rec->>'unidades')::int, 1) then raise exception 'unidad_invalida'; end if;
  if p_r->>'estado' not in ('retenida', 'confirmada', 'pagada', 'checkin') then raise exception 'no_modificable'; end if;
  perform pg_advisory_xact_lock(hashtext(p_neg || ':rv:' || (p_r->>'agenda')));
  select data->>'codigo' into otra from demo.items where negocio = p_neg and col = 'reservas' and id <> p_r->>'id' and data->>'agenda' = p_r->>'agenda' and data->>'recurso' = p_r->>'recurso'
    and data->>'unidad' = u::text and data->>'estado' in ('retenida','confirmada','pagada','checkin','completada','noshow')
    and not (data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) < demo.rv_ahora())
    and (data->>'desde')::bigint < (p_r->>'hasta')::bigint and (data->>'hasta')::bigint > (p_r->>'desde')::bigint limit 1;
  if otra is not null then raise exception 'unidad_ocupada:%', otra; end if;
  if u = any(demo.rv_tomadas(p_neg, p_r->>'agenda', p_r->>'recurso', (p_r->>'desde')::bigint, (p_r->>'hasta')::bigint, p_r->>'id')) then raise exception 'unidad_ocupada:bloqueo'; end if;
  return p_r || jsonb_build_object('unidad', u, 'unidadNombre', demo.rv_unombre(rec, u), 'historial', (p_r->'historial') || jsonb_build_array(jsonb_build_object('estado', p_r->>'estado', 't', demo.rv_ahora(), 'por', p_rol, 'quien', p_nom,
    'movida', coalesce(p_r->>'unidadNombre', 'sin unidad') || ' → ' || demo.rv_unombre(rec, u))));
end $$;

-- ---------- Disparador de reservas (006d + respuestas, módulo "modificar" y mover de unidad) ----------
create or replace function demo.reserva_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); nom text := coalesce(current_setting('demo.nombre', true), '');
  staff boolean; o jsonb; n jsonb; r jsonb; cfg jsonb; ahora bigint := demo.rv_ahora(); horas_min numeric; cobro numeric; cambia boolean;
begin
  if rol = 'sistema' then return new; end if;
  staff := rol in ('dueno', 'recepcion');
  if tg_op = 'INSERT' then
    new.data := demo.rv_armar(new.negocio, new.id, new.data, null, rol, nom);
    cfg := demo.rv_cfg(new.negocio, new.data->>'agenda');
    new.pub := demo.rv_pub(new.data);
    perform demo.rv_programar(new.negocio, cfg, new.data, new.data->>'estado' = 'retenida');
    return new;
  end if;
  o := old.data; n := new.data; r := o; cfg := demo.rv_cfg(new.negocio, o->>'agenda');
  if cfg is null then raise exception 'sin_agenda'; end if;
  cambia := (n->'sel') is distinct from (o->'sel') or (n->'cliente') is distinct from (o->'cliente') or coalesce(n->>'codigoPromo', '') <> coalesce(o->>'codigoPromo', '')
    or coalesce(n->'respuestas', '{}'::jsonb) is distinct from coalesce(o->'respuestas', '{}'::jsonb);
  if cambia then
    if o->>'estado' not in ('retenida', 'confirmada', 'pagada') then raise exception 'no_modificable'; end if;
    if not staff then
      if not demo.rv_mod(cfg, 'modificar') then raise exception 'no_modificable'; end if;
      if coalesce(n->>'baseRev', '') <> coalesce(o->>'rev', '') then raise exception 'conflicto'; end if;
      horas_min := coalesce((cfg->'politicas'->>'modificarHoras')::numeric, 24);
      if ((o->>'desde')::bigint - ahora) < horas_min * 3600000 then raise exception 'tarde_modificar:%', horas_min; end if;
      if o->>'estado' = 'retenida' and coalesce((o->>'expira')::bigint, 0) < ahora then raise exception 'retencion_vencida'; end if;
    end if;
    r := demo.rv_armar(new.negocio, new.id, n, o, rol, nom);
  elsif staff and coalesce(n->>'unidad', '') <> coalesce(o->>'unidad', '') then
    r := demo.rv_mover(new.negocio, r, n->>'unidad', rol, nom, cfg);
  end if;
  if (n->>'estado') is distinct from (o->>'estado') then
    r := demo.rv_transicion(new.negocio, r, n->>'estado', n, rol, nom, cfg);
  elsif staff and o->>'estado' in ('pagada', 'checkin') and coalesce(n->>'pagado', '') ~ '^[0-9]+(\.[0-9]+)?$' and (n->>'pagado')::numeric > coalesce((o->>'pagado')::numeric, 0) then
    cobro := least((r->'precio'->>'total')::numeric, (n->>'pagado')::numeric);
    r := jsonb_set(r, '{pagado}', to_jsonb(cobro));
    r := jsonb_set(r, '{historial}', (r->'historial') || jsonb_build_array(jsonb_build_object('estado', r->>'estado', 't', ahora, 'por', rol, 'quien', nom, 'cobro', cobro)));
  end if;
  new.data := r; new.pub := demo.rv_pub(r);
  return new;
end $$;

-- ---------- Lista de espera: solo si el módulo está encendido ----------
create or replace function demo.espera_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); ag text; cin jsonb; tel text; cfg jsonb;
begin
  if rol = 'sistema' then return new; end if;
  if tg_op = 'UPDATE' then
    if rol not in ('dueno', 'recepcion') then raise exception 'sin permiso'; end if;
    new.data := old.data || jsonb_build_object('avisado', coalesce((new.data->>'avisado')::boolean, (old.data->>'avisado')::boolean, false));
    return new;
  end if;
  ag := coalesce(new.data->>'agenda', new.data->>'neg');
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' then raise exception 'sin_agenda'; end if;
  cfg := demo.rv_cfg(new.negocio, ag); if cfg is null then raise exception 'sin_agenda'; end if;
  if not demo.rv_mod(cfg, 'espera') then raise exception 'sin_espera'; end if;
  cin := coalesce(new.data->'cliente', '{}'::jsonb);
  if length(btrim(coalesce(cin->>'nombre', ''))) < 2 or length(cin->>'nombre') > 60 then raise exception 'datos:nombre'; end if;
  tel := regexp_replace(coalesce(cin->>'telefono', ''), '[^0-9+]', '', 'g');
  if lower(btrim(coalesce(cin->>'correo', ''))) !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and length(regexp_replace(tel, '\D', '', 'g')) not between 8 and 15 then raise exception 'datos:contacto'; end if;
  new.data := jsonb_build_object('id', new.id, 'neg', ag, 'agenda', ag, 't', demo.rv_ahora(), 'avisado', false, 'sel', demo.rv_sel(new.data->'sel'),
    'cliente', jsonb_build_object('nombre', btrim(cin->>'nombre'), 'correo', left(lower(btrim(coalesce(cin->>'correo', ''))), 120), 'telefono', left(tel, 20)));
  return new;
end $$;

-- ---------- Bloqueos: de una unidad ("unidad": N), de todas ("todas": true) o, como antes, de 1 unidad sin nombre (iCal) ----------
create or replace function demo.bloqueo_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); ag text := coalesce(new.data->>'agenda', new.data->>'neg'); d bigint; h bigint; cfg jsonb; rec jsonb; tot int; uni int; cant int;
begin
  if rol = 'sistema' then return new; end if;
  if rol not in ('dueno', 'recepcion') then raise exception 'sin permiso'; end if;
  if tg_op = 'UPDATE' then
    new.data := old.data || jsonb_build_object('quitado', coalesce((new.data->>'quitado')::boolean, false));
    if (new.data->>'quitado')::boolean then new.pub := null; else new.pub := old.pub; end if;
    return new;
  end if;
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' or coalesce(new.data->>'recurso', '') !~ '^[a-z0-9_-]{1,30}$' or coalesce(new.data->>'desde', '') !~ '^\d{10,14}$' or coalesce(new.data->>'hasta', '') !~ '^\d{10,14}$' then raise exception 'bloqueo_invalido'; end if;
  d := (new.data->>'desde')::bigint; h := (new.data->>'hasta')::bigint;
  if h <= d or h - d > 400 * 86400000::bigint then raise exception 'bloqueo_invalido'; end if;
  cfg := demo.rv_cfg(new.negocio, ag);
  select e into rec from jsonb_array_elements(coalesce(cfg->'recursos', '[]'::jsonb)) e where e->>'id' = new.data->>'recurso';
  tot := greatest(1, coalesce((rec->>'unidades')::int, 1));
  uni := case when new.data->>'unidad' ~ '^\d{1,3}$' and (new.data->>'unidad')::int between 1 and tot then (new.data->>'unidad')::int end;
  cant := case when uni is not null then 1 when coalesce((new.data->>'todas')::boolean, false) then tot else 1 end;
  new.data := jsonb_build_object('id', new.id, 'agenda', ag, 'neg', ag, 'recurso', new.data->>'recurso', 'desde', d, 'hasta', h, 'motivo', left(coalesce(new.data->>'motivo', 'Bloqueo manual'), 80),
    'origen', left(coalesce(new.data->>'origen', 'manual'), 40), 'unidades', cant, 'unidad', uni, 'todas', cant = tot and uni is null and tot > 1);
  new.pub := jsonb_build_object('n', ag, 'm', 'x', 'r', ag || ':' || (new.data->>'recurso'), 'd', d, 'h', h, 'u', cant, 'e', 'bloqueo', 'x', 0);
  return new;
end $$;

-- ---------- Configuración: también se validan los campos propios y los módulos ----------
create or replace function demo.config_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); c jsonb; ag text; e jsonb; pid text; k text;
begin
  if rol = 'sistema' then return new; end if;
  if rol <> 'dueno' then raise exception 'sin permiso'; end if;
  if new.id !~ '^cfg-[a-z0-9-]{2,30}$' then raise exception 'config_invalida'; end if;
  ag := substr(new.id, 5); c := new.data->'config';
  if jsonb_typeof(c) is distinct from 'object' or c->>'modo' not in ('noches', 'cupos', 'horas', 'bloques') or coalesce(c->>'id', ag) <> ag then raise exception 'config_invalida'; end if;
  if jsonb_typeof(coalesce(c->'recursos', '[]'::jsonb)) <> 'array' or jsonb_typeof(coalesce(c->'servicios', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(c->'recursos', '[]'::jsonb)) > 40 or jsonb_array_length(coalesce(c->'servicios', '[]'::jsonb)) > 60 then raise exception 'config_invalida'; end if;
  for e in select x from jsonb_array_elements(coalesce(c->'recursos', '[]'::jsonb) || coalesce(c->'servicios', '[]'::jsonb)) x loop
    if coalesce(e->>'id', '') !~ '^[a-z0-9_-]{1,30}$' or coalesce(e->>'nombre', '') = '' then raise exception 'config_invalida'; end if;
  end loop;
  if jsonb_typeof(c->'politicas') is distinct from 'object' then raise exception 'config_invalida'; end if;
  if c ? 'campos' then
    if jsonb_typeof(c->'campos') <> 'array' or jsonb_array_length(c->'campos') > 10 then raise exception 'config_invalida'; end if;
    for e in select x from jsonb_array_elements(c->'campos') x loop
      if coalesce(e->>'id', '') !~ '^[a-z0-9_-]{1,30}$' or length(coalesce(e->>'etiqueta', '')) not between 1 and 80 or coalesce(e->>'tipo', '') not in ('texto', 'numero', 'opciones', 'si')
        or (e->>'tipo' = 'opciones' and (jsonb_typeof(e->'opciones') is distinct from 'array' or jsonb_array_length(e->'opciones') not between 1 and 20)) then raise exception 'config_invalida'; end if;
    end loop;
  end if;
  if c ? 'modulos' then
    if jsonb_typeof(c->'modulos') <> 'object' then raise exception 'config_invalida'; end if;
    for k in select jsonb_object_keys(c->'modulos') loop
      if k not in ('pagos', 'promociones', 'extras', 'avisos', 'espera', 'campos', 'modificar') or jsonb_typeof(c->'modulos'->k) <> 'boolean' then raise exception 'config_invalida'; end if;
    end loop;
  end if;
  if c ? 'promos' then
    select id into pid from demo.items where negocio = new.negocio and col = 'promos' and data->>'agenda' = ag limit 1;
    if pid is null then pid := 'p' || md5(random()::text || clock_timestamp()::text || ag); end if;
    insert into demo.items (negocio, col, id, data) values (new.negocio, 'promos', pid, jsonb_build_object('agenda', ag, 'lista', coalesce(c->'promos', '[]'::jsonb)))
    on conflict (negocio, col, id) do update set data = excluded.data, updated = now();
    new.data := jsonb_set(new.data, '{config}', c - 'promos');
  end if;
  new.data := new.data - 'bloqueos';
  return new;
end $$;
