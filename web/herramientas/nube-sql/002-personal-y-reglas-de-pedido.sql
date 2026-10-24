-- Migración 002 (24-oct-2026) · proyecto Supabase biodigital-demos
-- Personal con nombre (varios repartidores), reglas de pedido en la base (estados, permisos por rol, modificación solo en "Nuevo",
-- validación de precios contra la carta y un solo pedido nuevo por sesión), carta y fotos editables por el dueño, importación y personal.
-- Las reglas viven en un trigger de demo.items: así valen para cualquier camino de escritura, no solo para la pantalla.

-- ---------- Personal con nombre ----------
alter table demo.roles add column if not exists nombre text;
alter table demo.roles add column if not exists activo boolean not null default true;
alter table demo.roles drop constraint if exists roles_pkey;
alter table demo.roles add primary key (negocio, pin);
update demo.roles set nombre = case rol when 'dueno' then 'Dueño' when 'cocina' then 'Cocina' when 'reparto' then 'Repartidor 1' when 'recepcion' then 'Recepción' when 'caja' then 'Caja' else rol end where nombre is null;
insert into demo.roles (negocio, rol, nombre, pin, cols) values ('fogon', 'reparto', 'Repartidor 2', '913573', '{pedidos}') on conflict do nothing;

create or replace function demo.puede(p_neg text, p_col text, p_pin text) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and (r.cols @> array['*'] or r.cols @> array[p_col]))
$$;
create or replace function public.nube_rol(p_neg text, p_pin text) returns text
language sql security definer set search_path = '' stable as $$
  select rol from demo.roles where negocio = p_neg and pin = p_pin and activo limit 1
$$;
create or replace function public.nube_quien(p_neg text, p_pin text) returns jsonb
language sql security definer set search_path = '' stable as $$
  select jsonb_build_object('rol', rol, 'nombre', nombre) from demo.roles where negocio = p_neg and pin = p_pin and activo limit 1
$$;

-- ---------- Tamaño: pedidos y carta pequeños; las fotos pueden pesar más ----------
alter table demo.items drop constraint if exists items_tam;
alter table demo.items add constraint items_tam check (pg_column_size(data) < 300000 and (pub is null or pg_column_size(pub) < 2000));

-- ---------- Normalizar un pedido: valida y recalcula contra la carta ----------
create or replace function demo.pedido_normalizar(p_neg text, n jsonb, o jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  carta jsonb; cfg jsonb; items jsonb := coalesce(n->'items', '[]'::jsonb); it jsonb; viejo jsonb; salida jsonb := '[]'::jsonb;
  plato jsonb; cat jsonb; g jsonb; op jsonb; sel text[]; s text; gid text; oid text; extra int; precio int; cant int; sub int := 0; envio int := 0;
  tipo text := n->>'tipo'; cli jsonb := coalesce(n->'cliente', '{}'::jsonb); opciones jsonb; opcionesIds jsonb; cuenta int; k int; hay boolean; mx int; minimo int; mesas int;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) < 1 or jsonb_array_length(items) > 40 then raise exception 'items_invalidos'; end if;
  if tipo is null or tipo not in ('mesa', 'retiro', 'delivery') then raise exception 'tipo_invalido'; end if;
  select data into carta from demo.items where negocio = p_neg and col = 'carta' and id = 'carta';
  cfg := coalesce(carta->'config', '{}'::jsonb);
  if length(coalesce(cli->>'nombre', '')) < 2 or length(cli->>'nombre') > 40 then raise exception 'falta:nombre'; end if;
  if tipo <> 'mesa' and coalesce(cli->>'telefono', '') !~ '^\+569[0-9]{8}$' then raise exception 'falta:telefono'; end if;
  if tipo = 'mesa' then
    mesas := coalesce((cfg->>'mesas')::int, 60);
    if coalesce(n->>'mesa', '') !~ '^[0-9]{1,3}$' or (n->>'mesa')::int not between 1 and mesas then raise exception 'falta:mesa'; end if;
  end if;
  if tipo = 'delivery' then
    if length(coalesce(cli->>'direccion', '')) < 3 or length(cli->>'direccion') > 100 then raise exception 'falta:direccion'; end if;
    if carta is not null and cfg ? 'comunas' then
      if not (cfg->'comunas' ? coalesce(cli->>'comuna', '')) then raise exception 'falta:comuna'; end if;
      envio := coalesce((cfg->'comunas'->(cli->>'comuna')->>'envio')::int, 0);
    else
      if length(coalesce(cli->>'comuna', '')) < 3 then raise exception 'falta:comuna'; end if;
      envio := least(greatest(coalesce(nullif(n->>'envio', '')::int, 0), 0), 20000);
    end if;
  end if;
  for k in 0 .. jsonb_array_length(items) - 1 loop
    it := items->k;
    if jsonb_typeof(it) <> 'object' or coalesce(it->>'id', '') !~ '^[A-Za-z0-9_-]{1,40}$' then raise exception 'items_invalidos'; end if;
    if coalesce(it->>'cant', '') !~ '^[0-9]{1,2}$' or (it->>'cant')::int not between 1 and 30 then raise exception 'cantidad_invalida'; end if;
    cant := (it->>'cant')::int;
    sel := coalesce((select array_agg(x order by x) from jsonb_array_elements_text(coalesce(it->'opc', '[]'::jsonb)) x), '{}');
    -- una línea que ya estaba en el pedido original se conserva tal cual (aunque el plato ya no exista o haya cambiado de precio)
    viejo := null;
    if o is not null then
      select x into viejo from jsonb_array_elements(coalesce(o->'items', '[]'::jsonb)) x
        where x->>'id' = it->>'id'
          and coalesce((select array_agg(y order by y) from jsonb_array_elements_text(coalesce(x->'opc', '[]'::jsonb)) y), '{}') = sel
          and (x->>'precio') = (it->>'precio') limit 1;
    end if;
    if viejo is not null then
      salida := salida || jsonb_build_array(viejo || jsonb_build_object('cant', cant, 'nota', left(coalesce(it->>'nota', ''), 120)));
      sub := sub + (viejo->>'precio')::int * cant;
      continue;
    end if;
    if carta is null then
      if coalesce(it->>'precio', '') !~ '^[0-9]{1,7}$' or length(coalesce(it->>'nombre', '')) not between 1 and 90 then raise exception 'items_invalidos'; end if;
      precio := (it->>'precio')::int;
      salida := salida || jsonb_build_array(jsonb_build_object('id', it->>'id', 'nombre', it->>'nombre', 'precio', precio, 'cant', cant, 'prep', least(greatest(coalesce(nullif(it->>'prep', '')::int, 0), 0), 90), 'opc', to_jsonb(sel), 'opciones', coalesce(it->'opciones', '[]'::jsonb), 'nota', left(coalesce(it->>'nota', ''), 120)));
      sub := sub + precio * cant;
      continue;
    end if;
    plato := null;
    for cat in select * from jsonb_array_elements(coalesce(carta->'categorias', '[]'::jsonb)) loop
      select p into plato from jsonb_array_elements(coalesce(cat->'platos', '[]'::jsonb)) p where p->>'id' = it->>'id' limit 1;
      exit when plato is not null;
    end loop;
    if plato is null then raise exception 'plato_inexistente:%', it->>'id'; end if;
    if coalesce((plato->>'activo')::boolean, true) is not true or coalesce((plato->>'disponible')::boolean, true) is not true then raise exception 'plato_agotado:%', plato->>'nombre'; end if;
    extra := 0; opciones := '[]'::jsonb;
    for g in select * from jsonb_array_elements(coalesce(plato->'grupos', '[]'::jsonb)) loop
      cuenta := 0;
      for op in select * from jsonb_array_elements(coalesce(g->'opciones', '[]'::jsonb)) loop
        if (g->>'id') || ':' || (op->>'id') = any (sel) then
          cuenta := cuenta + 1; extra := extra + coalesce((op->>'extra')::int, 0);
          opciones := opciones || jsonb_build_array(jsonb_build_object('grupo', g->>'nombre', 'opcion', op->>'nombre', 'extra', coalesce((op->>'extra')::int, 0)));
        end if;
      end loop;
      mx := case when g->>'tipo' = 'varios' then coalesce((g->>'max')::int, 99) else 1 end;
      if cuenta > mx or (coalesce((g->>'obligatorio')::boolean, false) and cuenta < 1) then raise exception 'opcion_invalida:%', g->>'nombre'; end if;
    end loop;
    -- toda opción elegida debe existir en algún grupo del plato
    select count(*) into cuenta from unnest(sel) x;
    if cuenta <> jsonb_array_length(opciones) then raise exception 'opcion_invalida:%', plato->>'nombre'; end if;
    precio := (plato->>'precio')::int + extra;
    if coalesce(it->>'precio', '') !~ '^[0-9]{1,7}$' or (it->>'precio')::int <> precio then raise exception 'precio_cambio:%', plato->>'nombre'; end if;
    salida := salida || jsonb_build_array(jsonb_build_object('id', plato->>'id', 'nombre', plato->>'nombre', 'precio', precio, 'cant', cant, 'prep', coalesce((plato->>'prep')::int, 0), 'opc', to_jsonb(sel), 'opciones', opciones, 'nota', left(coalesce(it->>'nota', ''), 120)));
    sub := sub + precio * cant;
  end loop;
  minimo := coalesce((cfg->>'minimoDelivery')::int, 0);
  if tipo = 'delivery' and sub < minimo then raise exception 'minimo_delivery:%', minimo; end if;
  return n || jsonb_build_object('items', salida, 'subtotal', sub, 'envio', envio, 'total', sub + envio, 'nota', left(coalesce(n->>'nota', ''), 200));
end $$;

-- ---------- Transiciones válidas de estado ----------
create or replace function demo.transicion_ok(p_rol text, p_tipo text, p_de text, p_a text) returns boolean
language sql immutable as $$
  select case
    when p_de = 'recibido'    then p_a in ('aceptado', 'preparacion', 'cancelado') and p_rol in ('cocina', 'dueno')
    when p_de = 'aceptado'    then p_a in ('preparacion', 'cancelado') and p_rol in ('cocina', 'dueno')
    when p_de = 'preparacion' then p_a in ('listo', 'cancelado') and p_rol in ('cocina', 'dueno')
    when p_de = 'listo'       then (p_a = 'entregado' and p_tipo in ('mesa', 'retiro') and p_rol in ('cocina', 'dueno'))
                                or (p_a = 'camino' and p_tipo = 'delivery' and p_rol in ('reparto', 'dueno'))
                                or (p_a = 'cancelado' and p_rol = 'dueno')
    when p_de = 'camino'      then (p_a = 'entregado' and p_tipo = 'delivery' and p_rol in ('reparto', 'dueno')) or (p_a = 'cancelado' and p_rol = 'dueno')
    else false end
$$;

-- ---------- Reglas del pedido (trigger) ----------
create or replace function demo.pedido_reglas() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'sistema');
  quien text := coalesce(current_setting('demo.nombre', true), '');
  ahora bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  o jsonb; n jsonb := new.data; cambios text[]; permitidas text[]; estadoNuevo text; k text; ed jsonb;
  contenido text[] := array['items', 'nota', 'cliente', 'mesa', 'tipo', 'destino'];
  derivadas text[] := array['subtotal', 'envio', 'total'];
begin
  if rol = 'sistema' then return new; end if;

  if tg_op = 'INSERT' then
    if rol not in ('cliente', 'dueno') then raise exception 'sin permiso'; end if;
    if coalesce(n->>'estado', 'recibido') <> 'recibido' then raise exception 'sin permiso'; end if;
    if rol = 'cliente' and coalesce(n->>'sesion', '') <> '' and exists (
        select 1 from demo.items i where i.negocio = new.negocio and i.col = 'pedidos' and i.id <> new.id and i.data->>'sesion' = n->>'sesion' and i.data->>'estado' = 'recibido') then
      raise exception 'pedido_activo';
    end if;
    n := demo.pedido_normalizar(new.negocio, n, null);
    n := (n - 'modificando' - 'modificandoDesde' - 'asignadoA' - 'repartidor' - 'opinion' - 'baseRev' - 'motivo' - 'aceptadoPor' - 'ruta' - 'rutaKm' - 'salida')
         || jsonb_build_object('estado', 'recibido', 'rev', 1, 'ediciones', '[]'::jsonb, 'creado', ahora,
                               'historial', jsonb_build_array(jsonb_build_object('estado', 'recibido', 't', ahora, 'por', 'cliente')));
    if rol = 'cliente' and coalesce(n->'pago'->>'metodo', '') <> 'linea' then n := jsonb_set(n, '{pago}', coalesce(n->'pago', '{}'::jsonb) || '{"pagado": false}'::jsonb); end if;
    new.data := n; return new;
  end if;

  -- ---------- UPDATE ----------
  o := old.data;
  select array_agg(key) into cambios from (
    select e.key from jsonb_each(n) e where o->e.key is distinct from e.value
    union select e.key from jsonb_each(o) e where not (n ? e.key)) x;
  cambios := coalesce(cambios, '{}');
  estadoNuevo := n->>'estado';

  -- pedido ya terminado: solo la opinión del cliente (una vez), la respuesta del dueño y el pago
  if o->>'estado' in ('entregado', 'cancelado') then
    if cambios = '{}' then return new; end if;
    if rol = 'cliente' and cambios = array['opinion'] and o->>'estado' = 'entregado' and not (o ? 'opinion') then
      if coalesce(n->'opinion'->>'estrellas', '') !~ '^[1-5]$' then raise exception 'opinion_invalida'; end if;
      n := jsonb_set(n, '{opinion}', jsonb_build_object('estrellas', (n->'opinion'->>'estrellas')::int, 'recomendaria', n->'opinion'->'recomendaria', 'texto', left(coalesce(n->'opinion'->>'texto', ''), 300), 't', ahora));
      new.data := n; return new;
    end if;
    if rol = 'dueno' and cambios <@ array['opinion', 'pago'] then
      if 'opinion' = any (cambios) and ((n->'opinion') - 'respuesta') is distinct from ((o->'opinion') - 'respuesta') then raise exception 'sin permiso'; end if;
      if 'opinion' = any (cambios) and n->'opinion' ? 'respuesta' then
        n := jsonb_set(n, '{opinion,respuesta}', jsonb_build_object('texto', left(coalesce(n->'opinion'->'respuesta'->>'texto', ''), 300), 't', ahora));
      end if;
      new.data := n; return new;
    end if;
    raise exception 'terminal';
  end if;

  if rol = 'cliente' then
    if cambios && array['estado', 'historial', 'prepMin', 'repartidor', 'asignadoA', 'ruta', 'rutaKm', 'salida', 'motivo', 'aceptadoPor', 'rev', 'ediciones', 'creado', 'sesion', 'escala', 'opinion', 'codigo'] then raise exception 'sin permiso'; end if;
    if cambios <@ (contenido || derivadas || array['km', 'pago', 'modificando', 'modificandoDesde', 'baseRev']) is not true then raise exception 'sin permiso'; end if;
    if (cambios && contenido) then
      if o->>'estado' <> 'recibido' then raise exception 'no_modificable'; end if;
      if (n->>'baseRev') is distinct from (o->>'rev') then raise exception 'conflicto'; end if;
      n := demo.pedido_normalizar(new.negocio, n, o);
      ed := coalesce(o->'ediciones', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('t', ahora, 'rev', (o->>'rev')::int, 'items', o->'items', 'total', o->'total', 'nota', o->'nota', 'cliente', o->'cliente'));
      n := (n - 'baseRev' - 'modificandoDesde') || jsonb_build_object('rev', coalesce((o->>'rev')::int, 1) + 1, 'ediciones', ed, 'modificando', false);
    else
      n := n - 'baseRev';
      n := jsonb_set(n, '{subtotal}', o->'subtotal'); n := jsonb_set(n, '{envio}', o->'envio'); n := jsonb_set(n, '{total}', o->'total');
    end if;
    if (cambios && array['modificando', 'modificandoDesde']) and not (cambios && contenido) then
      if coalesce((n->>'modificando')::boolean, false) then
        if o->>'estado' <> 'recibido' then raise exception 'no_modificable'; end if;
        n := jsonb_set(n, '{modificandoDesde}', to_jsonb(ahora));
      else
        n := (n - 'modificandoDesde') || '{"modificando": false}'::jsonb;
      end if;
    end if;
    if 'pago' = any (cambios) and coalesce(n->'pago'->>'metodo', '') <> 'linea' and coalesce((n->'pago'->>'pagado')::boolean, false) then raise exception 'sin permiso'; end if;
    new.data := n; return new;
  end if;

  if rol not in ('cocina', 'reparto', 'dueno') then raise exception 'sin permiso'; end if;
  permitidas := case rol
    when 'cocina' then array['estado', 'historial', 'prepMin', 'pago', 'motivo', 'aceptadoPor']
    when 'reparto' then array['estado', 'historial', 'repartidor', 'asignadoA', 'ruta', 'rutaKm', 'km', 'salida', 'pago']
    else array['estado', 'historial', 'prepMin', 'pago', 'motivo', 'aceptadoPor', 'repartidor', 'asignadoA', 'ruta', 'rutaKm', 'km', 'salida', 'opinion'] end;
  if cambios <@ permitidas is not true then raise exception 'sin permiso'; end if;
  if 'prepMin' = any (cambios) then n := jsonb_set(n, '{prepMin}', to_jsonb(least(greatest(coalesce((n->>'prepMin')::int, 10), 1), 120))); end if;
  n := jsonb_set(n, '{historial}', o->'historial');
  if estadoNuevo is distinct from o->>'estado' then
    if not demo.transicion_ok(rol, o->>'tipo', o->>'estado', estadoNuevo) then raise exception 'transicion_invalida:%>%', o->>'estado', estadoNuevo; end if;
    n := jsonb_set(n, '{historial}', (o->'historial') || jsonb_build_array(jsonb_build_object('estado', estadoNuevo, 't', ahora, 'por', rol, 'quien', quien)));
    if estadoNuevo in ('aceptado', 'preparacion', 'cancelado') then n := (n - 'modificandoDesde') || '{"modificando": false}'::jsonb; end if;
    if estadoNuevo in ('aceptado', 'preparacion') then n := jsonb_set(n, '{aceptadoPor}', to_jsonb(quien)); end if;
    if estadoNuevo = 'camino' then
      if rol = 'reparto' and o->>'asignadoA' is not null and o->>'asignadoA' <> quien then raise exception 'asignado_a_otro'; end if;
      if rol = 'reparto' then n := jsonb_set(n, '{asignadoA}', to_jsonb(quien)); end if;
      n := jsonb_set(n, '{repartidor}', coalesce(n->'repartidor', '{}'::jsonb) || jsonb_build_object('nombre', coalesce(n->'asignadoA', to_jsonb(quien))));
    end if;
  end if;
  if rol = 'reparto' and 'asignadoA' = any (cambios) and estadoNuevo is not distinct from o->>'estado' then
    if n->>'asignadoA' is distinct from quien or (o->>'asignadoA' is not null and o->>'asignadoA' <> quien) then raise exception 'sin permiso'; end if;
  end if;
  if rol <> 'dueno' and 'opinion' = any (cambios) then raise exception 'sin permiso'; end if;
  new.data := n; return new;
end $$;

drop trigger if exists pedido_reglas on demo.items;
create trigger pedido_reglas before insert or update on demo.items for each row when (new.col = 'pedidos') execute function demo.pedido_reglas();

-- ---------- Escribir (con el rol del que escribe para el trigger) ----------
create or replace function public.nube_escribir(p_neg text, p_col text, p_id text, p_data jsonb, p_pub jsonb default null, p_pin text default null, p_modo text default 'parchar', p_cupo jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare staff boolean := false; existe boolean; c demo.cols; usado numeric; n int; ahora_ms bigint := (extract(epoch from now()) * 1000)::bigint;
  paso bigint; t bigint; d0 bigint; h0 bigint; u0 numeric; mx numeric; v_rol text := 'cliente'; v_nombre text := '';
begin
  if p_id is null or length(p_id) < 4 or length(p_id) > 40 or p_id !~ '^[A-Za-z0-9_-]+$' then return jsonb_build_object('error', 'id inválido'); end if;
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
    if p_neg = 'fidelizacion' and p_col = 'tarjetas' and (coalesce((p_data->>'sellos')::int, 0) <> 0 or coalesce((p_data->>'premios')::int, 0) <> 0 or coalesce((p_data->>'visitas')::int, 0) <> 0) then return jsonb_build_object('error', 'sin permiso'); end if;
    if p_neg = 'fidelizacion' and p_col = 'eventos' and coalesce(p_data->>'tipo', '') <> 'alta' then return jsonb_build_object('error', 'sin permiso'); end if;
    -- un reintento de crear un pedido que ya existe no lo duplica ni lo pisa
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
  -- la fila previa se bloquea mientras se decide: dos cambios a la vez (cliente que modifica y cocina que acepta) se ordenan
  perform 1 from demo.items where negocio = p_neg and col = p_col and id = p_id for update;
  begin
    insert into demo.items (negocio, col, id, data, pub) values (p_neg, p_col, p_id, coalesce(p_data, '{}'::jsonb), p_pub)
    on conflict (negocio, col, id) do update set
      data = case when p_modo = 'poner' then coalesce(p_data, '{}'::jsonb) else demo.items.data || coalesce(p_data, '{}'::jsonb) end,
      pub = case when p_pub is null then demo.items.pub when p_modo = 'poner' then p_pub else coalesce(demo.items.pub, '{}'::jsonb) || p_pub end,
      updated = now();
  exception when others then
    return jsonb_build_object('error', sqlerrm);
  end;
  return jsonb_build_object('ok', true, 'ahora', now());
end $$;

-- ---------- Importar filas (solo el dueño; cargar la carta base o datos de muestra) ----------
create or replace function public.nube_importar(p_neg text, p_col text, p_pin text, p_filas jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare f jsonb; n int := 0;
begin
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array['*']) then return jsonb_build_object('error', 'sin permiso'); end if;
  if jsonb_typeof(p_filas) <> 'array' or jsonb_array_length(p_filas) > 500 then return jsonb_build_object('error', 'demasiadas filas'); end if;
  perform set_config('demo.rol', 'sistema', true);
  for f in select * from jsonb_array_elements(p_filas) loop
    insert into demo.items (negocio, col, id, data, pub) values (p_neg, p_col, f->>'id', f->'data', f->'pub')
    on conflict (negocio, col, id) do update set data = excluded.data, pub = excluded.pub, updated = now();
    n := n + 1;
  end loop;
  return jsonb_build_object('ok', true, 'importadas', n);
end $$;

-- ---------- Personal (solo el dueño) ----------
create or replace function public.nube_personal_listar(p_neg text, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array['*']) then return jsonb_build_object('error', 'sin permiso'); end if;
  return jsonb_build_object('ok', true, 'personal', coalesce((select jsonb_agg(jsonb_build_object('rol', rol, 'nombre', nombre, 'pin', pin, 'activo', activo) order by rol, nombre) from demo.roles where negocio = p_neg), '[]'::jsonb));
end $$;
create or replace function public.nube_personal_guardar(p_neg text, p_pin text, p_rol text, p_nombre text, p_pin_nuevo text, p_activo boolean, p_pin_actual text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array['*']) then return jsonb_build_object('error', 'sin permiso'); end if;
  if p_rol not in ('cocina', 'reparto') then return jsonb_build_object('error', 'rol inválido'); end if;
  if coalesce(p_pin_nuevo, '') !~ '^[0-9]{4,8}$' then return jsonb_build_object('error', 'El PIN debe tener de 4 a 8 números.'); end if;
  if length(coalesce(p_nombre, '')) < 2 or length(p_nombre) > 30 then return jsonb_build_object('error', 'Escribe un nombre.'); end if;
  if p_pin_actual is null then
    if exists (select 1 from demo.roles where negocio = p_neg and pin = p_pin_nuevo) then return jsonb_build_object('error', 'Ese PIN ya lo usa otra persona.'); end if;
    insert into demo.roles (negocio, rol, nombre, pin, cols, activo) values (p_neg, p_rol, p_nombre, p_pin_nuevo, '{pedidos}', coalesce(p_activo, true));
  else
    if p_pin_nuevo <> p_pin_actual and exists (select 1 from demo.roles where negocio = p_neg and pin = p_pin_nuevo) then return jsonb_build_object('error', 'Ese PIN ya lo usa otra persona.'); end if;
    update demo.roles set nombre = p_nombre, pin = p_pin_nuevo, activo = coalesce(p_activo, true) where negocio = p_neg and pin = p_pin_actual and rol in ('cocina', 'reparto');
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.nube_quien(text,text), public.nube_importar(text,text,text,jsonb), public.nube_personal_listar(text,text), public.nube_personal_guardar(text,text,text,text,text,boolean,text), public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb), public.nube_rol(text,text) from public;
grant execute on function public.nube_quien(text,text), public.nube_importar(text,text,text,jsonb), public.nube_personal_listar(text,text), public.nube_personal_guardar(text,text,text,text,text,boolean,text), public.nube_escribir(text,text,text,jsonb,jsonb,text,text,jsonb), public.nube_rol(text,text) to anon, authenticated;
