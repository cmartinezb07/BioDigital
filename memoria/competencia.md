# Competencia y margen de mejora · investigación del 22-oct-2026

Estamos en un **océano rojo**: hacer páginas web para pymes ya lo ofrecen freelancers, agencias, constructores con IA y apps por suscripción. Este documento mapea a quién nos enfrentamos, con cifras. Explica dónde ganamos y dónde perdemos, y qué cambiar para que la comparación de precio deje de ser lo único. Las cifras de terceros son **aproximadas**: verificar en la fuente antes de usarlas con un cliente.

## 1. Mercado (orden de magnitud)

| Dato | Valor | Fuente |
|---|---|---|
| Empresas en la región del Biobío | 92.609 (2014) | Ministerio de Economía con datos del SII |
| Micro + pequeñas en la región | 97,1 % (79,5 % micro, 17,6 % pequeñas, 2013) | ídem |
| Pymes con sitio web propio (Chile) | **23,1 %** (2024) | Cámara de Comercio de Santiago, citado por Emol |
| Microemprendedores en Chile | 1.998.178, el 54,2 % informal (2025) | INE, VIII EME |
| Sitios gratuitos de Google Business cerrados | ~21,7 millones (marzo 2024) | DAC Group, Bluehost y otros |

**Estimación (hipótesis, no dato):** si el Gran Concepción concentra cerca del 60 % de la actividad regional, hay del orden de **50.000 micro y pequeñas empresas**. Con 23 % que tiene web, unas **38.000 no la tienen**. La meta de 3 a 5 clientes es menos del 0,02 % de ese universo. **El cuello de botella no es el tamaño del mercado, es la confianza y la conversión.**

## 2. Mapa de competencia

| Tipo | Ejemplos | Precio publicado (aprox.) | Modelo | Qué hacen mejor que nosotros | Qué hacemos mejor |
|---|---|---|---|---|---|
| Freelancer local | Zurdev (Yapo, Concepción), perfiles en Cronoshare | desde $55.000 a $150.000 | Pago único | Precio parecido, trato directo | Ejemplos en vivo, precios publicados, varios servicios en un pack, transferencia con acta |
| Agencia | INAN (One Page $160.000 + IVA, 3 días hábiles), Corobori (Concepción, desde 1997), Lofwork | $160.000 a $1.500.000 + IVA | Pago único + hosting y mantención | Trayectoria, hosting y correos incluidos, portafolio real | Precio 3 a 10 veces menor, velocidad (tabla 4), sin mensualidad de hosting |
| Constructor con plantilla o IA | Wix (US$17 a 159 al mes), Hostinger IA (US$2,99 a 10,99 al mes) | US$11 a 17 al mes en planes de entrada | Suscripción | Lo hace el dueño en minutos, a cualquier hora | El dueño no hace nada, fotos propias del local, costo total a 3 años 4 a 7 veces menor |
| App de reservas | AgendaPro (Individual $15.900 + IVA al mes; Premium $54.900), AgendaLibre (gratis) | $15.900 a $249.900 al mes | Suscripción | Recordatorios por WhatsApp, caja, comisiones, marketplace | Pago único; reserva dentro de su propia página; recordatorio en el calendario del cliente sin costo |
| Menú QR | Neolo (gratis hasta 200 visitas; $4.000 a $9.000 al mes), QRCarta, Scantastic | $0 a $9.000 al mes | Suscripción | Foto de la carta → menú con IA, traducción automática, alérgenos, estadísticas de escaneo | **Plato en 3D y realidad aumentada** (nadie más lo ofrece), diseño a medida, pago único |
| Fidelización | Krip (Timbres), Fidelize, Loyapp, Loopy, Oappso | mensualidad (no publicada en CLP) | Suscripción | Wallet, métricas, app ya hecha | Pago único (si se vende la variante QR, ver §5) |
| Gratis | Instagram, WhatsApp Business (catálogo), Linktree, Perfil de Negocio de Google | $0 | — | Cero costo; ahí ya están los clientes | Página propia que aparece en Google, con reservas y menú |

**Lectura:** nadie en el Gran Concepción publica un **pack** que junte página, menú, reservas, fotos, videos y fidelización con **pago único y precio visible**. Las agencias esconden precios ("cotiza sin compromiso") y las apps cobran mes a mes por una sola función. Esa es la grieta del océano rojo.

## 3. Costo total a 3 años (lo que ve el cliente)

| Opción | Pago | En 3 años, aprox. |
|---|---|---|
| Bío Digital página web | $49.990 + dominio .cl (~$10.000 al año) | **~$80.000** |
| Bío Digital pack completo | $79.990 + dominio | **~$110.000** |
| Constructor con plantilla o IA | US$11 a 17 al mes | ~$370.000 a $580.000 |
| App de reservas | $15.900 + IVA al mes | ~$680.000 |
| Menú QR por suscripción | $4.000 a $9.000 al mes | ~$150.000 a $330.000 |
| Agencia o diseñador | $160.000 a $1.000.000 + hosting y mantención | desde ~$200.000 |

Supuestos: IVA del 19 %; tipo de cambio aproximado de US$1 = $950 (verificar); el alojamiento en Cloudflare sin costo para el cliente (verificar términos vigentes). Esta tabla estuvo publicada en el sitio del 22 al 23-oct; **el usuario decidió sacarla de la portada (23-oct)** y queda solo aquí.

## 4. Velocidad medida (mismo método para todos)

Chrome sin ventana, ancho de celular (390 px), sin limitar CPU ni red, el 22-oct-2026. Sirve para **comparar entre sí**, no son cifras de PageSpeed.

| Sitio | Peso | Peticiones | Dominios externos | LCP |
|---|---|---|---|---|
| Ejemplo estudio contable (nuestro) | **139 KB** | 9 | 2 | 2,3 s |
| Ejemplo barbería (nuestro) | 243 KB | 12 | 2 | **0,7 s** |
| Ejemplo cabañas (nuestro, antes → después) | 3.736 KB → **901 KB** | 14 | 2 | 3,0 → 3,5 s* |
| Portada Bío Digital | 566 KB | 35 | 1 | 3,8 s* |
| INAN (agencia) | 1.428 KB | 34 | 2 | 2,2 s |
| Corobori (agencia, Concepción) | 654 KB | 49 | 3 | 5,2 s |
| Lofwork (agencia) | 333 KB | 41 | **14** | 1,5 s |
| AgendaPro | 614 KB | **153** | **32** | 2,5 s |

\* En nuestra portada y en cabañas, el LCP lo marca la animación de entrada (el carrusel y el título), no la red: en el laboratorio el LCP sigue contando mientras la animación muestra elementos nuevos. Margen de mejora: §6, punto 7.

**Argumento de venta cuantificado:** nuestras páginas cargan con 9 a 14 peticiones y 2 dominios externos. Una app de suscripción como AgendaPro hace 153 peticiones a 32 dominios. Mientras menos terceros, más rápida en el celular y menos rastreo.

## 5. Hallazgos ordenados por impacto

**CRÍTICO**
1. **Fidelización: se prometía un costo recurrente a precio único.** La ficha del servicio dice que la variante Wallet cuesta US$25 a 50 al mes, pero la página la vendía a $9.990 "sin mensualidad" con la frase "se guarda en Google Wallet y Apple Wallet". Con 10 clientes serían US$3.000 a 6.000 al año que nadie paga. **Corregido el 22-oct:** la página ahora promete la variante QR (acceso directo en el celular) y la de Wallet se cotiza aparte por su mensualidad. Falta que el equipo decida cómo se construye la variante QR con costo $0 (sugerencia: Supabase, ya en uso, con un registro por cliente y un enlace con firma).
2. **La ficha de Google Business salió del catálogo** (6-oct), aunque es lo que más mueve a un negocio local. Tiene costo $0, unas 2 horas de trabajo, y es la base del diagnóstico gratis y del argumento "que te encuentren cuando buscan tu rubro cerca". Google cerró sus sitios gratuitos en 2024, así que hoy muchos negocios tienen solo la ficha, mal llenada. **Recomendación:** volver a incluirla, como regalo dentro del pack o a $9.990 sola. Es el diferenciador más barato y el que más pesa frente a los constructores con IA, que no la configuran.
3. **Sin clientes reales, la confianza es el cuello de botella** (§1). Lo que hay hoy son 8 ejemplos ficticios. **Recomendación:** convertir los primeros 5 clientes en casos documentados, con antes y después, tiempo de entrega y una métrica (clics en WhatsApp o llamadas desde Google), con permiso escrito. La promoción "primeros 5" ya existe: falta pedir a cambio el caso y una reseña en Google.

**IMPORTANTE**
4. **Garantía de riesgo cero.** Ningún competidor revisado publica una garantía. Propuesta: "Pagas el 50 % cuando apruebas la maqueta y el 50 % al recibir la página funcionando". Calza con el acta de entrega y con los términos publicados. Es decisión del equipo.
5. **Correo con el dominio del negocio.** INAN incluye cuentas de correo y nosotros no. Cloudflare Email Routing reenvía contacto@negocio.cl a su Gmail **sin costo** (verificar términos). Se puede sumar sin mensualidad.
6. **Reseñas.** Un QR que lleva directo a "dejar reseña en Google" impreso en la mesa o el mesón cuesta $0. Hoy está en espera porque depende de la ficha (punto 2).
7. **Velocidad de la portada.** El LCP de laboratorio es de 3,8 s por las animaciones de entrada. Ya se bajó el peso del carrusel de unos 420 KB a 208 KB (miniaturas de 720 px). Falta que el título de la portada sea visible desde el primer momento (animar solo el movimiento, no la opacidad) y que las tarjetas no aparezcan con retraso.
8. **Menú digital frente a Neolo.** Ellos tienen traducción automática, alérgenos y estadísticas de escaneo; nosotros, el 3D y la realidad aumentada (único). Para cerrar la brecha a costo $0: etiquetas de alérgenos en `menu.json`, botón de inglés para turistas y Cloudflare Web Analytics para contar visitas.
9. **Reservas frente a AgendaPro.** Ellos mandan recordatorios por WhatsApp. Nosotros ya dejamos un recordatorio en el calendario del cliente: 1 hora antes en citas y, desde hoy, 1 día antes en las reservas por noche, sin costo por mensaje. Decirlo en la página: "recordatorio en tu calendario, sin pagar por mensaje".

**MENOR**
10. Los precios de la competencia cambian: revisar la tabla del §3 cada 3 meses.
11. Subsidios: Sercotec **Kit Digital** entrega $1.200.000 netos por empresa y acepta sitio web como gasto. La convocatoria 2026 cerró en junio; la siguiente sería cerca de junio de 2027 (estimado). Fuera del semestre, pero sirve para la etapa siguiente: ayudar al cliente a postular y que el subsidio pague el pack.

## 6. Movimientos de "océano azul" dentro del océano rojo (matriz CREA de Bío Digital)

| Eliminar | Reducir | Aumentar | Crear |
|---|---|---|---|
| Mensualidades de plataforma para el cliente | El tiempo del dueño: no edita nada | Precio publicado y comparable (tabla de 3 años) | Visita al local con fotos y videos propios |
| Cotizaciones a ciegas ("cotiza sin compromiso") | Terceros en la página (2 dominios frente a 32) | Pruebas en vivo: 8 ejemplos navegables | Plato en 3D y realidad aumentada en el menú |
| Dependencia de Instagram como única presencia | Riesgo del cliente (garantía 50/50, propuesta) | Presencia en Google (ficha, propuesta) | Pack que junta seis servicios con pago único |

## 7. Recursos encontrados para mejorar (no instalados; evaluar antes)

| Necesidad | Opción | Nota |
|---|---|---|
| Tarjeta en Wallet | `laravel-apple-google-wallet-integration`, Spatie `laravel-mobile-pass`, SDK de PassKit | Apple exige cuenta de desarrollador pagada: costo recurrente |
| Reservas con más funciones | Cal.com o Cal.diy (código abierto, licencia MIT según el listado) | Requiere servidor propio; no calza con "sin mensualidad" |
| Recordatorios por WhatsApp | API de WhatsApp Business o un proveedor como Sent | Cobra por mensaje: recurrente |
| Analítica sin cookies | Cloudflare Web Analytics (ya previsto en la skill) | $0 |
| Correo con dominio | Cloudflare Email Routing | $0, solo reenvío |
| Velocidad comparable | PageSpeed Insights API (requiere clave gratuita de Google Cloud) | Hoy se mide con `pruebas/peso.js` |

## 8. Lo que ya se aplicó el 22-oct

- Sección pública "Cuánto cuesta tener tu página en 3 años" (§3), con valores aproximados y aviso de verificar.
- Fidelización: se corrigió la promesa de Wallet (§5.1).
- Fotos adaptadas al celular (`srcset` de 800 y 1.600 px) en los 7 ejemplos: cabañas bajó de 3,7 MB a 0,9 MB en celular.
- Miniaturas de 720 px para el carrusel (208 KB en total para 8 tarjetas).
- Recordatorio de 1 día antes en las reservas por noche (`.ics`). El módulo sigue pasando sus 61 pruebas.
- Herramientas de medición: `web/herramientas/pruebas/peso.js` (peso, peticiones y LCP) y `pruebas/lcp.js` (qué elemento es el LCP).

## 9. Decisiones pendientes del equipo (por impacto)

1. ¿Vuelve la ficha de Google Business? Propuesta: incluida en el pack, y a $9.990 sola.
2. ¿Cómo se construye la fidelización QR con costo $0? ¿Se ofrece la variante Wallet como mensualidad?
3. ¿Garantía 50 % al aprobar la maqueta y 50 % al entregar?
4. ¿Qué se pide a los primeros 5 clientes a cambio de la promoción (caso documentado y reseña)?
5. ¿Correo con dominio (reenvío gratis) dentro del pack?

## 10. Fallas de la competencia y lo que agregamos · 23-oct-2026

Pedido del usuario: "busca a la competencia, agrega algo que nos falte y resalta sus fallas". Resultado publicado en una **página aparte** (`/antes-de-contratar/`, generada por `fuentes/antes.mjs`), enlazada desde el pie y bajo las promesas de la sección de precios. **La página pública no nombra marcas** (publicidad comparativa y reclamos de terceros no verificados); los nombres y enlaces quedan aquí.

| # | Falla | Quién (interno) | Evidencia | Cómo la evitamos |
|---|---|---|---|---|
| 1 | Dominio y claves quedan con el desarrollador; el cliente pierde la dirección | Reclamos contra una empresa de diseño web en reclamos.cl (2023, 2025) | [reclamo 2023](https://www.reclamos.cl/paginas-web-chile/reclamo/2023/feb/paginas-web-chile-estafa) · [reclamo dic-2025](https://www.reclamos.cl/paginas-web-chile/reclamo/2025/dec/paginas-web-chile-estafa-no-responden-lo-que-indican) | Dominio a nombre del negocio en NIC Chile (verificable en nic.cl), accesos con acta |
| 2 | Anticipo de 50 % sin presupuesto ni condiciones por escrito | ídem (2025) | [reclamo ene-2025](https://www.reclamos.cl/paginas-web-chile/reclamo/2025/jan/paginas-web-chile-incumplimiento-no-devoluci-nde-dineros) | Propuesta escrita antes de pagar; saldo al firmar el acta (términos) |
| 3 | "Pago único" con alojamiento que se renueva cada año | INAN: plan PYME-S ~$60.900 + IVA al año; dominio gratis solo el 1.er año | [INAN hosting pymes](https://inan.cl/en/web-hosting-pymes/) · [INAN diseño](https://inan.cl/en/diseno-web/) | Cloudflare sin costo; solo el dominio (~$10.000/año) directo a NIC |
| 4 | El sitio no se puede llevar a otro alojamiento | Wix (soporte oficial) | [Wix: exportar o incrustar](https://support.wix.com/es/article/exportando-o-incrustando-tu-p%C3%A1gina-web-wix) | HTML estándar: el cliente se lo lleva |
| 5 | Extras pagados: mensajes de WhatsApp aparte, alzas periódicas, app móvil que se pega | AgendaPro (Capterra 4,8/5, pero con estas quejas) | [Capterra](https://www.capterra.com/p/218709/AgendaPro/reviews/) · [Medesk](https://www.medesk.net/es/blog/agenda-pro-review/) | Pago único; recordatorio al calendario sin costo por mensaje |
| 6 | Menú QR = PDF que hay que agrandar | Categoría completa | [Restaurant Technology News, ago-2026](https://restauranttechnologynews.com/2026/08/why-restaurant-qr-menus-have-an-execution-problem-not-a-concept-problem/) | Carta web para el celular, buscador, favoritos, 3D |
| 7 | Páginas pesadas, 32 dominios externos | AgendaPro (medición propia §4) | §4 | 9 a 14 archivos, 2 dominios |
| 8 | Correo con dominio solo dentro del plan anual | INAN (15 correos en One Page, dentro del alojamiento) | [INAN diseño](https://inan.cl/en/diseno-web/) | **Agregado:** ver abajo |

**Lo que agregamos (nos faltaba): correo con el dominio del negocio, sin mensualidad.** Desde el 23-oct la ficha de "Página web" incluye "Correo contacto@tunegocio.cl que llega a tu Gmail, sin mensualidad". Cómo: Cloudflare Email Routing (gratis, recibe y reenvía; [límites](https://developers.cloudflare.com/email-routing/limits/): 200 reglas y 200 direcciones) + Gmail "Enviar como" con `smtp.gmail.com` y contraseña de aplicación (requiere verificación en 2 pasos) + registro SPF. Costo recurrente $0 **según condiciones vigentes (verificar)**. Límites que hay que decirle al cliente: es un reenvío, no un buzón aparte; requiere el dominio .cl comprado; con DMARC estricto algún correo reenviado puede caer en spam. Trabajo estimado: 20 a 30 min por cliente. Si se agrega Google Workspace o Microsoft 365, sus registros MX reemplazan el reenvío.

**Otras cosas que tiene la competencia y no agregamos (por qué):**
- Soporte 24/7 y garantía de 30 días (INAN): nuestros términos ya dicen que corregimos sin costo los errores nuestros, pero **sin plazo**. Decisión del equipo: ¿fijar un plazo (p. ej. 30 días) o dejarlo abierto? No se publicó nada nuevo.
- Pago protegido (2x3.cl: el profesional cobra al terminar). Se parece a nuestro saldo contra acta; la garantía 50/50 ya fue descartada el 23-oct.
- Autoadministrable (INAN, Wix): **no aplica**, regla del proyecto: el cliente no edita.

## Fuentes

Precios y mercado: [AgendaPro planes](https://agendapro.com/planes) · [INAN diseño web](https://inan.cl/en/diseno-web/) · [Neolo menú QR](https://www.neolo.com/chile/menu-qr/) · [2x3, precios de diseñador web](https://www.2x3.cl/p/precios-disenador-web) · [Yapo, diseñadores web](https://www.yapo.cl/anuncios-casificados-negocios-servicios-servicios-varios-programadores-y-disenadores-web) · [Cronoshare Concepción](https://www.cronoshare.cl/servicios/crear-pagina-web/region-del-biobio/concepcion) · [Mercantil, Corobori](https://mercantil.com/empresa/corobori-sistemas/concepcion/300085656/esp) · [Lofwork](https://www.lofwork.cl/pagina-web-para-pyme/) · [Wix pricing 2026](https://www.websitebuilderexpert.com/website-builders/wix-pricing/) · [Hostinger IA](https://www.tooltester.com/es/opiniones/hostinger-websitebuilder/) · [Emol, digitalización pyme 2024](https://www.emol.com/noticias/Economia/2024/09/13/1142761/digitalizacion-de-las-pyme.html) · [INE EME 2025](https://www.ine.gob.cl/sala-de-prensa/prensa/general/noticia/2025/12/10/en-chile-hay-cerca-de-2-millones-de-personas-microemprendedoras) · [Min. Economía, Biobío](https://www.economia.gob.cl/wp-content/uploads/2014/11/VIII-Región-del-Biobio1.pdf) · [Cierre de sitios de Google Business](https://www.bluehost.com/blog/?p=49637) · [Sercotec Kit Digital 2026](https://www.sercotec.cl/wp-content/uploads/2026/06/Bases-RUTA-DIGITAL-Kit-Digital-2026-Nuble-VB°.pdf) · [Diario Estrategia, Kit Digital](https://www.diarioestrategia.cl/texto-diario/mostrar/5926775/sercotec-lanza-fondo-kit-digital-cual-podran-postular-cerca-4-mil-pymes) · [Krip Timbres](https://chocale.cl/2021/09/krip-lanza-nueva-funcionalidad-de-tarjeta-de-fidelizacion-en-formato-digital/) · [Open Alternative, agendamiento](https://openalternative.co/categories/appointment-scheduling/using/whatsapp) · [Laravel Wallet](https://packagist.org/packages/yacoubalhaidari/laravel-apple-google-wallet-integration).
