-- 011 · El cupo por conexión (009) no aplica a los negocios de prueba "zz-*" (1-nov-2026).
-- Las pruebas de reglas (reservas-reglas-e2e, nube-e2e) crean decenas de reservas seguidas desde una sola conexión y se topaban con el
-- límite de 40 por hora. Los negocios "zz-*" solo existen mientras corre una prueba; un cliente real nunca se llama así.
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
  return cuenta <= tope;
end $f$;
