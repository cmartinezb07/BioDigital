-- 010 · p_cupo acotado y forma de 'visitas' (1-nov-2026). Auditoría security-audit, hallazgos h04 (p_cupo) y h05 (visitas).
--  · p_cupo (d, h, paso) venía del cliente sin límite: generate_series(d, h, paso) con paso=1 y h enorme dejaba la base ocupada.
--    Ahora d, h y paso deben ser enteros y, con paso > 0, (h - d) / paso no puede pasar de 800 pasos. La clave del candado de
--    asesoría lleva separadores ('|') para que dos claves distintas no choquen al concatenarse.
--  · 'visitas': un cliente solo puede escribir {t: número, origen: texto <= 40}; nada más (antes cualquier JSON de hasta 60 KB).
-- Se aplica sobre la función viva con reemplazos exactos; es seguro volver a correrla.

do $m$
declare f record; d text; antes text;
begin
  for f in select * from (values
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'if p_col = ''eventos'' and coalesce(p_data->>''tipo'', '''') <> ''alta'' then return jsonb_build_object(''error'', ''sin permiso''); end if;',
       'if p_col = ''eventos'' and coalesce(p_data->>''tipo'', '''') <> ''alta'' then return jsonb_build_object(''error'', ''sin permiso''); end if; if p_col = ''visitas'' and (case when jsonb_typeof(p_data) <> ''object'' then true else (exists (select 1 from jsonb_object_keys(p_data) k where k not in (''t'', ''origen'')) or jsonb_typeof(p_data->''t'') is distinct from ''number'' or length(coalesce(p_data->>''origen'', '''')) > 40) end) then return jsonb_build_object(''error'', ''sin permiso''); end if;'),
    ('public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb)'::regprocedure,
       'perform pg_advisory_xact_lock(hashtext(p_neg || p_col || (p_cupo->>''r'')));',
       'if jsonb_typeof(p_cupo) <> ''object'' or coalesce(p_cupo->>''d'', '''') !~ ''^[0-9]{1,15}$'' or coalesce(p_cupo->>''h'', '''') !~ ''^[0-9]{1,15}$'' or coalesce(p_cupo->>''paso'', ''0'') !~ ''^[0-9]{1,12}$'' then return jsonb_build_object(''error'', ''cupo inválido''); end if; if coalesce((p_cupo->>''paso'')::bigint, 0) > 0 and ((p_cupo->>''h'')::bigint - (p_cupo->>''d'')::bigint) / (p_cupo->>''paso'')::bigint > 800 then return jsonb_build_object(''error'', ''cupo inválido''); end if; perform pg_advisory_xact_lock(hashtext(p_neg || ''|'' || p_col || ''|'' || (p_cupo->>''r'')));')
  ) as t(fn, de, a) loop
    d := regexp_replace(regexp_replace(pg_get_functiondef(f.fn), '--[^\n]*', '', 'g'), '\s+', ' ', 'g');
    if position(f.a in d) > 0 then continue; end if;   -- ya aplicado
    antes := d;
    d := replace(d, f.de, f.a);
    if d = antes then raise exception '010: no se encontró "%" en %', left(f.de, 50), f.fn; end if;
    execute d;
  end loop;
end
$m$;
