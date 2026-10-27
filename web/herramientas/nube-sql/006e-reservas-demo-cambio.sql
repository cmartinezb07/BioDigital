-- CAMBIO DE LA DEMOSTRACIÓN EN VIVO (negocio 'reservas') a las reglas nuevas del servidor. NO está aplicado todavía.
-- Hacerlo en el MISMO momento que se publica el cliente nuevo en https://biodigital-bgw.pages.dev: el cliente viejo (el que está publicado hoy)
-- no entiende las reglas nuevas y dejaría de poder reservar. Orden: (1) este SQL, (2) node web/herramientas/cargar-agendas.mjs --negocio reservas --pin 482916,
-- (3) regenerar y publicar el sitio (ver la skill contexto_biodigital). Todo en pocos minutos.
-- Las reglas (006a a 006d) ya funcionan para todos los demás negocios; hasta ahora los 4 disparadores dejaban fuera al negocio 'reservas'.

-- 1. Los datos de la demostración anterior (formato viejo: configuración dentro de cada reserva, sin versión) se borran: la demo parte limpia.
delete from demo.items where negocio = 'reservas' and col in ('reservas', 'avisos', 'espera', 'bloqueos', 'config', 'promos');

-- 2. Permisos: la recepción maneja reservas, avisos, lista de espera y bloqueos (ya no la configuración); los avisos los programa el servidor.
update demo.roles set cols = '{reservas,avisos,espera,bloqueos}' where negocio = 'reservas' and rol = 'recepcion';
update demo.cols set cliente_crea = false where negocio = 'reservas' and col = 'avisos';

-- 3. Los cuatro disparadores pasan a valer también para la demostración
drop trigger if exists reserva_reglas on demo.items;
create trigger reserva_reglas before insert or update on demo.items for each row when (new.col = 'reservas') execute function demo.reserva_reglas();
drop trigger if exists espera_reglas on demo.items;
create trigger espera_reglas before insert or update on demo.items for each row when (new.col = 'espera') execute function demo.espera_reglas();
drop trigger if exists bloqueo_reglas on demo.items;
create trigger bloqueo_reglas before insert or update on demo.items for each row when (new.col = 'bloqueos') execute function demo.bloqueo_reglas();
drop trigger if exists config_reglas on demo.items;
create trigger config_reglas before insert or update on demo.items for each row when (new.col = 'config') execute function demo.config_reglas();
