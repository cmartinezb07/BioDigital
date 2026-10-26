-- 006b · Reservas en el servidor, parte 2: validar una selección y resolver sus fechas, recurso y disponibilidad.
-- Los errores salen como texto corto (sqlerrm) y el navegador los traduce: seleccion, fechas, estadia_larga, estadia_min:N, capacidad:N, ya_paso, lejos,
-- sin_salida, fuera_horario, minimo_personas:N, cupos:N, horas_min:N, horas_max, ocupado.
-- Devuelve { recurso, servicio, desde, hasta, personas, horas, unidades }.
create or replace function demo.rv_resolver(p_neg text, p_ag text, p_cfg jsonb, p_sel jsonb, p_ahora bigint, p_salvo text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  modo text := p_cfg->>'modo'; pol jsonb := coalesce(p_cfg->'politicas', '{}'::jsonb); r jsonb; s jsonb; a bigint; b bigint; desde_lim bigint; hasta_lim bigint;
  pers int; hrs int; dur int; paso int; buf int; ok boolean; i0 int; i1 int; mn int; tr jsonb; rec text; unid numeric; n int; i int; f text; alta jsonb;
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
