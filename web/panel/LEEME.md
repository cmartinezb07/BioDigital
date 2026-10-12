# Panel interno de Bío Digital

Página privada del equipo: solicitudes en vivo, formularios completados, caja, equipo y registro de actividad.
Base de datos y login: Supabase, proyecto `biodigital-panel` (región São Paulo). Sin librerías en el navegador: todo está en `panel.js`.

## Publicar (lo ejecutas tú)

```bash
npx wrangler pages deploy web/panel --project-name=biodigital-panel --branch=main --commit-dirty=true
```

La dirección queda en `https://biodigital-panel.pages.dev`. Las cabeceras de seguridad están en `_headers`.

## Ajustes que hay que hacer una vez en Supabase (panel web, no se pueden desde el código)

Entra a https://supabase.com/dashboard → proyecto `biodigital-panel`:

1. **Authentication → URL Configuration → Site URL:** `https://biodigital-panel.pages.dev` (y lo mismo en Redirect URLs). Sin esto, el enlace del correo de confirmación apunta a un sitio equivocado.
2. **Authentication → Sign In / Providers → Email:** largo mínimo de contraseña **11**; dejar "Confirm email" **activado**.
3. **Authentication → Multi-Factor:** TOTP activado (viene así por defecto).
4. **Correo de confirmación:** el servicio de correo de prueba de Supabase solo envía a integrantes de tu organización y con tope de 2 por hora. Para que lleguen los correos a tus compañeros hay que configurar un SMTP propio (**Authentication → SMTP Settings**, por ejemplo Gmail con contraseña de aplicación) o crearles la cuenta a mano en **Authentication → Users → Add user** marcando "Auto Confirm".
5. Proyectos gratis se **pausan tras 1 semana sin uso**: entra al panel de vez en cuando o restáuralo desde Supabase.

## Cómo entra el equipo

1. Un administrador va a **Equipo** y escribe el correo de la persona (queda autorizada).
2. La persona abre el panel, escribe su correo y una contraseña de 11 o más caracteres y presiona **Crear mi cuenta**.
3. Confirma su correo, vuelve, entra y escanea el QR con Google Authenticator o Authy. Desde ahí, cada ingreso pide contraseña **y** código.

Quien tenga cuenta pero no esté en **Equipo** ve "Sin acceso" y la base no le devuelve ningún dato.

## Barreras de seguridad

- **Base de datos (lo que realmente protege):** RLS activado en todas las tablas. El público solo puede **insertar** solicitudes y formularios (columnas fijas, valores validados por la base, sin leer nada, con tope de 5 envíos por 10 min por conexión y 200 por hora). Para leer o editar hace falta estar en `staff`, tener el correo confirmado **y** haber pasado el segundo factor (aal2). Solo administradores borran o gestionan el equipo.
- **Auditoría:** cada modificación o borrado queda en `auditoria` (visible en la pestaña Actividad).
- **Sesión:** vive en la pestaña (se pierde al cerrarla), se cierra sola a los 15 minutos sin uso, bloqueo de 60 s tras 5 intentos fallidos.
- **Navegador:** política de contenido estricta (solo este sitio y la base), sin scripts de terceros, todo el texto se pinta como texto (no HTML), exportes CSV protegidos contra fórmulas, `noindex`, sin caché, no se puede incrustar en otras páginas.
- **Llaves:** el panel usa solo la llave *publicable* (pública por diseño). La llave de servicio no está en ningún archivo y nunca debe ponerse aquí.

## Qué no hace todavía

- "En vivo" es una consulta cada 5 segundos, no una conexión permanente.
- Los avisos al correo o WhatsApp del equipo cuando llega una solicitud no existen: se ven en el panel.
- Recuperación de segundo factor perdido: un administrador debe quitar el factor desde Supabase (Authentication → Users).
