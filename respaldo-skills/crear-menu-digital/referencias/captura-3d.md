# Captura 3D de los platos (escaneo con el celular)

Objetivo: un archivo `.glb` por plato, **de menos de 5 MB** y **en tamaño real** (metros), que se vea bien sobre la mesa del cliente.

## Antes de ir al local
- Celular con buena cámara y la app de escaneo ya instalada y probada: **Polycam**, **Luma AI** o **Kiri Engine** (alguna sirve; compara una prueba en casa). Revisa precio y límites del plan gratuito en cada app antes de comprometer a un cliente; cambian.
- Llevar: plato blanco o liso del propio local, mantel o superficie **mate** (sin brillos ni reflejos), una cartulina blanca para rebotar luz, regla o cinta métrica.

## En el local, por cada plato
1. **Servir el plato recién preparado**, como lo recibe el cliente. Los platos fríos o sólidos (empanadas, brochetas, postres) escanean mejor que sopas, líquidos o salsas brillantes.
2. **Luz**: junto a una ventana, luz difusa. Sin flash, sin sol directo, sin focos que dejen brillos.
3. **Fondo y mesa**: superficie lisa y mate. Sacar servilletas, vasos y cubiertos que no sean parte del plato.
4. **Escanear**: dar una vuelta completa al plato a dos alturas (a 45° y casi de lado), con el celular a unos 30 a 40 cm, moviéndose despacio y sin que el plato se mueva. 40 a 70 fotos o video lento de 40 a 60 segundos según la app.
5. **Medir el plato** (diámetro del plato o largo del producto) y anotarlo en el `menu.json`. Sirve para revisar que el modelo salga a tamaño real.
6. Repetir si en la vista previa se ven huecos, partes derretidas o el plato "pegado" a la mesa.

## Después, en el computador
1. Exportar como **GLB** (glTF binario). Si la app ofrece "optimizado" o "móvil", usarlo.
2. Recortar la mesa y lo que sobre, y **bajar el peso a menos de 5 MB**: reducir polígonos a unos 30.000 a 80.000 y texturas a 1024 o 2048 px. Herramientas gratuitas: gltf.report (en el navegador) o gltf-transform (necesita instalarse; pide permiso al usuario antes).
3. Comprobar el **tamaño real**: abrir el `.glb` en https://modelviewer.dev/editor/ o en el propio menú y comparar con la medida anotada. Si sale gigante o diminuto, corregir la escala en el programa (no con `escala` del menu.json, que cambia el 3D pero confunde la realidad aumentada).
4. Guardar como `modelos/<id-del-plato>.glb`, con el mismo `id` que en `menu.json`.
5. Hacer la foto del plato para la tarjeta (cuadrada 800 × 800, luz natural, desde arriba o 45°) y guardarla en `fotos/`.

## Qué esperar (para no prometer de más)
- Un escaneo con celular **no es perfecto**: el resultado depende de la luz, la superficie y el plato. Mostrar al cliente la vista previa antes de publicar y repetir los que no sirvan.
- Platos con líquidos, vapor, mucho brillo o partes transparentes pueden no escanear bien. Para esos, dejar solo la foto.
- Prueba hecha el 12-oct-2026: el visor 3D funciona con un modelo de muestra (brocheta, 1,6 MB). La realidad aumentada con la cámara se probó en un iPhone 15 Pro con un plato plano hecho desde una foto: se apoya en la mesa a tamaño real. **Falta probarla con un escaneo 3D real** y en Android antes de venderla.

## Apps de escaneo: planes y marca de agua (revisado el 12-oct-2026, verificar antes de contratar)
- **Polycam (iPhone 15 Pro del equipo):** según su ayuda, los escaneos se pueden exportar gratis en GLB, pero la salida del plan gratis puede llevar **marca de agua** y el modo de fotos tiene un tope de capturas que las fuentes no confirman (150 fotos por modelo, o 180 capturas en total). Revisar poly.cam/pricing y hacer **una prueba de exportación** antes de prometerle algo a un cliente. Para platos pequeños conviene el modo **fotos** (Photo), no LiDAR: el LiDAR es mejor para espacios y objetos grandes.
- **Alternativas gratuitas a probar con el mismo plato:** Scaniverse (Niantic) y RealityScan (Epic Games), ambas para iPhone. No hemos verificado sus límites ni si exportan GLB sin marca de agua.
- Si ninguna gratuita sirve, el plan de pago de la app es un costo del servicio: sumarlo al precio de la versión interactiva.

## Plato plano desde una foto (provisorio)
`python foto-a-modelo.py disco ...` crea un plato de 2,2 cm de alto (centro hundido, borde levantado) con la foto desde arriba como textura. Se ve bien sobre la mesa con la cámara, pero la imagen sigue siendo plana: no tiene volumen de comida. Probado en un iPhone el 12-oct-2026.
