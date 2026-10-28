# Verificación del menú (hereda `crear-sitio-web/referencias/verificacion.md`)

Primero lee la de `crear-sitio-web` (servidor local, capturas, errores que ya ocurrieron). Aquí está lo propio del menú. **No digas "terminado" sin pasar el checklist de abajo, con evidencia.**

## 1. Servidor local
`.claude/launch.json` con el servidor sin caché del proyecto (en Bío Digital: `python web/servir.py 4321 web/propuesta`, nombre `maquetas`). Usa `http://localhost`.

## 2. En el computador (navegador integrado)
1. `node generar-menu.mjs --opciones` sin líneas "Revisar:" (cada una es un trabajo pendiente).
2. **Celular (390 px)**, para `index.html`, `opcion-*.html`, `privacidad.html` y `404.html`. Pega esto en la consola de la pestaña; todo debe dar vacío o 0:

```js
const out={};
for (const p of ['index.html','privacidad.html','404.html' /* + opcion-*.html */]){
  const f=document.createElement('iframe'); f.style.cssText='position:fixed;left:0;top:0;width:390px;height:844px;border:0;opacity:0;pointer-events:none';
  f.src='/'+p+'?v='+Date.now(); document.body.appendChild(f);
  await new Promise(r=>f.onload=r); await new Promise(r=>setTimeout(r,1200));
  const d=f.contentDocument, w=f.contentWindow;
  out[p]={ desborde: d.documentElement.scrollWidth - d.documentElement.clientWidth,
    textosChicos: [...d.querySelectorAll('body *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) && parseFloat(w.getComputedStyle(e).fontSize)<11.95 && !e.closest('[aria-hidden="true"]')).map(e=>e.tagName+'.'+e.className),
    tactilesChicos: [...d.querySelectorAll('button, a.chip, .cats a, input')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height<43.5&&!e.classList.contains('ar-oculto')}).map(e=>e.className),
    pendientes: d.body.innerHTML.includes('[PENDIENTE') };
  f.remove();
}
out
```
3. Consola sin errores; ninguna imagen, foto ni modelo con 404 (pestaña de red).
4. El **buscador** encuentra por nombre y por descripción; las categorías siguen el scroll; "Favoritos" sale solo si hay platos con la etiqueta.
5. Cada "Ver en tu mesa" abre el visor, gira, y cierra con Esc y con la X. Un plato `agotado` no muestra el botón.
6. **Modo automático** (si se usa `tema.auto`): cambia con el botón, se recuerda al recargar y sigue al sistema.
7. **Contraste**: el generador ya calcula 4,5:1 por estilo; si cambiaste `c1`/`c2`, confirma que no aparezca el aviso.
8. **Teclado**: Tab recorre todo con foco visible; "Saltar a la carta" funciona.
9. Reduce movimiento (`prefers-reduced-motion`) y confirma que todos los platos son visibles.

## 3. Datos de la carta (a mano, uno por uno)
- [ ] Nombres y precios **idénticos** a la carta que entregó el cliente.
- [ ] Etiquetas dietéticas y alérgenos: solo los que el cliente confirmó por escrito.
- [ ] Horario, dirección y WhatsApp: los que entregó (probar el enlace de WhatsApp).
- [ ] Sin "lorem", `[PENDIENTE]` olvidados ni enlaces `#`.

## 4. En celulares reales (obligatorio: aquí se prueba la realidad aumentada)
- [ ] **Android (Chrome)**: "Ver en tu mesa" abre la cámara, detecta la mesa y apoya el plato.
- [ ] **iPhone (Safari)**: igual (probado el 12-oct-2026 con un plato plano en un iPhone 15 Pro).
- [ ] **Tamaño**: el plato se ve del tamaño real junto a uno verdadero. Si sale gigante o diminuto, corregir la escala del archivo `.glb`.
- [ ] Con datos móviles (sin Wi-Fi): la carta abre en menos de 3 s y el 3D de un plato en menos de 10 s.
- [ ] Probar con luz de local, no solo en casa.
- [ ] Escanear el QR impreso con un celular distinto al que se usó para armarlo.

## 5. Después de publicar (sobre la dirección real, con las cabeceras de Cloudflare)
- [ ] **Consola sin avisos de política de seguridad (CSP).** Abre la carta publicada y un plato en 3D: no debe aparecer "Refused to load…". Si aparece, falta un servidor en `connect-src` o `script-src` (ver `_headers`).
- [ ] **Cabeceras**: https://securityheaders.com sobre la dirección. Meta: A o superior.
- [ ] **Rendimiento**: https://pagespeed.web.dev en móvil, ≥ 90 en las cuatro categorías; LCP < 2,5 s, CLS < 0,1.
- [ ] **Datos estructurados**: https://search.google.com/test/rich-results sin errores (no aplica a demos, que llevan `noindex`).
- [ ] `robots.txt`, `sitemap.xml`, `llms.txt`, `404.html` y `privacidad.html` abren.
- [ ] Imagen para redes: pegar el link en WhatsApp y comprobar que sale la imagen y el título.
- [ ] La dirección corta responde (si da 404, la rama de producción de Cloudflare no es `main`; usar `main.<proyecto>.pages.dev` o corregir en Settings).
- [ ] Dominio propio con HTTPS; el QR apunta al dominio final.
- [ ] Search Console con el dominio verificado y el sitemap enviado.

## 6. Seguridad y entrega
- [ ] Ningún secreto en la carpeta; `_headers` presente en lo publicado.
- [ ] Visor 3D con hash SRI (o guardado en `vendor/`); modelos y fotos en la carpeta del cliente, no en terceros.
- [ ] Accesos (dominio, Cloudflare, analítica) a nombre del cliente y acta de entrega firmada.
- [ ] El cliente sabe que **los cambios los hace Bío Digital** y cómo pedirlos.
- [ ] Código en Git con remoto y copia de las fotos y modelos fuera del hosting.

## Errores que ya ocurrieron (no repetir)
- **Script en línea con una política de seguridad estricta**: se bloquea y la página pierde su comportamiento (las apariciones suaves dejaron de funcionar). Todo script va en archivo propio.
- Un modelo de 8 MB tardaba más de 30 s en un celular. Tope: 5 MB por plato.
- Un modelo con las caras al revés se ve gris (backface culling): revisar orientación al generar discos.
- Foto del banco de imágenes con marca de agua o baja resolución: solo para pruebas, nunca publicada.
- `hidden` en un elemento con `display: grid` no lo oculta: añadir `[hidden] { display: none }`.
- Cloudflare toma como "vista previa" el primer deploy si la rama de producción no es `main`: la dirección corta da 404.
