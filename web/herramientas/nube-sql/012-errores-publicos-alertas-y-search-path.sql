-- 012 · Errores sin datos internos, registro de alertas y search_path de transicion_ok (1-nov-2026). Auditoría security-audit.
--  · nube_escribir y reserva_cotizar devolvían sqlerrm tal cual al navegador (nombres de tablas y restricciones, errores de cast). Ahora
--    demo.err_publico() deja pasar los códigos propios de las reglas ("sin permiso", "plato_agotado:Pizza", "conflicto"...) y cambia
--    cualquier error interno de la base por "error_interno".
--  · demo.alertas: historial (90 días) de ataques detectados: una fila cuando una conexión cruza el límite de PIN (30 por negocio u 80 en
--    total) o el cupo de creaciones. Para mirarlo:  select * from demo.alertas order by t desc limit 50;
--  · demo.transicion_ok tenía el search_path sin fijar.
-- Se aplica sobre las funciones vivas con reemplazos exactos; es seguro volver a correrla.

create table if not exists demo.alertas (id bigserial primary key, t timestamptz not null default now(), tipo text not null, negocio text, ip text, detalle text);
alter table demo.alertas enable row level security;

create or replace function demo.err_publico(m text) returns text language sql immutable set search_path to '' as $f$
  select case when m is null then 'error'
              when length(m) > 160 or m ~* '(violates|invalid input|relation "|column "|constraint|syntax|does not exist|permission denied|null value|out of range|division by zero|function |operator |type )'
              then 'error_interno' else m end
$f$;

alter function demo.transicion_ok(text, text, text, text) set search_path to '';

create or replace function demo.pin_fallo(p_neg text) returns void language plpgsql security definer set search_path to '' as $f$
declare ip text := demo.ip_cliente(); k text; v int;
begin
  if ip = '?' then return; end if;
  delete from demo.pin_fallos where desde < now() - interval '1 hour';
  foreach k in array array[coalesce(p_neg, '?') || '|' || ip, '*|' || ip] loop
    insert into demo.pin_fallos (clave, desde, n) values (k, now(), 1)
    on conflict (clave) do update set
      n = case when demo.pin_fallos.desde < now() - interval '10 minutes' then 1 else demo.pin_fallos.n + 1 end,
      desde = case when demo.pin_fallos.desde < now() - interval '10 minutes' then now() else demo.pin_fallos.desde end
    returning n into v;
    if (left(k, 2) = '*|' and v = 80) or (left(k, 2) <> '*|' and v = 30) then
      delete from demo.alertas where t < now() - interval '90 days';
      insert into demo.alertas (tipo, negocio, ip, detalle) values ('pin_bloqueo', case when left(k, 2) = '*|' then null else p_neg end, ip, v || ' PIN fallidos en 10 minutos');
    end if;
  end loop;
end $f$;

create or replace function demo.cupo_ip(p_neg text, p_col text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare ip text := demo.ip_cliente(); k text; tope int; cuenta int;
begin
  if ip = '?' or p_neg like 'zz-%' then return true; end if;
  k := p_neg || '|' || p_col || '|' || ip;
  tope := case p_col when 'pedidos' then 120 when 'visitas' then 1000 when 'eventos' then 300 else 40 end;
  delete from demo.cupo_ip_log where desde < now() - interval '2 hours';
  insert into demo.cupo_ip_log (clave, desde, n) values (k, now(), 1)
  on conflict (clave) do update set
    n = case when demo.cupo_ip_log.desde < now() - interval '1 hour' then 1 else demo.cupo_ip_log.n + 1 end,
    desde = case when demo.cupo_ip_log.desde < now() - interval '1 hour' then now() else demo.cupo_ip_log.desde end
  returning n into cuenta;
  if cuenta = tope + 1 then
    insert into demo.alertas (tipo, negocio, ip, detalle) values ('cupo_excedido', p_neg, ip, p_col || ': más de ' || tope || ' creaciones en una hora');
  end if;
  return cuenta <= tope;
end $f$;

do $m$
declare f regprocedure; d text; antes text;
begin
  foreach f in array array['public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure, 'public.reserva_cotizar(text,text,jsonb,text)'::regprocedure] loop
    d := regexp_replace(regexp_replace(pg_get_functiondef(f), '--[^\n]*', '', 'g'), '\s+', ' ', 'g');
    if position('demo.err_publico(sqlerrm)' in d) > 0 then continue; end if;
    antes := d;
    d := replace(d, 'jsonb_build_object(''error'', sqlerrm)', 'jsonb_build_object(''error'', demo.err_publico(sqlerrm))');
    if d = antes then raise exception '012: no se encontró sqlerrm en %', f; end if;
    execute d;
  end loop;
end
$m$;
