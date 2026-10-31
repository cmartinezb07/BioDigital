---
name: crear-fidelizacion
description: Subrama de crear-sitio-web para la tarjeta de fidelización con QR de un cliente de Bío Digital (cafés, barberías, locales con clientes frecuentes; $9.990, $5.990 de lanzamiento, sin mensualidad). Crea la carpeta del local desde la demostración, el SQL de accesos del dueño y la caja, y guía las pruebas y la publicación. Úsala cuando pidan crear, armar, probar o publicar una tarjeta de fidelización, sellos, tarjeta de puntos o programa de lealtad con QR para un negocio.
---

# Crear tarjeta de fidelización con QR

**Responder siempre en español.** Repo: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP`. Estado y precio: `20 Servicios/Servicios.md`. Demostración viva: `web/propuesta/ejemplos/fidelizacion/`.

## Qué es
El cliente final saca su tarjeta escaneando un QR, la caja del local pone sellos con un PIN, y al completar los sellos se canjea el premio. Cada local es un "negocio" propio en la base (sus tarjetas, sellos y PIN no se mezclan con los de otro). Los datos viven en Supabase (`biodigital-demos`).

## ADVERTENCIA antes del primer local real
Aplicar **una sola vez** `web/herramientas/nube-sql/007-fidelizacion-cualquier-negocio.sql` en Supabase: protege los sellos de cualquier negocio. Sin eso, un local real no está protegido. Lo ejecuta o aprueba el usuario; no apliques migraciones por tu cuenta.

## Flujo
1. **Datos del local:** nombre (máx. 40), premio (máx. 80), cuántos sellos (4 a 20), color, comuna. Sin comillas, `<`, `>` ni `\`.
2. **Crear:** `node web/herramientas/nuevo-fidelizacion.mjs --id cafe-sol --nombre "Café del Sol" --premio "Un café gratis" [--sellos 8] [--sigla CS] [--color "#6b4226"] [--comuna Concepción] [--minutos 1] [--url https://…]`. `--id`: 3 a 20 letras minúsculas, números o guiones; no sirven `fidelizacion`, `reservas` ni `fogon`. No sobrescribe una carpeta existente.
3. **Qué genera:** `web/propuesta/ejemplos/<id>/` autosuficiente (con su `nube.js` y `fidelizacion.config.js`: negocio, programa, color) y `web/herramientas/fidelizaciones/<id>-instalar.sql` (fuera de git: trae los PIN del dueño y de la caja).
4. **SQL:** pedir al usuario ejecutar ese archivo en Supabase (`biodigital-demos`) y comprobar que 007 ya está aplicada.
5. **PIN:** salen por consola; entrégalos al dueño por un canal privado, nunca en un grupo ni en el repo.
6. **Probar:** `node web/herramientas/revisar.mjs "http://localhost:4321/ejemplos/<id>/" --anchos 390` y el guion `web/herramientas/pruebas/fidelizacion.js` (alta, QR, sellos, protección contra sellos repetidos y canje; su encabezado explica el uso). Suite general: `npm run e2e` (`pruebas-e2e/paginas.spec.mjs` incluye la demo).
7. **Publicar (lo hace el usuario):** `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`.
8. **Entregar:** la caja entra en `<id>/local/` con su PIN; el QR para clientes apunta a `<id>/`. Hay un cartel con QR para imprimir (enlazado desde el panel PRO y las herramientas).

## Precio
$9.990 único ($5.990 de lanzamiento). Sin mensualidad. Incluida en el pack PRO. Costos de Supabase y dominio: aproximados, verificar en la fuente.

## Límites
- `--minutos` evita dos sellos seguidos en la misma tarjeta (por defecto 1).
- Los datos viven en la base de demostración compartida; para muchos locales reales habría que evaluar un proyecto propio (decisión nueva, no la asumas).
- El dueño no cambia el diseño; premio y cantidad de sellos se cambian pidiéndolo al equipo.

## No hacer
No commitear el `.sql` con PIN; no reutilizar PIN entre locales; no publicar en `biodigital-propuesta` ni `menu-demo`.
