# Guía de tu planilla: cambia tus precios y avisos sin pedirnos ayuda

Tu página lee su información de una planilla de Google que es tuya. Cuando cambias un dato en la planilla, la página lo muestra. No pagas mensualidad por esto.

## Qué puedes cambiar y qué no
**Puedes cambiar:** precios, servicios (nombre, duración, descripción), horarios, barberos o profesionales, avisos y promociones con fechas, y días libres.

**No puedes cambiar:** el diseño (colores, letras, fotos de la portada) ni la estructura (qué secciones hay y en qué orden). Si quieres algo de eso, escríbenos y lo hacemos nosotros.

## 1. Tu planilla
Te compartimos una planilla con cuatro pestañas. Ábrela con tu cuenta de Google y haz **Archivo → Hacer una copia**: esa copia es tuya. Avísanos con el enlace para dejar la página conectada a ella.

## 2. Qué significa cada pestaña

**Servicios** (una fila por servicio)
| Columna | Qué poner | Ejemplo |
|---|---|---|
| Servicio | Nombre | Fade |
| Categoría | Grupo donde aparece | Cortes |
| Precio | Solo números, sin $ ni puntos | 12000 |
| Duración (min) | Minutos | 45 |
| Descripción | Texto corto (puede ir vacío) | Degradado a máquina |
| Activo | Sí o No | Sí |

**Horario** (una fila por tramo)
| Columna | Qué poner | Ejemplo |
|---|---|---|
| Día | Lunes a Domingo | Martes |
| Abre | Hora con dos puntos | 10:00 |
| Cierra | Hora con dos puntos | 13:30 |

Si cierras a almuerzo, pon dos filas el mismo día (10:00 a 13:30 y 15:00 a 20:00). Un día sin filas se muestra como cerrado.

**Barberos** (o profesionales)
| Columna | Qué poner |
|---|---|
| Barbero | Nombre |
| Activo | Sí o No |

**Aviso** (promociones o noticias)
| Columna | Qué poner | Ejemplo |
|---|---|---|
| Título | Frase corta | Semana de descuento |
| Texto | El mensaje | 15% en Corte + barba |
| Desde | Fecha dd-mm-aaaa | 28-10-2026 |
| Hasta | Fecha dd-mm-aaaa | 30-11-2026 |
| Activo | Sí o No | Sí |

El aviso solo se ve entre "Desde" y "Hasta".

## 3. Cómo hacer los cambios más comunes
- **Cambiar un precio:** en Servicios, edita la celda de Precio (solo números).
- **Ocultar un servicio un tiempo:** pon **No** en Activo. Para volver a mostrarlo, **Sí**.
- **Poner una promoción:** en Aviso escribe título, texto y las fechas, con Activo **Sí**.
- **Un barbero no está:** pon **No** en su fila de Barberos.
- **Cambiar el horario:** edita Abre y Cierra del día.
- **Un día libre:** cuéntanoslo con anticipación o bloquéalo en tu Google Calendar; el calendario sigue mandando para las horas ocupadas.

## 4. Cómo ver el cambio
Recarga tu página en el navegador (en el celular, cierra y vuelve a abrir). Google puede tardar unos minutos en publicar el cambio (cifra por verificar). Si pasaron más de 15 minutos y no cambia, revisa la sección de errores.

## 5. Errores típicos
- **El precio no cambia:** tiene el signo $ o un punto. Pon solo números: 12000.
- **La fecha del aviso no aparece:** usa el formato 28-10-2026 (día-mes-año).
- **La hora no se entiende:** escríbela como 10:00, no "10 am".
- **Un servicio desapareció:** revisa que Activo diga **Sí**.
- **Cambié el nombre de una pestaña o columna y todo volvió a lo de antes:** devuélvele su nombre original. Si alguna parte no se puede leer, la página mantiene el texto anterior en vez de quedar en blanco.
- **Quiero saber qué filas no se entendieron:** agrega `?revisar=1` al final del enlace de tu página; te muestra la lista.

No borres ni cambies el orden de las columnas, ni el nombre de las pestañas.

## 6. Si algo no se arregla
Escríbenos por WhatsApp con el enlace de tu página y una captura de la planilla.

---

# Sección técnica (equipo de Bío Digital)

### Entrega real del panel y la planilla (5 pasos)
1. Borrar `demo.config.js` y sus 2 `<script>` (en `index.html` y en `mi-agenda/index.html`).
2. En `mi-agenda/config.js`, poner `planillaUrl` = enlace de SU Google Sheet (o dejarlo vacío: el botón "Editar mi página (planilla)" no se muestra).
3. Quitar `demoPlanilla` de `contenido.config.js` y de `simple.config.js`.
4. Apuntar los 4 CSV (servicios, horario, barberos, aviso) a sus enlaces publicados de Google Sheets, en la configuración del sitio y en `planillaPestanas` de `mi-agenda/config.js`.
5. Probar: sin la franja de demostración, sin botón a `mi-planilla/` si `planillaUrl` está vacío, y los cambios de la planilla se ven en la página.

Referencia ya hecha y probada: `web/propuesta/ejemplos/barberia-simple/` (contenido) y `web/propuesta/ejemplos/reservas-simple/` (reservas). Solo la barbería usa planilla en su contenido; las demás páginas de ejemplo siguen estáticas a propósito.

1. **Crear la planilla:** generar el .xlsx con `python web/herramientas/crear-plantilla-planilla.py --prefijo barberia --nombre "Barbería El Filo" --color 8e0f0f --oscuro 141414 --whatsapp 56946941640` (lee los 4 CSV de `planilla-ejemplo/` y crea `docs/plantillas/planilla-barberia.xlsx`; para otro negocio, otros CSV, nombre y colores). Subir el .xlsx a Google Drive y abrirlo con Hojas de cálculo (clic derecho → Abrir con → Hojas de cálculo; si pide, Archivo → Guardar como Hojas de cálculo de Google). Por verificar al importar: que se mantengan los colores, las listas desplegables (incluida la lista de horas, que está en la pestaña oculta "Listas"), las notas de los encabezados y las fechas como fechas. Si algo no se importa, anotarlo aquí. Los encabezados no se tocan.
   - **Avisos de rango:** Precio solo acepta enteros de 0 a 500.000 (CLP) y muestra el ejemplo al seleccionar la celda; fuera de rango la planilla rechaza el dato ("Precio fuera de rango"). Duración acepta enteros de 5 a 720 minutos. Si pegan datos y se salta la validación, el Precio se pinta rojo fuerte (no es número, es negativo o pasa de 500.000) y amarillo si pasa de 100.000 (posible error de ceros). Por verificar: que Google Sheets conserve estos avisos al importar el .xlsx.
   - **Avisos de colores (rojo = corregir, amarillo = revisar):** Servicios: rojo si el servicio está repetido, o hay precio sin servicio (o al revés), o el precio no es número/negativo/sobre 500.000; amarillo si el precio pasa de 100.000 o la descripción de 150 caracteres. Horario: rojo si Cierra no es posterior a Abre o falta una de las dos horas; amarillo si se repite el mismo día con la misma hora de apertura (los turnos partidos, como mañana y tarde del mismo día, no se marcan). Barberos: rojo si el nombre está repetido. Aviso: rojo si Hasta es anterior a Desde o el título pasa de 60 caracteres; amarillo si el texto pasa de 200. Las celdas de texto largo también avisan al escribir (título: bloquea; los demás: advierte) y muestran un ejemplo al seleccionarlas. Están resumidos en la hoja Léeme. Por verificar: que Google Sheets conserve estas reglas (COUNTIFS, LEN) al importar.
   - **Protección:** cada hoja del .xlsx está protegida sin contraseña: solo las filas 2 a 200 de las columnas de datos (celdas blancas o grises) se pueden editar; el encabezado, la hoja Léeme y la hoja oculta Listas están bloqueados a propósito para no romper la página. Se permite ordenar, filtrar, insertar y eliminar filas y cambiar anchos; no cambiar formato de celdas. Bío Digital desbloquea en Excel con Revisar → Desproteger hoja. **Por verificar:** si Google Sheets conserva la protección al importar el .xlsx (como rango protegido) o la pierde; no asumirlo. Si se pierde, protegerla a mano en Hojas: Datos → Proteger hojas y rangos, dejando editables solo las columnas de datos desde la fila 2.
2. **Publicar cada pestaña como CSV:** Archivo → Compartir → Publicar en la web → elegir la pestaña (no "Documento completo") → formato CSV → Publicar. Copiar la URL de cada una (4 en total).
3. **Pegar las URL:**
   - `web/propuesta/ejemplos/barberia-simple/contenido.config.js` → `servicios`, `horario`, `barberos`, `aviso`.
   - `web/propuesta/ejemplos/reservas-simple/simple.config.js` → `planilla: { servicios, horario, barberos }` del negocio.
4. **Verificar:** abrir la página con `?revisar=1`; debe decir "Contenido de la planilla cargado sin problemas". Cambiar un precio en la planilla, recargar y confirmar.
5. **Seguridad:** la planilla es contenido no confiable; el código solo usa `textContent`. Nunca insertar HTML de la planilla.
6. **Tiempo de publicación de Google:** por verificar con una planilla real.
7. Resumen de mañana con nombres de clientes: requiere el mini panel "Mi agenda" (el dueño entra con Google), en construcción.
