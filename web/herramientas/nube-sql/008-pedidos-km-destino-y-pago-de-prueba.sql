-- 008 · Pedidos: km/destino saneados en el servidor y "pago de prueba" solo en negocios demo (1-nov-2026).
-- Hallazgos de la auditoría security-audit (run-1):
--   · km y destino pasaban sin validar y se pintaban con innerHTML en cocina, panel y repartidor (XSS almacenado).
--   · pedido_reglas dejaba al cliente marcar su propio pedido como pagado cuando pago.metodo = 'linea'.
-- Ahora: km es número 0..1000 y destino solo {lat,lng} numéricos en rango (lo demás se descarta); y el cliente solo puede
-- marcar pago de prueba en negocios con demo.cols.pago_prueba = true (las demos). Un cliente real queda en false por defecto.
-- Se aplica sobre la función viva con reemplazos exactos (no reescribe pedido_reglas entera); es seguro volver a correrla.

alter table demo.cols add column if not exists pago_prueba boolean not null default false;
update demo.cols set pago_prueba = true where col = 'pedidos' and negocio in ('fogon', 'captura-fogon', 'la-joya-del-sur');

create or replace function demo.pedido_limpiar(n jsonb) returns jsonb
 language sql immutable set search_path to ''
as $f$
  select (n - 'km' - 'destino')
    || case when jsonb_typeof(n->'km') = 'number' then
         case when (n->>'km')::numeric between 0 and 1000 then jsonb_build_object('km', n->'km') else '{}'::jsonb end
       else '{}'::jsonb end
    || case when jsonb_typeof(n->'destino') = 'object'
              and jsonb_typeof(n->'destino'->'lat') = 'number' and jsonb_typeof(n->'destino'->'lng') = 'number' then
         case when (n->'destino'->>'lat')::numeric between -90 and 90 and (n->'destino'->>'lng')::numeric between -180 and 180
              then jsonb_build_object('destino', jsonb_build_object('lat', n->'destino'->'lat', 'lng', n->'destino'->'lng'))
              else '{}'::jsonb end
       else '{}'::jsonb end
$f$;

do $m$
declare d text; antes text;
begin
  d := pg_get_functiondef('demo.pedido_reglas'::regproc);
  if position('pedido_limpiar' in d) > 0 then return; end if;

  antes := d;
  d := replace(d, 'derivadas text[] := array[''subtotal'', ''envio'', ''total''];',
                  'derivadas text[] := array[''subtotal'', ''envio'', ''total''];' || chr(10) || ' prueba boolean := false;');
  if d = antes then raise exception '008: no se encontró la declaración de derivadas'; end if;

  antes := d;
  d := replace(d, 'if rol = ''sistema'' then return new; end if;',
                  'if rol = ''sistema'' then return new; end if;' || chr(10) ||
                  ' n := demo.pedido_limpiar(n); new.data := n;' || chr(10) ||
                  ' prueba := exists (select 1 from demo.cols c where c.negocio = new.negocio and c.col = ''pedidos'' and c.pago_prueba);');
  if d = antes then raise exception '008: no se encontró el retorno de sistema'; end if;

  antes := d;
  d := replace(d, 'if rol = ''cliente'' and coalesce(n->''pago''->>''metodo'', '''') <> ''linea'' then n := jsonb_set(',
                  'if rol = ''cliente'' and not (prueba and coalesce(n->''pago''->>''metodo'', '''') = ''linea'') then n := jsonb_set(');
  if d = antes then raise exception '008: no se encontró la regla de INSERT de pago'; end if;

  antes := d;
  d := replace(d, 'coalesce(n->''pago''->>''metodo'', '''') <> ''linea'' and coalesce((n->''pago''->>''pagado'')::boolean, false) then',
                  'not (prueba and coalesce(n->''pago''->>''metodo'', '''') = ''linea'') and coalesce((n->''pago''->>''pagado'')::boolean, false) then');
  if d = antes then raise exception '008: no se encontró la regla de UPDATE de pago'; end if;

  execute d;
end
$m$;
