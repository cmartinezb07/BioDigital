-- 006c · Reservas en el servidor, parte 3: armar la reserva, estados por rol, avisos y disparadores.
-- Reglas (todas en la base; el navegador no puede saltárselas):
--  · Precio, depósito, fechas, recurso y disponibilidad los calcula el servidor con la configuración publicada por el dueño.
--  · El cliente (con el código secreto de su reserva) puede: crearla, modificarla mientras esté retenida/confirmada/pagada y falte el tiempo
--    mínimo de la política, y cancelarla antes de que empiece. Nada más. Pagar en línea solo si la configuración lo permite (demostración).
--  · Recepción y jefe: confirmar, registrar pago, check-in, no llegó, completar y cancelar. Config y promos solo el jefe.
--  · Una retención vencida libera el cupo y no se puede reactivar. Máximo 2 retenciones vigentes por correo.
--  · Cada cambio queda en el historial con quién y cuándo; cada modificación guarda la versión anterior.

create or replace function demo.rv_sel(p jsonb) returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'recurso', case when p->>'recurso' ~ '^[a-z0-9_-]{1,30}$' then p->>'recurso' end,
    'servicio', case when p->>'servicio' ~ '^[a-z0-9_-]{1,30}$' then p->>'servicio' end,
    'llegada', case when p->>'llegada' ~ '^\d{4}-\d{2}-\d{2}$' then p->>'llegada' end,
    'salida', case when p->>'salida' ~ '^\d{4}-\d{2}-\d{2}$' then p->>'salida' end,
    'fecha', case when p->>'fecha' ~ '^\d{4}-\d{2}-\d{2}$' then p->>'fecha' end,
    'min', case when p->>'min' ~ '^\d{1,4}$' then (p->>'min')::int end,
    'personas', case when p->>'personas' ~ '^\d{1,3}$' then (p->>'personas')::int end,
    'horas', case when p->>'horas' ~ '^\d{1,2}$' then (p->>'horas')::int end,
    'extras', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select x from jsonb_array_elements_text(case when jsonb_typeof(p->'extras') = 'array' then p->'extras' else '[]'::jsonb end) x where x ~ '^[a-z0-9_-]{1,30}$' limit 10) q)
  ))
$$;
create or replace function demo.rv_cfg(p_neg text, p_ag text) returns jsonb language sql stable security definer set search_path = '' as $$
  select data->'config' from demo.items where negocio = p_neg and col = 'config' and id = 'cfg-' || p_ag $$;
create or replace function demo.rv_promos(p_neg text, p_ag text) returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(data->'lista', '[]'::jsonb) from demo.items where negocio = p_neg and col = 'promos' and data->>'agenda' = p_ag limit 1 $$;
create or replace function demo.rv_codigo(p_neg text) returns text language plpgsql volatile security definer set search_path = '' as $$
declare s text; i int;
begin
  loop
    s := '';
    for i in 1 .. 6 loop s := s || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1); end loop;
    exit when not exists (select 1 from demo.items where negocio = p_neg and col = 'reservas' and data->>'codigo' = s);
  end loop;
  return s;
end $$;
create or replace function demo.rv_pub(p jsonb) returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('n', p->>'agenda', 'm', case p->>'modo' when 'noches' then 'n' when 'cupos' then 'c' when 'horas' then 'h' else 'b' end,
    'r', (p->>'agenda') || ':' || (p->>'recurso') || case when p->>'modo' = 'cupos' then ':' || (p->>'desde') else '' end,
    'd', p->'desde', 'h', p->'hasta', 'u', case when p->>'modo' = 'cupos' then p->'personas' else to_jsonb(coalesce((p->>'unidades')::int, 1)) end,
    'e', p->>'estado', 'x', case when jsonb_typeof(p->'expira') = 'number' then p->'expira' else '0'::jsonb end)
$$;
create or replace function demo.rv_reembolso(p_cfg jsonb, p_r jsonb, p_ahora bigint) returns jsonb language sql stable set search_path = '' as $$
  with h as (select ((p_r->>'desde')::bigint - p_ahora)::float8 / 3600000 as h),
  t as (select e from jsonb_array_elements(coalesce(p_cfg->'politicas'->'cancelacion', '[]'::jsonb)) e, h where h.h >= (e->>'horas')::float8 order by (e->>'horas')::float8 desc limit 1)
  select jsonb_build_object('porcentaje', coalesce((select (e->>'reembolso')::float8 from t), 0),
    'monto', demo.rv_redondea(coalesce((p_r->>'pagado')::float8, 0) * coalesce((select (e->>'reembolso')::float8 from t), 0) / 100),
    'horas', greatest(0, floor((select h from h)))::int)
$$;

-- ---------- Avisos (correo y WhatsApp; en la demostración quedan registrados, no salen) ----------
create or replace function demo.rv_fmt(p_ms bigint) returns text language sql immutable set search_path = '' as $$
  select (array['dom','lun','mar','mié','jue','vie','sáb'])[extract(dow from ts)::int + 1] || ' ' || extract(day from ts)::int || ' ' || (array['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'])[extract(month from ts)::int]
  from (select to_timestamp(p_ms / 1000.0) at time zone 'America/Santiago' as ts) q $$;
create or replace function demo.rv_fechahora(p_cfg jsonb, p_r jsonb) returns text language sql immutable set search_path = '' as $$
  select case when p_cfg->>'modo' = 'noches' then demo.rv_fmt((p_r->>'desde')::bigint) || ' al ' || demo.rv_fmt((p_r->>'hasta')::bigint)
    else demo.rv_fmt((p_r->>'desde')::bigint) || ' a las ' || to_char(to_timestamp((p_r->>'desde')::bigint / 1000.0) at time zone 'America/Santiago', 'HH24:MI') end $$;
create or replace function demo.rv_texto(p_cfg jsonb, p_r jsonb, p_tipo text) returns text language sql immutable set search_path = '' as $$
  select case p_tipo
    when 'confirmacion' then case when p_r->>'estado' = 'retenida' then 'Reservamos tu cupo por ' || coalesce(p_cfg->'politicas'->>'retencionMin', '10') || ' minutos. Paga el depósito para confirmar ' || (p_cfg->>'nombre') || ' (' || demo.rv_fechahora(p_cfg, p_r) || '). Código ' || (p_r->>'codigo') || '.'
      else 'Tu reserva en ' || (p_cfg->>'nombre') || ' está confirmada: ' || demo.rv_fechahora(p_cfg, p_r) || '. Código ' || (p_r->>'codigo') || '.' end
    when 'recordatorio' then 'Recordatorio: te esperamos en ' || (p_cfg->>'nombre') || ' el ' || demo.rv_fechahora(p_cfg, p_r) || '. Si no puedes venir, cancela desde tu enlace.'
    when 'resena' then '¿Cómo te fue en ' || (p_cfg->>'nombre') || '? Cuéntanos en 1 minuto.'
    when 'cancelacion' then 'Tu reserva ' || (p_r->>'codigo') || ' en ' || (p_cfg->>'nombre') || ' fue cancelada.' || case when coalesce((p_r->'reembolso'->>'monto')::numeric, 0) > 0 then ' Te devolvemos ' || demo.rv_clp((p_r->'reembolso'->>'monto')::numeric) || '.' else '' end
    when 'espera' then 'Se liberó un cupo en ' || (p_cfg->>'nombre') || ' para la fecha que esperabas. Reserva antes que otro.'
    else '' end $$;
create or replace function demo.rv_aviso(p_neg text, p_cfg jsonb, p_r jsonb, p_tipo text, p_cuando bigint) returns void language plpgsql volatile security definer set search_path = '' as $$
declare cfg jsonb := p_cfg->'notif'->p_tipo; can text; para text; aid text;
begin
  if cfg is null or not coalesce((cfg->>'activo')::boolean, false) then return; end if;
  foreach can in array array['correo', 'whatsapp'] loop
    continue when not coalesce((cfg->>can)::boolean, false);
    para := case when can = 'correo' then p_r->'cliente'->>'correo' else p_r->'cliente'->>'telefono' end;
    continue when coalesce(para, '') = '';
    aid := 'a' || substr(md5((p_r->>'id') || p_tipo || can || p_cuando::text), 1, 14);
    insert into demo.items (negocio, col, id, data) values (p_neg, 'avisos', aid, jsonb_build_object('id', aid, 'neg', p_r->>'agenda', 'reserva', p_r->>'id', 'codigo', p_r->>'codigo', 'tipo', p_tipo, 'canal', can, 'para', para, 'cuando', p_cuando, 'estado', 'programado', 'texto', demo.rv_texto(p_cfg, p_r, p_tipo)))
    on conflict (negocio, col, id) do nothing;
  end loop;
end $$;
create or replace function demo.rv_programar(p_neg text, p_cfg jsonb, p_r jsonb, p_pago boolean) returns void language plpgsql volatile security definer set search_path = '' as $$
declare ahora bigint := demo.rv_ahora(); rec jsonb := p_cfg->'notif'->'recordatorio';
begin
  delete from demo.items where negocio = p_neg and col = 'avisos' and data->>'reserva' = p_r->>'id' and data->>'estado' = 'programado';
  perform demo.rv_aviso(p_neg, p_cfg, p_r, 'confirmacion', ahora);
  if p_pago then return; end if;
  if rec is not null and coalesce((rec->>'activo')::boolean, false) then perform demo.rv_aviso(p_neg, p_cfg, p_r, 'recordatorio', greatest(ahora, (p_r->>'desde')::bigint - (coalesce((rec->>'horas')::numeric, 24) * 3600000)::bigint)); end if;
  perform demo.rv_aviso(p_neg, p_cfg, p_r, 'resena', (p_r->>'hasta')::bigint + 7200000);
end $$;
create or replace function demo.rv_espera_liberada(p_neg text, p_cfg jsonb, p_r jsonb) returns void language plpgsql volatile security definer set search_path = '' as $$
declare e record; sel jsonb; mismo boolean; previo text := current_setting('demo.rol', true); ahora bigint := demo.rv_ahora();
begin
  for e in select id, data from demo.items where negocio = p_neg and col = 'espera' and data->>'agenda' = p_r->>'agenda' and not coalesce((data->>'avisado')::boolean, false) loop
    sel := e.data->'sel';
    if p_cfg->>'modo' = 'noches' then
      mismo := (sel->>'recurso') = (p_r->>'recurso') and sel->>'llegada' is not null and sel->>'salida' is not null and demo.rv_ms(sel->>'llegada') < (p_r->>'hasta')::bigint and demo.rv_ms(sel->>'salida') > (p_r->>'desde')::bigint;
    else
      mismo := ((sel->>'servicio') = (p_r->>'servicio') or (sel->>'recurso') = (p_r->>'recurso')) and (sel->>'fecha') = to_char(to_timestamp((p_r->>'desde')::bigint / 1000.0) at time zone 'America/Santiago', 'YYYY-MM-DD');
    end if;
    if coalesce(mismo, false) then
      perform set_config('demo.rol', 'sistema', true);
      update demo.items set data = data || '{"avisado":true}'::jsonb, updated = now() where negocio = p_neg and col = 'espera' and id = e.id;
      perform set_config('demo.rol', coalesce(previo, ''), true);
      perform demo.rv_aviso(p_neg, p_cfg, jsonb_build_object('id', e.id, 'agenda', p_r->>'agenda', 'codigo', 'ESPERA', 'cliente', e.data->'cliente', 'desde', p_r->'desde'), 'espera', ahora);
    end if;
  end loop;
end $$;

-- ---------- Armar una reserva (crear o modificar) ----------
create or replace function demo.rv_armar(p_neg text, p_id text, p_new jsonb, p_old jsonb, p_rol text, p_nom text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  ag text := coalesce(p_old->>'agenda', p_new->>'agenda'); cfg jsonb; promos jsonb; sel jsonb; cin jsonb; cli jsonb; res jsonb; pr jsonb; ahora bigint := demo.rv_ahora();
  staff boolean := p_rol in ('dueno', 'recepcion'); pol jsonb; dep numeric; con_dep boolean; est text; exp bigint; doc jsonb; canal text; promo text; tel text; n_ret int; edic jsonb; sin_pago boolean;
begin
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' then raise exception 'sin_agenda'; end if;
  cfg := demo.rv_cfg(p_neg, ag);
  if cfg is null then raise exception 'sin_agenda'; end if;
  promos := demo.rv_promos(p_neg, ag); pol := coalesce(cfg->'politicas', '{}'::jsonb);
  perform pg_advisory_xact_lock(hashtext(p_neg || ':rv:' || ag));
  sel := demo.rv_sel(coalesce(p_new->'sel', p_old->'sel'));
  cin := coalesce(p_new->'cliente', p_old->'cliente', '{}'::jsonb);
  if length(btrim(coalesce(cin->>'nombre', ''))) < 3 or length(btrim(cin->>'nombre')) > 60 then raise exception 'datos:nombre'; end if;
  if lower(btrim(coalesce(cin->>'correo', ''))) !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(cin->>'correo') > 120 then raise exception 'datos:correo'; end if;
  tel := regexp_replace(coalesce(cin->>'telefono', ''), '[^0-9+]', '', 'g');
  if length(regexp_replace(tel, '\D', '', 'g')) not between 8 and 15 then raise exception 'datos:telefono'; end if;
  cli := jsonb_build_object('nombre', btrim(cin->>'nombre'), 'correo', lower(btrim(cin->>'correo')), 'telefono', left(tel, 20), 'pais', left(coalesce(nullif(btrim(cin->>'pais'), ''), 'Chile'), 40), 'idioma', case when cin->>'idioma' in ('es', 'en', 'pt') then cin->>'idioma' else 'es' end);
  promo := upper(btrim(coalesce(p_new->>'codigoPromo', '')));
  if promo !~ '^[A-Z0-9]{0,20}$' then promo := ''; end if;
  res := demo.rv_resolver(p_neg, ag, cfg, sel, ahora, case when p_old is null then null else p_id end);
  pr := demo.rv_precio(p_neg, ag, cfg, promos, sel, promo, ahora, case when p_old is null then null else p_id end);

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
      'extras', coalesce(sel->'extras', '[]'::jsonb), 'desde', res->'desde', 'hasta', res->'hasta', 'personas', res->'personas', 'horas', res->'horas', 'unidades', 1, 'cliente', cli, 'precio', pr, 'pagado', 0, 'moneda', 'CLP',
      'estado', est, 'expira', exp, 'canal', canal, 'idioma', cli->>'idioma', 'sel', sel, 'codigoPromo', promo, 'rev', 1, 'ediciones', '[]'::jsonb,
      'historial', jsonb_build_array(jsonb_build_object('estado', est, 't', ahora, 'por', p_rol, 'quien', p_nom)));
  end if;

  -- modificar: se conserva el código, el estado, el pago y el historial; la versión anterior queda guardada
  edic := coalesce(p_old->'ediciones', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('rev', p_old->'rev', 't', ahora, 'sel', p_old->'sel', 'desde', p_old->'desde', 'hasta', p_old->'hasta', 'recurso', p_old->>'recurso', 'total', p_old->'precio'->'total', 'por', p_rol));
  doc := p_old || jsonb_build_object('recurso', res->>'recurso', 'servicio', res->'servicio', 'extras', coalesce(sel->'extras', '[]'::jsonb), 'desde', res->'desde', 'hasta', res->'hasta', 'personas', res->'personas', 'horas', res->'horas',
    'cliente', cli, 'precio', pr, 'sel', sel, 'codigoPromo', promo, 'rev', (p_old->>'rev')::int + 1, 'ediciones', edic, 'ajuste', (pr->>'total')::numeric - coalesce((p_old->>'pagado')::numeric, 0));
  return jsonb_set(doc, '{historial}', (p_old->'historial') || jsonb_build_array(jsonb_build_object('estado', p_old->>'estado', 't', ahora, 'por', p_rol, 'quien', p_nom, 'modificada', true)));
end $$;

-- ---------- Cambiar de estado ----------
create or replace function demo.rv_transicion(p_neg text, p_r jsonb, p_a text, p_patch jsonb, p_rol text, p_nom text, p_cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  de text := p_r->>'estado'; staff boolean := p_rol in ('dueno', 'recepcion'); ahora bigint := demo.rv_ahora(); r jsonb := p_r; ok boolean;
  vencida boolean := (p_r->>'estado' = 'retenida' and coalesce((p_r->>'expira')::bigint, 0) < demo.rv_ahora()); antes boolean := (p_r->>'desde')::bigint > demo.rv_ahora();
  pagado numeric; por text := p_rol;
begin
  ok := case
    when staff then (de = 'retenida' and p_a in ('confirmada', 'pagada', 'cancelada')) or (de = 'confirmada' and p_a in ('pagada', 'checkin', 'cancelada', 'noshow', 'completada'))
      or (de = 'pagada' and p_a in ('checkin', 'cancelada', 'noshow', 'completada')) or (de = 'checkin' and p_a in ('completada', 'cancelada'))
    else (de = 'retenida' and p_a = 'pagada' and coalesce((p_cfg->>'pagoDemo')::boolean, false)) or (de in ('retenida', 'confirmada', 'pagada') and p_a = 'cancelada' and antes) end;
  if vencida and p_a = 'cancelada' then ok := true; por := 'sistema'; end if;   -- cualquiera puede cerrar una retención vencida (queda a nombre del sistema)
  if not ok then raise exception 'transicion_invalida:%:%', de, p_a; end if;
  if vencida and p_a in ('pagada', 'confirmada') then raise exception 'retencion_vencida'; end if;
  if p_a in ('noshow', 'completada') and de <> 'checkin' and (p_r->>'desde')::bigint > ahora then raise exception 'aun_no'; end if;
  r := jsonb_set(r, '{estado}', to_jsonb(p_a));
  r := jsonb_set(r, '{historial}', (r->'historial') || jsonb_build_array(jsonb_build_object('estado', p_a, 't', ahora, 'por', por, 'quien', case when por = 'sistema' then 'vencimiento' else p_nom end)));
  if p_a in ('confirmada', 'pagada') then r := jsonb_set(r, '{expira}', 'null'::jsonb); end if;
  if p_a = 'pagada' then
    pagado := case when staff then least((p_r->'precio'->>'total')::numeric, greatest(0, coalesce(nullif(p_patch->>'pagado', '')::numeric, (p_r->'precio'->>'total')::numeric))) else (p_r->'precio'->>'deposito')::numeric end;
    r := jsonb_set(r, '{pagado}', to_jsonb(pagado));
  end if;
  if p_a = 'cancelada' then
    r := r || jsonb_build_object('reembolso', demo.rv_reembolso(p_cfg, r, ahora), 'canceladaPor', case when por = 'sistema' then 'sistema: no se pagó a tiempo' when staff then 'negocio' else 'cliente' end);
  end if;
  if p_a in ('confirmada', 'pagada') then perform demo.rv_programar(p_neg, p_cfg, r, false);
  elsif p_a = 'cancelada' then
    delete from demo.items where negocio = p_neg and col = 'avisos' and data->>'reserva' = r->>'id' and data->>'estado' = 'programado';
    perform demo.rv_aviso(p_neg, p_cfg, r, 'cancelacion', ahora);
    perform demo.rv_espera_liberada(p_neg, p_cfg, r);
  end if;
  return r;
end $$;

-- ---------- Disparadores ----------
create or replace function demo.reserva_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); nom text := coalesce(current_setting('demo.nombre', true), '');
  staff boolean; o jsonb; n jsonb; r jsonb; cfg jsonb; ahora bigint := demo.rv_ahora(); horas_min numeric;
begin
  if rol = 'sistema' then return new; end if;   -- cargas masivas (nube_importar)
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
  if (n->'sel') is distinct from (o->'sel') or (n->'cliente') is distinct from (o->'cliente') or coalesce(n->>'codigoPromo', '') <> coalesce(o->>'codigoPromo', '') then
    if o->>'estado' not in ('retenida', 'confirmada', 'pagada') then raise exception 'no_modificable'; end if;
    if not staff then
      if coalesce(n->>'baseRev', '') <> coalesce(o->>'rev', '') then raise exception 'conflicto'; end if;
      horas_min := coalesce((cfg->'politicas'->>'modificarHoras')::numeric, 24);
      if ((o->>'desde')::bigint - ahora) < horas_min * 3600000 then raise exception 'tarde_modificar:%', horas_min; end if;
      if o->>'estado' = 'retenida' and coalesce((o->>'expira')::bigint, 0) < ahora then raise exception 'retencion_vencida'; end if;
    end if;
    r := demo.rv_armar(new.negocio, new.id, n, o, rol, nom);
  end if;
  if (n->>'estado') is distinct from (o->>'estado') then
    r := demo.rv_transicion(new.negocio, r, n->>'estado', n, rol, nom, cfg);
  end if;
  new.data := r; new.pub := demo.rv_pub(r);
  return new;
end $$;
drop trigger if exists reserva_reglas on demo.items;
create trigger reserva_reglas before insert or update on demo.items for each row when (new.col = 'reservas') execute function demo.reserva_reglas();

-- Lista de espera: el cliente solo la crea (con datos mínimos); marcar "avisada" lo hace el equipo o el sistema
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
  cin := coalesce(new.data->'cliente', '{}'::jsonb);
  if length(btrim(coalesce(cin->>'nombre', ''))) < 2 or length(cin->>'nombre') > 60 then raise exception 'datos:nombre'; end if;
  tel := regexp_replace(coalesce(cin->>'telefono', ''), '[^0-9+]', '', 'g');
  if lower(btrim(coalesce(cin->>'correo', ''))) !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and length(regexp_replace(tel, '\D', '', 'g')) not between 8 and 15 then raise exception 'datos:contacto'; end if;
  new.data := jsonb_build_object('id', new.id, 'neg', ag, 'agenda', ag, 't', demo.rv_ahora(), 'avisado', false, 'sel', demo.rv_sel(new.data->'sel'),
    'cliente', jsonb_build_object('nombre', btrim(cin->>'nombre'), 'correo', left(lower(btrim(coalesce(cin->>'correo', ''))), 120), 'telefono', left(tel, 20)));
  return new;
end $$;
drop trigger if exists espera_reglas on demo.items;
create trigger espera_reglas before insert or update on demo.items for each row when (new.col = 'espera') execute function demo.espera_reglas();

-- Bloqueos de fechas (equipo): se publican sin motivo ni nombres
create or replace function demo.bloqueo_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); ag text := coalesce(new.data->>'agenda', new.data->>'neg'); d bigint; h bigint;
begin
  if rol = 'sistema' then return new; end if;
  if rol not in ('dueno', 'recepcion') then raise exception 'sin permiso'; end if;
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' or coalesce(new.data->>'recurso', '') !~ '^[a-z0-9_-]{1,30}$' or coalesce(new.data->>'desde', '') !~ '^\d{10,14}$' or coalesce(new.data->>'hasta', '') !~ '^\d{10,14}$' then raise exception 'bloqueo_invalido'; end if;
  d := (new.data->>'desde')::bigint; h := (new.data->>'hasta')::bigint;
  if h <= d or h - d > 400 * 86400000::bigint then raise exception 'bloqueo_invalido'; end if;
  new.data := jsonb_build_object('id', new.id, 'agenda', ag, 'neg', ag, 'recurso', new.data->>'recurso', 'desde', d, 'hasta', h, 'motivo', left(coalesce(new.data->>'motivo', 'Bloqueo manual'), 80), 'origen', left(coalesce(new.data->>'origen', 'manual'), 40), 'unidades', 1);
  new.pub := jsonb_build_object('n', ag, 'm', 'x', 'r', ag || ':' || (new.data->>'recurso'), 'd', d, 'h', h, 'u', 1, 'e', 'bloqueo', 'x', 0);
  return new;
end $$;
drop trigger if exists bloqueo_reglas on demo.items;
create trigger bloqueo_reglas before insert or update on demo.items for each row when (new.col = 'bloqueos') execute function demo.bloqueo_reglas();

-- Configuración publicada por el dueño: se valida su forma y los códigos de descuento se guardan aparte (nunca públicos)
create or replace function demo.config_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); c jsonb; ag text; e jsonb; pid text;
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
  if c ? 'promos' then
    -- el identificador de los códigos es un azar largo: quien no es del equipo no puede adivinarlo (los clientes leen por identificador)
    select id into pid from demo.items where negocio = new.negocio and col = 'promos' and data->>'agenda' = ag limit 1;
    if pid is null then pid := 'p' || md5(random()::text || clock_timestamp()::text || ag); end if;
    insert into demo.items (negocio, col, id, data) values (new.negocio, 'promos', pid, jsonb_build_object('agenda', ag, 'lista', coalesce(c->'promos', '[]'::jsonb)))
    on conflict (negocio, col, id) do update set data = excluded.data, updated = now();
    new.data := jsonb_set(new.data, '{config}', c - 'promos');
  end if;
  new.data := new.data - 'bloqueos';
  return new;
end $$;
drop trigger if exists config_reglas on demo.items;
create trigger config_reglas before insert or update on demo.items for each row when (new.col = 'config') execute function demo.config_reglas();

-- Cotización pública: el cliente ve el precio calculado por el servidor (con su código de descuento) antes de reservar
create or replace function public.reserva_cotizar(p_neg text, p_ag text, p_sel jsonb, p_codigo text default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare cfg jsonb := demo.rv_cfg(p_neg, p_ag); sel jsonb := demo.rv_sel(p_sel); res jsonb; pr jsonb; cod text := upper(btrim(coalesce(p_codigo, '')));
begin
  if cfg is null then return jsonb_build_object('error', 'sin_agenda'); end if;
  if cod !~ '^[A-Z0-9]{0,20}$' then cod := ''; end if;
  begin res := demo.rv_resolver(p_neg, p_ag, cfg, sel, demo.rv_ahora(), null); exception when others then return jsonb_build_object('error', sqlerrm); end;
  pr := demo.rv_precio(p_neg, p_ag, cfg, demo.rv_promos(p_neg, p_ag), sel, cod, demo.rv_ahora(), null);
  return jsonb_build_object('ok', true, 'precio', pr, 'desde', res->'desde', 'hasta', res->'hasta', 'recurso', res->>'recurso');
end $$;
revoke all on function public.reserva_cotizar(text, text, jsonb, text) from public;
grant execute on function public.reserva_cotizar(text, text, jsonb, text) to anon, authenticated;
