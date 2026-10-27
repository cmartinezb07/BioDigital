-- 006a · Reservas en el servidor, parte 1: fechas en hora de Chile, ocupación y PRECIO.
-- El precio de una reserva lo calcula SIEMPRE el servidor con la configuración publicada por el dueño (precios, temporadas, descuentos automáticos,
-- códigos y depósito): lo que mande el navegador se ignora. Es el mismo cálculo de motor.js (precio) escrito en SQL; la prueba de paridad
-- (reservas-reglas-e2e.mjs) compara ambos.

create or replace function demo.rv_ms(p_fecha text, p_min int default 0) returns bigint
language sql immutable set search_path = '' as $$
  select (extract(epoch from ((p_fecha::date + make_interval(mins => p_min))::timestamp at time zone 'America/Santiago')) * 1000)::bigint
$$;
create or replace function demo.rv_ahora() returns bigint language sql stable set search_path = '' as $$ select (extract(epoch from now()) * 1000)::bigint $$;
create or replace function demo.rv_hoy() returns text language sql stable set search_path = '' as $$ select to_char(now() at time zone 'America/Santiago', 'YYYY-MM-DD') $$;
create or replace function demo.rv_minh(h text) returns int language sql immutable set search_path = '' as $$
  select split_part(h, ':', 1)::int * 60 + coalesce(nullif(split_part(h, ':', 2), ''), '0')::int $$;
create or replace function demo.rv_clp(n numeric) returns text language sql immutable set search_path = '' as $$
  select '$' || replace(to_char(round(n), 'FM999,999,999,999'), ',', '.') $$;
create or replace function demo.rv_redondea(x float8) returns float8 language sql immutable set search_path = '' as $$ select floor(x + 0.5) $$;   -- como Math.round de JavaScript
create or replace function demo.rv_dia(p_fecha text) returns text language sql immutable set search_path = '' as $$
  select (array['dom','lun','mar','mie','jue','vie','sab'])[extract(dow from p_fecha::date)::int + 1] $$;

-- Temporada que cubre una fecha ('MM-DD'; puede cruzar el fin de año)
create or replace function demo.rv_temporada(p_cfg jsonb, p_fecha text) returns jsonb
language sql immutable set search_path = '' as $$
  select t from jsonb_array_elements(coalesce(p_cfg->'temporadas', '[]'::jsonb)) t
  where case
    when ((substr(t->>'desde', 1, 2) || substr(t->>'desde', 4, 2))::int) <= ((substr(t->>'hasta', 1, 2) || substr(t->>'hasta', 4, 2))::int)
      then ((substr(p_fecha, 6, 2) || substr(p_fecha, 9, 2))::int) between ((substr(t->>'desde', 1, 2) || substr(t->>'desde', 4, 2))::int) and ((substr(t->>'hasta', 1, 2) || substr(t->>'hasta', 4, 2))::int)
    else ((substr(p_fecha, 6, 2) || substr(p_fecha, 9, 2))::int) >= ((substr(t->>'desde', 1, 2) || substr(t->>'desde', 4, 2))::int)
      or ((substr(p_fecha, 6, 2) || substr(p_fecha, 9, 2))::int) <= ((substr(t->>'hasta', 1, 2) || substr(t->>'hasta', 4, 2))::int)
  end limit 1
$$;

-- (Las funciones que cuentan lo ocupado son VOLATILE a propósito: tras esperar el candado de otra reserva ven lo que esa persona acaba de confirmar; con STABLE verían la foto vieja y se podría vender dos veces.)
-- Unidades ocupadas de un recurso entre dos instantes (reservas vigentes + bloqueos). Una retención vencida no cuenta.
create or replace function demo.rv_ocupa(p_neg text, p_ag text, p_rec text, p_d bigint, p_h bigint, p_salvo text) returns numeric
language sql volatile security definer set search_path = '' as $$
  select coalesce((select sum(coalesce((data->>'unidades')::numeric, 1)) from demo.items
      where negocio = p_neg and col = 'reservas' and id <> coalesce(p_salvo, '') and data->>'agenda' = p_ag and data->>'recurso' = p_rec
        and data->>'estado' in ('retenida','confirmada','pagada','checkin','completada','noshow')
        and not (data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) < demo.rv_ahora())
        and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d), 0)
  + coalesce((select sum(coalesce((data->>'unidades')::numeric, 1)) from demo.items
      where negocio = p_neg and col = 'bloqueos' and data->>'agenda' = p_ag and data->>'recurso' = p_rec
        and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d), 0)
$$;
-- Personas ya anotadas en una salida de tour (mismo servicio y misma hora)
create or replace function demo.rv_usados_cupo(p_neg text, p_ag text, p_serv text, p_desde bigint, p_salvo text) returns numeric
language sql volatile security definer set search_path = '' as $$
  select coalesce(sum(coalesce((data->>'personas')::numeric, 1)), 0) from demo.items
  where negocio = p_neg and col = 'reservas' and id <> coalesce(p_salvo, '') and data->>'agenda' = p_ag and data->>'servicio' = p_serv and (data->>'desde')::bigint = p_desde
    and data->>'estado' in ('retenida','confirmada','pagada','checkin','completada','noshow')
    and not (data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) < demo.rv_ahora())
$$;

-- Precio de una selección: base (noches con temporada y fin de semana, personas, servicio u horas) + extras − mejor descuento − código.
create or replace function demo.rv_precio(p_neg text, p_ag text, p_cfg jsonb, p_promos jsonb, p_sel jsonb, p_codigo text, p_ahora bigint, p_salvo text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  modo text := p_cfg->>'modo'; lineas jsonb := '[]'::jsonb; base float8 := 0; extra float8 := 0; bruto float8; descu float8 := 0; motivo text := '';
  inicio bigint := 0; noches int := 0; r jsonb; s jsonb; x text; f text; t jsonb; fin boolean; ds int; ff float8 := coalesce((p_cfg->>'factorFinde')::float8, 1);
  g jsonb; aplica boolean; v float8; pers int := nullif(p_sel->>'personas', '')::int; hrs float8 := nullif(p_sel->>'horas', '')::float8;
  promo jsonb := null; pr jsonb; v2 float8; usos int; total float8; dep float8; cod text := upper(btrim(coalesce(p_codigo, '')));
  pol jsonb := coalesce(p_cfg->'politicas', '{}'::jsonb); i int;
begin
  if modo = 'noches' then
    r := null; select e into r from jsonb_array_elements(p_cfg->'recursos') e where e->>'id' = p_sel->>'recurso';
    if r is null then raise exception 'seleccion'; end if;
    noches := (p_sel->>'salida')::date - (p_sel->>'llegada')::date;
    inicio := demo.rv_ms(p_sel->>'llegada');
    for i in 0 .. noches - 1 loop
      f := ((p_sel->>'llegada')::date + i)::text; t := demo.rv_temporada(p_cfg, f); ds := extract(dow from f::date)::int; fin := ds in (5, 6);
      base := base + demo.rv_redondea((r->>'precio')::float8 * coalesce((t->>'factor')::float8, 1) * case when fin then ff else 1 end / 100) * 100;
    end loop;
    lineas := lineas || jsonb_build_array(jsonb_build_array((r->>'nombre') || ' · ' || noches || case when noches = 1 then ' noche' else ' noches' end, base));
    for x in select jsonb_array_elements_text(coalesce(p_sel->'extras', '[]'::jsonb)) loop
      s := null; select e into s from jsonb_array_elements(coalesce(p_cfg->'servicios', '[]'::jsonb)) e where e->>'id' = x;
      if s is not null then extra := extra + (s->>'precio')::float8; lineas := lineas || jsonb_build_array(jsonb_build_array(s->>'nombre', (s->>'precio')::float8)); end if;
    end loop;
  elsif modo = 'cupos' then
    s := null; select e into s from jsonb_array_elements(p_cfg->'servicios') e where e->>'id' = p_sel->>'servicio';
    if s is null then raise exception 'seleccion'; end if;
    base := (s->>'precio')::float8 * pers; inicio := demo.rv_ms(p_sel->>'fecha', (p_sel->>'min')::int);
    lineas := lineas || jsonb_build_array(jsonb_build_array((s->>'nombre') || ' · ' || pers || case when pers = 1 then ' persona' else ' personas' end, base));
  elsif modo = 'horas' then
    s := null; select e into s from jsonb_array_elements(p_cfg->'servicios') e where e->>'id' = p_sel->>'servicio';
    if s is null then raise exception 'seleccion'; end if;
    base := (s->>'precio')::float8; inicio := demo.rv_ms(p_sel->>'fecha', (p_sel->>'min')::int);
    lineas := lineas || jsonb_build_array(jsonb_build_array(s->>'nombre', base));
  elsif modo = 'bloques' then
    r := null; select e into r from jsonb_array_elements(p_cfg->'recursos') e where e->>'id' = p_sel->>'recurso';
    if r is null then raise exception 'seleccion'; end if;
    base := (r->>'precio')::float8 * hrs; inicio := demo.rv_ms(p_sel->>'fecha', (p_sel->>'min')::int);
    lineas := lineas || jsonb_build_array(jsonb_build_array((r->>'nombre') || ' · ' || (case when hrs = floor(hrs) then hrs::int::text else hrs::text end) || ' h', base));
  else raise exception 'sin_agenda'; end if;
  bruto := base + extra;
  -- Mejor regla automática (no se suman entre sí)
  for g in select e from jsonb_array_elements(coalesce(p_cfg->'reglas', '[]'::jsonb)) e loop
    continue when not coalesce((g->>'activa')::boolean, false);
    aplica := case g->>'tipo'
      when 'anticipada' then ((inicio - p_ahora)::float8 / 864e5) >= (g->>'dias')::float8
      when 'estadia' then noches >= (g->>'noches')::int
      when 'grupo' then coalesce(pers >= (g->>'personas')::int, false)
      when 'ultimo' then ((inicio - p_ahora)::float8 / 36e5) <= (g->>'horas')::float8 and inicio > p_ahora
      when 'duracion' then coalesce(hrs >= (g->>'horas')::float8, false)
      else false end;
    v := demo.rv_redondea(base * (g->>'porcentaje')::float8 / 100);
    if aplica and v > descu then
      descu := v;
      motivo := case g->>'tipo'
        when 'anticipada' then 'Reserva anticipada (' || (g->>'dias') || '+ días) −' || (g->>'porcentaje') || ' %'
        when 'estadia' then 'Estadía de ' || (g->>'noches') || '+ noches −' || (g->>'porcentaje') || ' %'
        when 'grupo' then 'Grupo de ' || (g->>'personas') || '+ personas −' || (g->>'porcentaje') || ' %'
        when 'ultimo' then 'Último minuto −' || (g->>'porcentaje') || ' %'
        when 'duracion' then 'Arriendo de ' || (g->>'horas') || '+ horas −' || (g->>'porcentaje') || ' %' end;
    end if;
  end loop;
  if cod <> '' then
    pr := null; select e into pr from jsonb_array_elements(coalesce(p_promos, '[]'::jsonb)) e where upper(e->>'codigo') = cod limit 1;
    select count(*) into usos from demo.items where negocio = p_neg and col = 'reservas' and id <> coalesce(p_salvo, '') and data->>'agenda' = p_ag
      and data->>'estado' <> 'cancelada' and data->'precio'->'promo'->>'codigo' = cod and (data->'precio'->>'motivo') like '%' || cod || '%';
    if pr is null or not coalesce((pr->>'activa')::boolean, false) or (coalesce((pr->>'usosMax')::int, 0) > 0 and usos >= (pr->>'usosMax')::int) then
      promo := jsonb_build_object('error', 'El código no existe o ya no está vigente.');
    elsif bruto < coalesce((pr->>'minimo')::float8, 0) then
      promo := jsonb_build_object('error', 'Este código pide un mínimo de ' || demo.rv_clp((pr->>'minimo')::numeric) || '.');
    else
      v2 := case when pr->>'tipo' = 'porcentaje' then demo.rv_redondea(bruto * (pr->>'valor')::float8 / 100) else (pr->>'valor')::float8 end;
      promo := jsonb_build_object('codigo', cod, 'valor', v2);
      if v2 > descu then descu := v2; motivo := 'Código ' || cod; else promo := promo || jsonb_build_object('nota', 'Ya tienes un descuento mayor; no se suman.'); end if;
    end if;
  end if;
  if descu > 0 then lineas := lineas || jsonb_build_array(jsonb_build_array(motivo, -descu)); end if;
  total := greatest(0, bruto - descu); dep := demo.rv_redondea(total * coalesce((pol->>'deposito')::float8, 0) / 100);
  return jsonb_build_object('lineas', lineas, 'bruto', bruto, 'descuento', descu, 'motivo', motivo, 'total', total, 'deposito', dep, 'saldo', total - dep, 'promo', promo, 'noches', noches);
end $$;
