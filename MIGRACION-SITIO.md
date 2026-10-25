# Sitio principal y redirección antigua

Dirección principal: **https://biodigital-bgw.pages.dev**.
Cuenta Cloudflare: `1f79804ece4d02d62f0df05f07c23ad2`.
Proyecto: `biodigital`; rama de producción: `main`.

## Publicaciones futuras

El `wrangler.toml` de la raíz apunta a `biodigital`, con la API de pagos
apagada y sin la base D1 de pruebas. Desde la raíz:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID='1f79804ece4d02d62f0df05f07c23ad2'
node web/propuesta/fuentes/generar.mjs --publico 8
npx.cmd wrangler pages deploy web/propuesta --project-name=biodigital --branch=main --commit-dirty=true
node web/propuesta/fuentes/generar.mjs 8
```

## Dirección anterior

`https://biodigital-propuesta.pages.dev` redirige con HTTP 301 al mismo camino
en la dirección principal. Se verificaron también parámetros de campaña.
Despliegue de redirección: `3f12be4d`; producción anterior conservada:
`d0965b96-db16-4df4-8861-ac0432945b72`.

La fuente de esta redirección es `deployment/legacy-redirect/`. Para volver a
publicarla, desde esa carpeta y con la cuenta anterior seleccionada:

```powershell
npx.cmd wrangler pages deploy public --project-name=biodigital-propuesta --branch=main --commit-dirty=true
```

No publicar el sitio completo en el proyecto antiguo: reemplazaría la redirección.
No borrar el proyecto: dejarían de funcionar los enlaces antiguos y se perdería
el entorno de pruebas que contiene. El despliegue anterior permite revertir.

## Pagos y entornos conservados

- Los nueve enlaces comerciales siguen configurados en el sitio principal.
- La API sigue apagada; no se trasladaron secretos ni bases.
- `payments-test.biodigital-propuesta.pages.dev` conserva su configuración y D1.
- La vista previa `ejemplos` y los despliegues históricos no se eliminaron.
- La comprobación técnica no certifica un cobro aprobado ni importes externos.

## Perfiles públicos

Instagram y WhatsApp deben anunciar la dirección principal. La redirección ya
protege a quienes usen la dirección anterior. No se modificaron esos perfiles:
la herramienta de acceso al navegador falló al iniciar en esta sesión.

## Verificación realizada

Ocho rutas antiguas redirigen al destino exacto, que responde HTTP 200;
incluye formularios, ejemplos, panel del restaurante y parámetros de Instagram.
Se comprobó que el inicio nuevo no cambió, los nueve enlaces siguen presentes,
la API está apagada y la configuración Preview del proyecto antiguo no cambió.
Pruebas de pagos y webhooks: 37/37 aprobadas.
