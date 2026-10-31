-- 009 · Límite de intentos de PIN y cupo de creaciones por conexión (1-nov-2026). Auditoría security-audit, hallazgos 1 y 4.
--  · PIN: antes se podía probar sin límite con nube_quien/nube_rol/nube_leer/nube_escribir (oráculo) y el PIN de dueño abre
--    todos los PIN del personal. Ahora cada fallo se cuenta por (negocio + conexión) y por conexión en total; pasado el límite
--    (30 fallos por negocio o 80 en total en 10 min) esa conexión no puede validar PIN hasta que pase la ventana. Cuenta por
--    conexión, no por negocio, para que un atacante no pueda dejar fuera al personal real. El fallo se registra SIN lanzar
--    excepción (si no, la base lo revertiría). Si la conexión es desconocida ('?') no se limita nada (no bloquear a todos).
--  · PIN nuevo del personal: mínimo 6 dígitos. nube_borrar/nube_vaciar ahora exigen PIN activo (antes no).
--  · Tope de filas (maximo): cada conexión puede crear a lo más N filas por hora y colección (pedidos 120, visitas 1000,
--    eventos 300, el resto 40), para que una sola conexión no pueda llenar el tope y bloquear a los clientes reales.
-- Se aplica sobre las funciones vivas con reemplazos exactos; es seguro volver a correrla.

create table if not exists demo.pin_fallos (clave text primary key, desde timestamptz not null default now(), n int not null default 0);
create table if not exists demo.cupo_ip_log (clave text primary key, desde timestamptz not null default now(), n int not null default 0);
alter table demo.pin_fallos enable row level security;
alter table demo.cupo_ip_log enable row level security;

create or replace function demo.ip_cliente() returns text language plpgsql stable set search_path to '' as $f$
declare h json; ip text;
begin
  begin h := nullif(current_setting('request.headers', true), '')::json; exception when others then h := null; end;
  ip := coalesce(nullif(h->>'cf-connecting-ip', ''), nullif(h->>'x-real-ip', ''),
                 nullif(trim(regexp_replace(coalesce(h->>'x-forwarded-for', ''), '^.*,', '')), ''), '?');
  return left(ip, 64);
end $f$;

create or replace function demo.bloqueado(p_neg text) returns boolean language sql stable security definer set search_path to '' as $f$
  select demo.ip_cliente() <> '?' and exists (select 1 from demo.pin_fallos f
    where f.desde > now() - interval '10 minutes'
      and ((f.clave = coalesce(p_neg, '?') || '|' || demo.ip_cliente() and f.n >= 30) or (f.clave = '*|' || demo.ip_cliente() and f.n >= 80)))
$f$;

create or replace function demo.pin_fallo(p_neg text) returns void language plpgsql security definer set search_path to '' as $f$
declare ip text := demo.ip_cliente(); k text;
begin
  if ip = '?' then return; end if;
  delete from demo.pin_fallos where desde < now() - interval '1 hour';
  foreach k in array array[coalesce(p_neg, '?') || '|' || ip, '*|' || ip] loop
    insert into demo.pin_fallos (clave, desde, n) values (k, now(), 1)
    on conflict (clave) do update set
      n = case when demo.pin_fallos.desde < now() - interval '10 minutes' then 1 else demo.pin_fallos.n + 1 end,
      desde = case when demo.pin_fallos.desde < now() - interval '10 minutes' then now() else demo.pin_fallos.desde end;
  end loop;
end $f$;

create or replace function demo.es_dueno(p_neg text, p_pin text) returns boolean language plpgsql security definer set search_path to '' as $f$
begin
  if p_pin is null or demo.bloqueado(p_neg) then return false; end if;
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo) then
    perform demo.pin_fallo(p_neg); return false;
  end if;
  return exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array['*']);
end $f$;

create or replace function demo.puede(p_neg text, p_col text, p_pin text) returns boolean language plpgsql security definer set search_path to '' as $f$
begin
  if p_pin is null or demo.bloqueado(p_neg) then return false; end if;
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo) then
    perform demo.pin_fallo(p_neg); return false;
  end if;
  return exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and (r.cols @> array['*'] or r.cols @> array[p_col]));
end $f$;

create or replace function public.nube_quien(p_neg text, p_pin text) returns jsonb language plpgsql security definer set search_path to '' as $f$
declare r jsonb;
begin
  if p_pin is null or demo.bloqueado(p_neg) then return null; end if;
  select jsonb_build_object('rol', rol, 'nombre', nombre) into r from demo.roles where negocio = p_neg and pin = p_pin and activo limit 1;
  if r is null then perform demo.pin_fallo(p_neg); end if;
  return r;
end $f$;

create or replace function public.nube_rol(p_neg text, p_pin text) returns text language plpgsql security definer set search_path to '' as $f$
declare r text;
begin
  if p_pin is null or demo.bloqueado(p_neg) then return null; end if;
  select rol into r from demo.roles where negocio = p_neg and pin = p_pin and activo limit 1;
  if r is null then perform demo.pin_fallo(p_neg); end if;
  return r;
end $f$;

create or replace function demo.cupo_ip(p_neg text, p_col text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare ip text := demo.ip_cliente(); k text; tope int; cuenta int;
begin
  if ip = '?' then return true; end if;
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

do $m$
declare f record; d text; antes text; g1 text; g2 text;
begin
  g1 := 'not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.cols @> array[''*''])';
  g2 := 'not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array[''*''])';
  for f in select * from (values
    ('public.nube_borrar(text,text,text,text,jsonb)'::regprocedure, g1, 'not demo.es_dueno(p_neg, p_pin)'),
    ('public.nube_vaciar(text,text,text)'::regprocedure, g1, 'not demo.es_dueno(p_neg, p_pin)'),
    ('public.nube_importar(text,text,text,jsonb)'::regprocedure, g2, 'not demo.es_dueno(p_neg, p_pin)'),
    ('public.nube_personal_listar(text,text)'::regprocedure, g2, 'not demo.es_dueno(p_neg, p_pin)'),
    ('public.nube_personal_guardar(text,text,text,text,text,boolean,text)'::regprocedure, g2, 'not demo.es_dueno(p_neg, p_pin)'),
    ('public.nube_personal_guardar(text,text,text,text,text,boolean,text)'::regprocedure, '''^[0-9]{4,8}$''', '''^[0-9]{6,8}$'''),
    ('public.nube_personal_guardar(text,text,text,text,text,boolean,text)'::regprocedure, 'El PIN debe tener de 4 a 8 números.', 'El PIN debe tener de 6 a 8 números.'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'where r.negocio = p_neg and r.pin = p_pin and r.activo limit 1;', 'where r.negocio = p_neg and r.pin = p_pin and r.activo and not demo.bloqueado(p_neg) limit 1;'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'if not c.cliente_crea then return jsonb_build_object(''error'', ''sin permiso''); end if;',
       'if not c.cliente_crea then return jsonb_build_object(''error'', ''sin permiso''); end if; if not demo.cupo_ip(p_neg, p_col) then return jsonb_build_object(''error'', ''Demasiadas solicitudes desde tu conexión. Intenta de nuevo más tarde.''); end if;')
  ) as t(fn, de, a) loop
    d := regexp_replace(regexp_replace(pg_get_functiondef(f.fn), '--[^\n]*', '', 'g'), '\s+', ' ', 'g');
    if position(f.a in d) > 0 then continue; end if;   -- ya aplicado
    antes := d;
    d := replace(d, f.de, f.a);
    if d = antes then raise exception '009: no se encontró "%" en %', left(f.de, 50), f.fn; end if;
    execute d;
  end loop;
end
$m$;
