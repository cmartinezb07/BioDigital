-- 007 · Fidelización para cualquier negocio (30-oct-2026). Antes, la regla "un cliente no puede sumarse sellos ni premios" solo protegía al negocio
-- de la demostración ('fidelizacion'): una tarjeta de un local real quedaba sin esa protección. Ahora vale para todo negocio que use las colecciones
-- de fidelización (tarjetas y eventos; ningún otro producto las usa). Solo cambian esas dos líneas de nube_escribir; el resto es igual a 002.
CREATE OR REPLACE FUNCTION public.nube_escribir(p_neg text, p_col text, p_id text, p_data jsonb, p_pub jsonb DEFAULT NULL::jsonb, p_pin text DEFAULT NULL::text, p_modo text DEFAULT 'parchar'::text, p_cupo jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare staff boolean := false; existe boolean; c demo.cols; usado numeric; n int; ahora_ms bigint := (extract(epoch from now()) * 1000)::bigint;
  paso bigint; t bigint; d0 bigint; h0 bigint; u0 numeric; mx numeric; v_rol text := 'cliente'; v_nombre text := '';
begin
  if p_id is null or length(p_id) < 4 or length(p_id) > 40 or p_id !~ '^[A-Za-z0-9_-]+$' then return jsonb_build_object('error', 'id inválido'); end if;
  perform pg_advisory_xact_lock(hashtext(p_neg || ':' || p_col || ':' || p_id));
  if p_pin is not null then
    staff := demo.puede(p_neg, p_col, p_pin);
    select r.rol, r.nombre into v_rol, v_nombre from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo limit 1;
    v_rol := coalesce(v_rol, 'cliente'); v_nombre := coalesce(v_nombre, '');
  end if;
  if p_col <> 'fotos' and pg_column_size(p_data) >= 60000 then return jsonb_build_object('error', 'demasiado grande'); end if;
  if p_col = 'fotos' and (coalesce(p_data->>'img', '') !~ '^data:image/(webp|jpeg|png);base64,' or pg_column_size(p_data) >= 250000) then return jsonb_build_object('error', 'foto inválida'); end if;
  select exists (select 1 from demo.items where negocio = p_neg and col = p_col and id = p_id) into existe;
  if not staff then
    select * into c from demo.cols where negocio = p_neg and col = p_col;
    if not found then return jsonb_build_object('error', 'sin permiso'); end if;
    if existe and not c.cliente_edita then return jsonb_build_object('error', 'sin permiso'); end if;
    if not existe then
      if not c.cliente_crea then return jsonb_build_object('error', 'sin permiso'); end if;
      select count(*) into n from demo.items where negocio = p_neg and col = p_col;
      if n >= c.maximo then return jsonb_build_object('error', 'La demostración está llena. Avisa a Bío Digital.'); end if;
    end if;
    if p_col = 'tarjetas' and (coalesce((p_data->>'sellos')::int, 0) <> 0 or coalesce((p_data->>'premios')::int, 0) <> 0 or coalesce((p_data->>'visitas')::int, 0) <> 0) then return jsonb_build_object('error', 'sin permiso'); end if;
    if p_col = 'eventos' and coalesce(p_data->>'tipo', '') <> 'alta' then return jsonb_build_object('error', 'sin permiso'); end if;
    if p_col = 'pedidos' and existe and p_modo = 'poner' then return jsonb_build_object('ok', true, 'duplicado', true, 'ahora', now()); end if;
  end if;
  if p_cupo is not null then
    perform pg_advisory_xact_lock(hashtext(p_neg || p_col || (p_cupo->>'r')));
    d0 := (p_cupo->>'d')::bigint; h0 := (p_cupo->>'h')::bigint; u0 := coalesce((p_cupo->>'u')::numeric, 1); mx := (p_cupo->>'max')::numeric; paso := coalesce((p_cupo->>'paso')::bigint, 0);
    if paso > 0 then
      for t in select g from generate_series(d0, h0 - 1, paso) g loop
        select coalesce(sum(coalesce((pub->>'u')::numeric, 1)), 0) into usado from demo.items
          where negocio = p_neg and col = p_col and id <> p_id and pub->>'r' = p_cupo->>'r'
            and (pub->>'d')::bigint <= t + paso / 2 and (pub->>'h')::bigint > t + paso / 2
            and pub->>'e' in ('retenida','confirmada','pagada','checkin','completada','noshow')
            and not (pub->>'e' = 'retenida' and coalesce((pub->>'x')::bigint, 0) < ahora_ms);
        if usado + u0 > mx then return jsonb_build_object('error', 'ocupado'); end if;
      end loop;
    else
      select coalesce(sum(coalesce((pub->>'u')::numeric, 1)), 0) into usado from demo.items
        where negocio = p_neg and col = p_col and id <> p_id and pub->>'r' = p_cupo->>'r'
          and (pub->>'d')::bigint < h0 and (pub->>'h')::bigint > d0
          and pub->>'e' in ('retenida','confirmada','pagada','checkin','completada','noshow')
          and not (pub->>'e' = 'retenida' and coalesce((pub->>'x')::bigint, 0) < ahora_ms);
      if usado + u0 > mx then return jsonb_build_object('error', 'ocupado'); end if;
    end if;
  end if;
  perform set_config('demo.rol', v_rol, true);
  perform set_config('demo.nombre', v_nombre, true);
  begin
    if existe then
      -- actualización explícita: el trigger recibe el registro ya mezclado (no un insert parcial)
      update demo.items set
        data = case when p_modo = 'poner' then coalesce(p_data, '{}'::jsonb) else demo.items.data || coalesce(p_data, '{}'::jsonb) end,
        pub = case when p_pub is null then demo.items.pub when p_modo = 'poner' then p_pub else coalesce(demo.items.pub, '{}'::jsonb) || p_pub end,
        updated = now()
      where negocio = p_neg and col = p_col and id = p_id;
    else
      insert into demo.items (negocio, col, id, data, pub) values (p_neg, p_col, p_id, coalesce(p_data, '{}'::jsonb), p_pub);
    end if;
  exception when others then
    return jsonb_build_object('error', sqlerrm);
  end;
  return jsonb_build_object('ok', true, 'ahora', now());
end $function$;
