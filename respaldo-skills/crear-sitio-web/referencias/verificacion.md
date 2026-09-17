# Verificación (maquetas y sitio)

## Servidor local
Crea `.claude/launch.json` con un servidor estático para la carpeta de maquetas y ábrelo con `preview_start`:

```json
{"version":"0.0.1","configurations":[{"name":"maquetas","runtimeExecutable":"npx","runtimeArgs":["--yes","http-server","<carpeta>","-p","4321","-c-1"],"port":4321}]}
```

Si hay Python disponible, sirve lo mismo con `python -m http.server 4321 -d <carpeta>`.

Usa siempre `http://localhost`: los archivos abiertos como `data:` o `file:` rompen las rutas relativas del CSS.

## Capturas completas (Chrome sin ventana)
Usa `plantilla/herramientas/captura.ps1`: toma la página en una ventana alta, fuerza movimiento reducido para que todo aparezca y la corta en tramos.

```powershell
& <carpeta>\herramientas\captura.ps1 -Page opcion-1-metal.html -Query 'tema=dark' -Tall 11000 -Slice 1400 -Scale 0.5 -Tag h
```

Lo que aprendimos del método:
- **Límite de Chrome:** no captura más allá de unos **8.192 px** (desde ahí repite el principio). Por eso se usa `-Scale 0.5`, que cubre hasta unos 16.000 px de página.
- **Captura por ancla:** capturar con `#ancla` o con scroll sale en blanco. Siempre se captura la ventana alta completa.
- **Alturas en `svh`:** con una ventana de 11.000 px, un hero de `100svh` mide 11.000 px. Por eso el hero lleva un tope: `min(calc(100svh - 104px), 900px)`.
- **Shaders a pantalla completa:** se ven con celdas gigantes en la captura alta. Es un efecto de la captura; revisa ese efecto en el navegador integrado a 1280×800.
- **WebGL sin ventana:** necesita `--use-angle=swiftshader --enable-unsafe-swiftshader`, que el script ya incluye.
- **Ancho mínimo:** Chrome sin ventana no baja de unos 500 px. Para ver el celular, captura a 500 y mide el desborde a 390 en el navegador integrado.
- **Animaciones congeladas:** con `--virtual-time-budget` quedan detenidas. Sin `--force-prefers-reduced-motion`, los elementos con retardo salen invisibles.

## Chequeo en celular (navegador integrado)
1. `resize_window` a 390×844.
2. Ejecuta en la pestaña (carga cada página en un iframe):

```js
const out={};
for (const p of ['opcion-1-metal.html' /* … */]){
  const f=document.createElement('iframe'); f.style.cssText='position:fixed;left:0;top:0;width:390px;height:844px;border:0;opacity:0;pointer-events:none';
  f.src='/'+p+'?v='+Date.now(); document.body.appendChild(f);
  await new Promise(r=>f.onload=r); await new Promise(r=>setTimeout(r,1800));
  const d=f.contentDocument, w=f.contentWindow;
  out[p]={ desborde: d.documentElement.scrollWidth - d.documentElement.clientWidth,
    chicos: [...d.querySelectorAll('body *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) && parseFloat(w.getComputedStyle(e).fontSize)<11.95 && !e.closest('[aria-hidden="true"]')).map(e=>e.tagName+'.'+e.className),
    pendientesCrudos: d.body.innerHTML.includes('[PENDIENTE') };
  f.remove();
}
out
```

3. Si hay desborde, busca el culpable filtrando los elementos con `getBoundingClientRect().right > ancho`. Si no aparece, es un pseudo-elemento: prueba ocultando secciones una por una.
4. Al terminar, vuelve a `resize_window` con `preset: "desktop"`.
5. Si cambiaste un CSS y no se nota, recarga ignorando la caché (`fetch(url, {cache:'reload'})` o `?v=`).

## Referencias externas
- En 21st.dev, el `src` del iframe de la demo lleva a `cdn.21st.dev/.../bundle.*.html`; captúralo con `?theme=dark`.
- En Lovable, la vista previa en vivo está en `*.lovable.app`.
- Captura cada referencia a 1440×900 y **mírala antes de diseñar**.

## Errores que ya ocurrieron (no repetir)
- Diseñar direcciones "propias" en vez de seguir los links del usuario.
- Pseudo-elementos con `position: absolute` en un padre sin `position: relative`: se ubican respecto de la sección y desbordan.
- Estilos de la página que pisan los del núcleo, como `.icon-btn` o `.nav-links`: el botón de menú aparece en escritorio. Sube la especificidad con `.nav …`.
- Un selector que apunta dentro del shadow tree de `<use>`: no funciona; hay que apuntar al `<svg>`.
- `grid-template-columns: 1fr` en móvil con contenido largo: desborda. Usa `minmax(0, 1fr)`.
- `sed` con expresiones regulares que llevan corchetes: se rompen. Para ediciones de código usa Edit o un script en Node.
- Espacio excesivo entre secciones: el padding recomendado es `clamp(28px, 3.6vw, 52px)` por lado.
- `backdrop-filter` sobre un canvas fijo: evitarlo.
- Paneles de ejemplo con métricas inventadas: solo datos reales de la oferta, con el rótulo "Ejemplo ilustrativo".

## Detector de diseño
Si Impeccable está instalado:

```
.claude/skills/impeccable/scripts/impeccable.cmd detect <archivo.html>
```

Corrige lo mecánico: contraste, textos chicos, íconos encajonados sobre el título. Deja lo que pide la referencia del cliente y explícalo.
