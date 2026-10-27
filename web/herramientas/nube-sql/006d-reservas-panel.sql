-- Reservas, ajustes que necesita el panel del negocio (se aplican después de 006a, 006b y 006c):
--  1. Quitar un bloqueo de fechas: queda marcado "quitado" (no se borra) y deja de ocupar y de publicarse.
--  2. El jefe puede crear personal de recepción con su PIN (y cambiarlo o desactivarlo).
--  3. Cobrar el saldo: la recepción/jefe sube lo pagado de una reserva ya pagada o en curso (sin cambiar su estado); queda en el historial.

create or replace function demo.rv_ocupa(p_neg text, p_ag text, p_rec text, p_d bigint, p_h bigint, p_salvo text) returns numeric
language sql security definer set search_path = '' volatile as $$
  select coalesce((select sum(coalesce((data->>'unidades')::numeric, 1)) from demo.items
      where negocio = p_neg and col = 'reservas' and id <> coalesce(p_salvo, '') and data->>'agenda' = p_ag and data->>'recurso' = p_rec
        and data->>'estado' in ('retenida','confirmada','pagada','checkin','completada','noshow')
        and not (data->>'estado' = 'retenida' and coalesce((data->>'expira')::bigint, 0) < demo.rv_ahora())
        and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d), 0)
  + coalesce((select sum(coalesce((data->>'unidades')::numeric, 1)) from demo.items
      where negocio = p_neg and col = 'bloqueos' and data->>'agenda' = p_ag and data->>'recurso' = p_rec and coalesce(data->>'quitado', '') <> 'true'
        and (data->>'desde')::bigint < p_h and (data->>'hasta')::bigint > p_d), 0)
$$;

create or replace function demo.bloqueo_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); ag text := coalesce(new.data->>'agenda', new.data->>'neg'); d bigint; h bigint;
begin
  if rol = 'sistema' then return new; end if;
  if rol not in ('dueno', 'recepcion') then raise exception 'sin permiso'; end if;
  if tg_op = 'UPDATE' then   -- quitar un bloqueo: queda marcado (no se borra) y deja de publicarse
    new.data := old.data || jsonb_build_object('quitado', coalesce((new.data->>'quitado')::boolean, false));
    if (new.data->>'quitado')::boolean then new.pub := null; else new.pub := old.pub; end if;
    return new;
  end if;
  if coalesce(ag, '') !~ '^[a-z0-9-]{2,30}$' or coalesce(new.data->>'recurso', '') !~ '^[a-z0-9_-]{1,30}$' or coalesce(new.data->>'desde', '') !~ '^\d{10,14}$' or coalesce(new.data->>'hasta', '') !~ '^\d{10,14}$' then raise exception 'bloqueo_invalido'; end if;
  d := (new.data->>'desde')::bigint; h := (new.data->>'hasta')::bigint;
  if h <= d or h - d > 400 * 86400000::bigint then raise exception 'bloqueo_invalido'; end if;
  new.data := jsonb_build_object('id', new.id, 'agenda', ag, 'neg', ag, 'recurso', new.data->>'recurso', 'desde', d, 'hasta', h, 'motivo', left(coalesce(new.data->>'motivo', 'Bloqueo manual'), 80), 'origen', left(coalesce(new.data->>'origen', 'manual'), 40), 'unidades', 1);
  new.pub := jsonb_build_object('n', ag, 'm', 'x', 'r', ag || ':' || (new.data->>'recurso'), 'd', d, 'h', h, 'u', 1, 'e', 'bloqueo', 'x', 0);
  return new;
end $$;

create or replace function public.nube_personal_guardar(p_neg text, p_pin text, p_rol text, p_nombre text, p_pin_nuevo text, p_activo boolean, p_pin_actual text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from demo.roles r where r.negocio = p_neg and r.pin = p_pin and r.activo and r.cols @> array['*']) then return jsonb_build_object('error', 'sin permiso'); end if;
  if p_rol not in ('cocina', 'reparto', 'recepcion') then return jsonb_build_object('error', 'rol inválido'); end if;
  if coalesce(p_pin_nuevo, '') !~ '^[0-9]{4,8}$' then return jsonb_build_object('error', 'El PIN debe tener de 4 a 8 números.'); end if;
  if length(coalesce(p_nombre, '')) < 2 or length(p_nombre) > 30 then return jsonb_build_object('error', 'Escribe un nombre.'); end if;
  if p_pin_actual is null then
    if exists (select 1 from demo.roles where negocio = p_neg and pin = p_pin_nuevo) then return jsonb_build_object('error', 'Ese PIN ya lo usa otra persona.'); end if;
    insert into demo.roles (negocio, rol, nombre, pin, cols, activo) values (p_neg, p_rol, p_nombre, p_pin_nuevo, case when p_rol = 'recepcion' then '{reservas,avisos,espera,bloqueos}'::text[] else '{pedidos}'::text[] end, coalesce(p_activo, true));
  else
    if p_pin_nuevo <> p_pin_actual and exists (select 1 from demo.roles where negocio = p_neg and pin = p_pin_nuevo) then return jsonb_build_object('error', 'Ese PIN ya lo usa otra persona.'); end if;
    update demo.roles set nombre = p_nombre, pin = p_pin_nuevo, activo = coalesce(p_activo, true) where negocio = p_neg and pin = p_pin_actual and rol in ('cocina', 'reparto', 'recepcion');
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function demo.reserva_reglas() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rol text := coalesce(nullif(current_setting('demo.rol', true), ''), 'cliente'); nom text := coalesce(current_setting('demo.nombre', true), '');
  staff boolean; o jsonb; n jsonb; r jsonb; cfg jsonb; ahora bigint := demo.rv_ahora(); horas_min numeric; cobro numeric;
begin
  if rol = 'sistema' then return new; end if;
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
  elsif staff and o->>'estado' in ('pagada', 'checkin') and coalesce(n->>'pagado', '') ~ '^[0-9]+(\.[0-9]+)?$' and (n->>'pagado')::numeric > coalesce((o->>'pagado')::numeric, 0) then
    -- cobrar el saldo: sube lo pagado hasta el total, sin cambiar el estado
    cobro := least((r->'precio'->>'total')::numeric, (n->>'pagado')::numeric);
    r := jsonb_set(r, '{pagado}', to_jsonb(cobro));
    r := jsonb_set(r, '{historial}', (r->'historial') || jsonb_build_array(jsonb_build_object('estado', r->>'estado', 't', ahora, 'por', rol, 'quien', nom, 'cobro', cobro)));
  end if;
  new.data := r; new.pub := demo.rv_pub(r);
  return new;
end $$;
