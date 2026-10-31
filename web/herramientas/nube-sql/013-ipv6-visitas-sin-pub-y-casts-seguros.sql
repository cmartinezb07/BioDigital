-- 013 · Huecos que encontró el verificador independiente sobre 008-012 (1-nov-2026).
--  · ip_cliente: las direcciones IPv6 se agrupan por /64 (antes una persona con un /64 tenía 2^64 direcciones para rotar y saltarse el límite).
--  · pin_fallo / bloqueado: el nombre del negocio se recorta a 40 caracteres en la clave (un texto enorme provocaba un error de índice).
--  · 'visitas': un cliente no puede mandar p_pub (con {"h":"x"} rompía la lectura de todos: nube_leer castea pub->>'h').
--  · nube_leer: el cast de pub->>'h' ya no falla con valores no numéricos.
--  · tarjetas: sellos/premios/visitas se comparan como texto (un valor no numérico daba el error crudo de la base en vez de "sin permiso").
--  · p_cupo: u, max y r también se validan.
-- Se aplica sobre las funciones vivas con reemplazos exactos; es seguro volver a correrla.

create or replace function demo.ip_cliente() returns text language plpgsql stable set search_path to '' as $f$
declare h json; ip text;
begin
  begin h := nullif(current_setting('request.headers', true), '')::json; exception when others then h := null; end;
  ip := coalesce(nullif(h->>'cf-connecting-ip', ''), nullif(h->>'x-real-ip', ''),
                 nullif(trim(regexp_replace(coalesce(h->>'x-forwarded-for', ''), '^.*,', '')), ''), '?');
  ip := left(ip, 64);
  if ip ~* '^::ffff:[0-9.]+$' then ip := substr(ip, 8); end if;
  if position(':' in ip) > 0 then
    begin ip := network(set_masklen(ip::inet, 64))::text; exception when others then ip := '?'; end;
  end if;
  return ip;
end $f$;

create or replace function demo.bloqueado(p_neg text) returns boolean language sql stable security definer set search_path to '' as $f$
  select demo.ip_cliente() <> '?' and exists (select 1 from demo.pin_fallos f
    where f.desde > now() - interval '10 minutes'
      and ((f.clave = coalesce(left(p_neg, 40), '?') || '|' || demo.ip_cliente() and f.n >= 30) or (f.clave = '*|' || demo.ip_cliente() and f.n >= 80)))
$f$;

do $m$
declare f record; d text; antes text;
begin
  for f in select * from (values
    ('demo.pin_fallo(text)'::regprocedure, 'array[coalesce(p_neg, ''?'') || ''|'' || ip,', 'array[coalesce(left(p_neg, 40), ''?'') || ''|'' || ip,'),
    ('public.nube_leer(text,text,text,text[],timestamp with time zone)'::regprocedure,
       '(pub->>''h'')::bigint > ayer', '(case when (pub->>''h'') ~ ''^[0-9]{1,15}$'' then (pub->>''h'')::bigint else 0 end) > ayer'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'or length(coalesce(p_data->>''origen'', '''')) > 40) end) then',
       'or length(coalesce(p_data->>''origen'', '''')) > 40) end or p_pub is not null) then'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       '(coalesce((p_data->>''sellos'')::int, 0) <> 0 or coalesce((p_data->>''premios'')::int, 0) <> 0 or coalesce((p_data->>''visitas'')::int, 0) <> 0)',
       '(coalesce(p_data->>''sellos'', ''0'') !~ ''^0+$'' or coalesce(p_data->>''premios'', ''0'') !~ ''^0+$'' or coalesce(p_data->>''visitas'', ''0'') !~ ''^0+$'')'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'or coalesce(p_cupo->>''paso'', ''0'') !~ ''^[0-9]{1,12}$'' then',
       'or coalesce(p_cupo->>''paso'', ''0'') !~ ''^[0-9]{1,12}$'' or coalesce(p_cupo->>''u'', ''1'') !~ ''^[0-9]{1,6}$'' or coalesce(p_cupo->>''max'', '''') !~ ''^[0-9]{1,6}$'' or coalesce(p_cupo->>''r'', '''') = '''' then')
  ) as t(fn, de, a) loop
    d := regexp_replace(regexp_replace(pg_get_functiondef(f.fn), '--[^\n]*', '', 'g'), '\s+', ' ', 'g');
    if position(f.a in d) > 0 then continue; end if;
    antes := d;
    d := replace(d, f.de, f.a);
    if d = antes then raise exception '013: no se encontró "%" en %', left(f.de, 50), f.fn; end if;
    execute d;
  end loop;
end
$m$;
