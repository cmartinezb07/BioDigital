# Llave de Google Calendar para la reserva simple (una sola vez)

La reserva simple lee las horas ocupadas del Google Calendar de cada cliente (solo "libre/ocupado", nunca nombres ni detalles).
Para eso necesita **una llave de API de Bío Digital**. Se crea una sola vez y sirve para todos los clientes. Es gratis (verificar las cuotas vigentes en la consola de Google Cloud).

## Crear la llave (10 minutos, con la cuenta de Google de Bío Digital)
1. Entrar a https://console.cloud.google.com/ y crear un proyecto: **"Bio Digital Reservas"**.
2. Menú ☰ › **APIs y servicios › Biblioteca** › buscar **Google Calendar API** › **Habilitar**.
3. **APIs y servicios › Credenciales › Crear credenciales › Clave de API**. Copiar la clave (empieza con `AIza`).
4. En esa clave, **Editar clave de API**:
   - **Restricciones de aplicaciones:** "Sitios web" (referentes HTTP). Agregar: `https://biodigitales.cl/*`, `https://*.biodigitales.cl/*`, `https://*.pages.dev/*` y los dominios propios de cada cliente cuando existan.
   - **Restricciones de API:** "Restringir clave" › marcar solo **Google Calendar API**.
   - Guardar.
5. Anotar la clave en el gestor de contraseñas del equipo (no en el chat ni en un documento público). Es "publicable": va dentro de la página, pero las restricciones del paso 4 impiden que otros sitios la usen.

## Usarla con un cliente
En `web/propuesta/ejemplos/<cliente>/simple.config.js`:
```js
calendario: { id: 'correo-del-dueno@gmail.com', llave: 'AIza…' }
```
Y el dueño, en su Google Calendar (en el computador): Configuración › su calendario › **Permisos de acceso** › **"Disponible públicamente"** con **"Ver solo libre/ocupado (ocultar detalles)"**.

## Probar
Abrir la página del cliente con `?revisar=1` al final: si el calendario no se pudo leer, lo dice ahí (permiso del calendario, llave restringida a otro dominio, etc.).
Prueba rápida con el calendario de Bío Digital: compartirlo como arriba, poner su correo en `calendario.id` de la demo (`ejemplos/reservas-simple/simple.config.js`, quitando `demo`) y crear un evento mañana a las 11:00: esa hora debe dejar de ofrecerse.

## Probar con un calendario real (sin subir la llave a GitHub)
1. Crear un calendario de prueba en Google Calendar → Configuración → **Permisos de acceso** → "Disponible públicamente" con **Ver solo libre/ocupado**. Crear 2 o 3 eventos de ejemplo.
2. Crear el archivo `web/propuesta/ejemplos/reservas-simple/llave.local.js` (está en `.gitignore`, nunca se sube) con:
   `window.BIO_CAL_PRUEBA = { id: 'correo-del-calendario@gmail.com', llave: 'AIza…' };`
3. Abrir `/ejemplos/reservas-simple/?negocio=prueba&revisar=1`. Si la llave está restringida a `biodigitales.cl` y `*.pages.dev`, desde `localhost` Google la rechaza: agregar temporalmente `http://localhost:4321/*` a las restricciones de sitios web de la llave y quitarlo al terminar.
4. Las horas de los eventos del calendario deben salir bloqueadas en el día correspondiente.
