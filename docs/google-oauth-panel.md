# Cómo activar "Mi agenda" con un Google Calendar real

"Mi agenda" es el mini panel del dueño (`web/propuesta/ejemplos/barberia-simple/mi-agenda/`). Sin configurar nada funciona en **modo demostración** (citas de ejemplo). Para que lea el Google Calendar real del dueño necesitas un **ID de cliente de OAuth**. No es una llave secreta: es público por diseño y solo funciona en los dominios que autorices. Es gratis y sin mensualidad.

El panel pide un solo permiso, de **solo lectura de eventos** (`calendar.events.readonly`). No puede crear ni borrar nada. El token vive solo en la memoria de la pestaña.

## 1. Entrar al proyecto de Bío Digital

1. Abre <https://console.cloud.google.com> con la cuenta de Bío Digital.
2. Arriba, en el selector de proyectos, elige el proyecto de Bío Digital (el mismo de la llave de Google Calendar, ver `docs/google-calendar-llave.md`).

## 2. Habilitar la API de Google Calendar

Menú **APIs y servicios → Biblioteca → Google Calendar API**. Si dice "Administrar", ya está habilitada (en este proyecto ya lo está).

## 3. Pantalla de consentimiento de OAuth

1. **APIs y servicios → Pantalla de consentimiento de OAuth** (en consolas nuevas: **Google Auth Platform → Branding / Público**).
2. Tipo de usuario: **Externo**.
3. Nombre de la app: "Mi agenda · Bío Digital". Correo de asistencia y de contacto: el de Bío Digital.
4. Estado de publicación: déjalo en **Prueba** (no hace falta verificar la app).
5. En **Usuarios de prueba**, agrega el **correo de Google del dueño** (el del calendario). Solo los correos de esa lista pueden entrar.

Qué esperar en modo Prueba (cifras por verificar en la consola de Google, pueden cambiar):
- Hasta **100 usuarios de prueba**. Más que suficiente para 3-5 clientes.
- Google muestra el aviso **"Google no ha verificado esta aplicación"**. El dueño toca **Configuración avanzada → Ir a Mi agenda (no seguro)**. Es normal en modo Prueba.
- Los permisos concedidos en modo Prueba pueden vencer a los **7 días** (verificar): si pasa, el dueño solo vuelve a tocar "Entrar con Google".

## 4. Crear el ID de cliente

1. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**.
2. Tipo de aplicación: **Aplicación web**. Nombre: "Mi agenda".
3. **Orígenes de JavaScript autorizados** (solo origen, sin ruta ni barra final):
   - `http://localhost:4321` (para probar)
   - el dominio real donde se publique el panel, por ejemplo `https://biodigital-bgw.pages.dev`
4. **URI de redireccionamiento**: déjalo vacío (el panel usa el flujo de token, no redirige).
5. Crear y copiar el **ID de cliente** (termina en `.apps.googleusercontent.com`). No necesitas el "secreto".

## 5. Ponerlo en el panel

Crea el archivo `web/propuesta/ejemplos/barberia-simple/mi-agenda/config.local.js` (no se sube a GitHub):

```js
window.MI_AGENDA = { clientId: 'XXXXXXXX.apps.googleusercontent.com', calendarId: 'correo@gmail.com' };
```

- `calendarId`: el correo del calendario donde caen las citas (o `'primary'` si es el de la cuenta con la que entra).
- Para publicar en un negocio real, el mismo contenido va en el `config.js` de su carpeta (el ID de cliente es público; nunca pongas el secreto ni llaves privadas).

## 6. Probar

1. Levanta el sitio: `python web/servir.py 4321 web/propuesta`.
2. Abre <http://localhost:4321/ejemplos/barberia-simple/mi-agenda/index.html>. La cinta "Modo demostración" **no** debe aparecer.
3. Toca **Entrar con Google**, elige el correo de prueba, acepta el aviso y el permiso.
4. Deben salir las citas de mañana. Para ver el modo demo de nuevo, agrega `?demo=1` al enlace.

## Errores típicos

| Mensaje de Google o del panel | Causa | Solución |
|---|---|---|
| `Error 400: origin_mismatch` / `redirect_uri_mismatch` | El dominio desde donde abres el panel no está en "Orígenes de JavaScript autorizados" | Agregar el origen exacto (esquema + dominio + puerto, sin ruta), esperar unos minutos y recargar |
| `Error 403: access_denied` / `access_blocked` ("no completó el proceso de verificación") | La app está en Prueba y el correo no es usuario de prueba | Agregar el correo en Pantalla de consentimiento → Usuarios de prueba |
| "Google no dio permiso para leer este calendario" (403 del panel) | La cuenta no tiene acceso a ese calendario, o no aceptó el permiso, o la Calendar API no está habilitada | Entrar con la cuenta dueña del calendario; revisar `calendarId`; habilitar la API |
| "No encontré ese calendario" (404) | `calendarId` mal escrito | Corregir el correo |
| "Tu sesión de Google venció" (401) | El token dura cerca de una hora | Tocar "Entrar con Google" otra vez |
| "No pude cargar el acceso de Google" | Sin internet o bloqueador de anuncios | Revisar señal y recargar |
| Sigue en modo demostración | `config.local.js` no existe, tiene el `clientId` vacío o el enlace trae `?demo=1` | Revisar el archivo y el enlace |
