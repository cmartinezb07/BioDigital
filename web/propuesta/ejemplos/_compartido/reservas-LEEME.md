# Módulo de reservas de Bío Digital

Un solo `reservas.js` y un `reservas.css`, sin librerías, para cualquier sitio de ejemplo o de cliente. Dos modos:

- **`horas`**: peluquerías, estética, talleres, consultas. Servicio → profesional (opcional) → día → hora → datos → resumen.
- **`noches`**: cabañas, hospedajes, arriendos por noche. Alojamiento → llegada y salida → huéspedes y total → datos → resumen.

Qué hace en **nivel 1** (sin servidor): la persona arma su solicitud y, al confirmar, se abre WhatsApp con el mensaje listo. Además puede bajar un archivo `.ics` para agregarla a su calendario. Detalle de límites y del nivel 2 más abajo.

Demostración con los dos modos: `reservas-demo.html` (abrirla desde el servidor local del proyecto).

---

## 1. Cómo se monta

Copiar `reservas.js` y `reservas.css` al sitio (están en `ejemplos/_compartido/`) y agregar:

```html
<link rel="stylesheet" href="../_compartido/reservas.css">

<div id="reserva"></div>

<script src="../_compartido/reservas.js"></script>
<script>
  BDReservas.montar('#reserva', { /* configuración: ver las secciones 2 y 3 */ });
</script>
```

- `BDReservas.montar(elementoOSelector, config)` acepta un selector CSS o el elemento. Se puede llamar **varias veces en la misma página** (cada montaje es independiente). Volver a montar sobre el mismo elemento lo reemplaza.
- Devuelve un objeto: `{ ok, el, reiniciar(), destruir(), estado() }`. Si la configuración es inválida devuelve `{ ok: false, errores: [...] }`.
- **Configuración inválida**: el módulo muestra en pantalla un recuadro rojo con la lista de lo que falta o está mal escrito (por ejemplo, un servicio sin `duracion`). No lanza errores en la consola.
- Todo el texto del cliente (nombres de servicios, negocio, notas de quien reserva) se inserta con `textContent`: no se interpreta HTML.
- Ancho recomendado: desde 320 px. Con un contenedor de menos de unos 300 px, los días del calendario bajan de los 44 px de área táctil.

### Modo demostración

Se activa con `demo: true` en la configuración **o** con el atributo `data-demo` en el contenedor (`<div id="reserva" data-demo>`). En demo:

- Algunos bloques y noches salen **ocupados de forma determinista** (se calculan a partir de la fecha y del nombre del negocio, no con azar: la misma fecha siempre muestra lo mismo al recargar).
- Se muestra la insignia **"Disponibilidad de ejemplo"** y los precios llevan "(precio de ejemplo)".
- Al confirmar **no se abre WhatsApp**: se llama a `window.bdAvisoDemo(texto)` si existe (la define `demo.js`, la cinta "Ejemplo de Bío Digital"). Si no existe, la pantalla final igual dice que es un ejemplo y no se envió nada.
- `whatsapp` deja de ser obligatorio.

Para un cliente real **no** se pone `demo` ni `data-demo`.

---

## 2. Modo `horas`: todas las opciones

| Opción | Obligatoria | Por defecto | Qué hace |
|---|---|---|---|
| `modo` | sí | | `"horas"` |
| `negocio` | sí | | Nombre del negocio (sale en el mensaje y en el calendario). |
| `comuna` | sí | | Va como ubicación (`LOCATION`) en el `.ics`. |
| `direccion` | no | | Si se entrega, la ubicación del `.ics` es `direccion, comuna`. |
| `whatsapp` | sí (salvo demo) | | Celular del negocio: `"56912345678"`, `"+56 9 1234 5678"` o `"912345678"`. |
| `servicios` | sí | | Lista de `{ nombre, duracion, precio?, descripcion? }`. `duracion` en minutos (5 a 720). `precio` en pesos, opcional. |
| `profesionales` | no | ninguno | Lista de textos o de `{ nombre, horario?, ocupados? }`. Con 2 o más aparece el paso "Profesional" con la opción "Cualquiera". Con 1 se asigna solo y se omite el paso. |
| `horario` | sí | | Tramos por día: claves `dom lun mar mie jue vie sab` (también sirven `lunes`, `miércoles`, etc.). Cada tramo `"09:00-13:00"` o `["09:00","13:00"]`. Día ausente o `[]` = no se atiende. |
| `intervalo` | no | `30` | Cada cuántos minutos parte un bloque (5 a 240). |
| `anticipacionHoras` | no | `2` | Horas mínimas entre ahora y el bloque. |
| `diasAdelante` | no | `30` | Hasta cuántos días hacia adelante se puede reservar. |
| `feriados` | no | | Fechas extra `"AAAA-MM-DD"` sin atención. Se suman a los feriados de Chile 2026 y 2027 que trae el módulo. |
| `feriadosChile` | no | `true` | `false` desactiva la lista incluida. Esa lista es **aproximada**: verificar cada año en bcn.cl o feriados.cl. |
| `cerrados` | no | | Días sueltos sin atención (vacaciones, evento). |
| `ocupados` | no | | Bloques ya tomados: `"2026-11-05 10:30"`. Bloquea todo bloque que se cruce con esa hora. |
| `titulo` | no | | Nombre accesible de la región (por defecto "Reservar una hora"). |
| `nivelTitulo` | no | `3` | Nivel de los encabezados (`h2` a `h5`) para respetar la jerarquía de la página. |
| `precioDeEjemplo` | no | `false` | Fuerza la leyenda "(precio de ejemplo)". En demo siempre se muestra. |
| `envio` | no | | Nivel 2, ver sección 6. |

**Ejemplo (cliente real, con horario partido y dos profesionales):**

```js
BDReservas.montar('#reserva', {
  modo: 'horas',
  negocio: 'Peluquería Maitén',
  comuna: 'Concepción',
  direccion: 'Barros Arana 1234',
  whatsapp: '56912345678',
  servicios: [
    { nombre: 'Corte de pelo', duracion: 45, precio: 14000 },
    { nombre: 'Color completo', duracion: 120, precio: 48000, descripcion: 'Incluye lavado.' }
  ],
  profesionales: [
    { nombre: 'Camila' },
    { nombre: 'Rodrigo', horario: { mar: ['10:00-14:00'], jue: ['10:00-14:00'] } } // horario propio
  ],
  horario: {
    mar: ['10:00-13:00', '15:00-19:30'], mie: ['10:00-13:00', '15:00-19:30'],
    jue: ['10:00-13:00', '15:00-19:30'], vie: ['10:00-13:00', '15:00-20:00'], sab: ['10:00-15:00']
  },
  intervalo: 30,
  anticipacionHoras: 3,
  diasAdelante: 45,
  cerrados: ['2026-12-24'],
  ocupados: ['2026-11-05 10:30']
});
```

Cómo se calculan los bloques: dentro de cada tramo, un bloque parte cada `intervalo` minutos y solo existe si el servicio **termina antes de que cierre el tramo**. Con "Cualquiera", un bloque está libre si al menos un profesional está libre. Un día sin ningún bloque libre aparece deshabilitado en el calendario.

---

## 3. Modo `noches`: todas las opciones

| Opción | Obligatoria | Por defecto | Qué hace |
|---|---|---|---|
| `modo` | sí | | `"noches"` |
| `negocio`, `comuna`, `direccion`, `whatsapp`, `titulo`, `nivelTitulo`, `precioDeEjemplo`, `envio`, `cerrados` | | | Igual que en modo horas. |
| `alojamientos` | sí | | Lista de `{ nombre, capacidad, precioNoche, descripcion?, ocupadas? }`. Con 2 o más aparece el paso "Alojamiento"; con 1 se omite. |
| `minNoches` | no | `1` | Mínimo de noches por estadía. |
| `maxNoches` | no | `30` | Máximo de noches por estadía. |
| `diasAdelante` | no | `180` | Hasta cuántos días hacia adelante puede ser la **llegada**. |
| `anticipacionDias` | no | `1` | Primera llegada posible: hoy + N días (1 = desde mañana). |
| `ocupados` | no | | Noches ocupadas para todos los alojamientos: `"2026-12-31"` (la noche que parte ese día). |
| `alojamientos[].ocupadas` | no | | Lo mismo, pero para un alojamiento en particular. |

**Ejemplo:**

```js
BDReservas.montar('#reserva-cabanas', {
  modo: 'noches',
  negocio: 'Cabañas Los Copihues',
  comuna: 'Cañete',
  whatsapp: '56987654321',
  alojamientos: [
    { nombre: 'Cabaña del bosque', capacidad: 4, precioNoche: 58000, ocupadas: ['2027-01-02', '2027-01-03'] },
    { nombre: 'Cabaña del lago',   capacidad: 6, precioNoche: 82000 }
  ],
  minNoches: 2,
  maxNoches: 14,
  diasAdelante: 150,
  cerrados: ['2026-12-24', '2026-12-25']
});
```

Reglas del calendario de rango: la primera pulsación fija la llegada; la segunda, la salida. Una estadía no puede cruzar una noche ocupada, ni quedar bajo `minNoches` ni sobre `maxNoches`. El día de salida sí puede ser un día cuya noche esté ocupada (la persona se va esa mañana). Si se pulsa un día que no sirve de salida pero sí de llegada, se toma como nueva llegada. El total es `noches × precioNoche` y se recalcula al cambiar los huéspedes (`≤ capacidad`).

El evento del calendario es de **día completo** (de la llegada a la salida), sin hora de entrada.

---

## 4. Mensaje de WhatsApp y archivo de calendario

Al confirmar (fuera de demo) se abre `https://wa.me/<whatsapp>?text=…` con algo como:

```
Hola, soy Ana Pérez. Quiero hacer una solicitud en Peluquería Maitén:
• Servicio: Corte de pelo (45 min)
• Profesional: Rodrigo
• Fecha: jueves 5 de noviembre de 2026
• Hora: 10:30 a 11:15
• Celular: +56 9 8765 4321
• Nota: Prefiero la tarde
Quedo atento/a a tu confirmación. ¡Gracias!
```

La pantalla final ofrece siempre **"Agregar a mi calendario"** (descarga un `.ics` válido) y, si no se abrió WhatsApp, un enlace "Abrir WhatsApp otra vez". En modo horas el `.ics` lleva `DTSTART`/`DTEND` en UTC calculados desde la hora de **America/Santiago** (con el horario de verano de Chile), `SUMMARY`, `LOCATION` (comuna), `DESCRIPTION`, estado `TENTATIVE` (porque el negocio todavía debe confirmar) y un aviso 60 minutos antes. Fechas y horas se muestran en formato chileno (`es-CL`).

Celular: se aceptan `912345678`, `9 1234 5678`, `+56 9 1234 5678`, `56912345678`. Se valida que sean 9 dígitos que parten con 9 y se muestra normalizado como `+56 9 1234 5678`. El correo es opcional y se valida solo si se escribe.

---

## 5. Cómo adaptarlo a la estética del sitio

Todo el aspecto sale de variables CSS. Se pueden definir en `:root`, en el contenedor o en una clase del sitio:

```css
#reserva {
  --res-acento: #9a3c12;        /* color de marca: botones, selección, foco */
  --res-sobre-acento: #fff;     /* texto sobre el acento */
  --res-texto: #2b2018;
  --res-fondo: #fffaf4;
  --res-borde: #8a7a6e;         /* bordes de campos y botones */
  --res-radio: 6px;
  --res-fuente: Georgia, serif; /* "inherit" para usar la tipografía del sitio */
  --res-error: #b3261e;
}
```

Valores por defecto: acento `#0b6b63`, texto `#1d232b`, fondo `#fff`, borde `#7a8591`, radio `12px`, fuente del sistema. Con esos valores los contrastes medidos son de 6,3:1 o más en textos y de 3,7:1 en bordes de controles. **Al cambiar colores hay que volver a revisar el contraste**: texto normal 4,5:1 como mínimo, bordes y foco 3:1. Para un sitio oscuro basta con poner `--res-fondo` oscuro, `--res-texto` claro y un `--res-acento` claro con `--res-sobre-acento` oscuro. El módulo no cambia solo a modo oscuro, para no desentonar con un sitio claro.

Lo que no conviene tocar: tamaños mínimos (textos de 12 px o más, controles de 44 px o más) y el foco visible. Las animaciones (aparición suave de cada paso) se apagan con `prefers-reduced-motion`.

Accesibilidad incluida (WCAG 2.2 AA): calendario como `grid` con `aria-selected`, flechas, Inicio/Fin y AvPág/RePág (con Mayús, cambia de año); un solo punto de tabulación por calendario; el foco pasa al título del paso cada vez que se cambia de paso; región `aria-live` que anuncia "Paso 2 de 6: Profesional"; errores de formulario enlazados con `aria-describedby` y `aria-invalid`; días y horas no disponibles marcados con `aria-disabled` y con texto en su etiqueta, no solo con color.

---

## 6. Límites del nivel 1 y cómo sería el nivel 2

### Límites del nivel 1 (sin servidor)

1. **La disponibilidad no es en vivo.** Los bloques ocupados salen de la lista `ocupados` que se escribe a mano en la configuración. Si el negocio agenda por teléfono, hay que editar y volver a publicar. Dos personas pueden pedir el mismo bloque casi a la vez.
2. **Es una solicitud, no una reserva confirmada.** El negocio responde por WhatsApp. La pantalla final lo dice así a propósito.
3. **La persona tiene que apretar "enviar" en WhatsApp.** Si el navegador bloquea la ventana, queda el enlace "Abrir WhatsApp otra vez". No hay forma de saber desde la página si el mensaje llegó.
4. **No hay correo, recordatorios ni cancelación** automáticos. El `.ics` incluye un aviso, pero solo en el calendario de quien lo bajó.
5. **Los datos personales viajan por WhatsApp.** Ahí no se guarda nada en el sitio. Si se pide nombre, celular y correo, la política de privacidad del cliente tiene que decirlo (Ley 19.628 y la nueva ley de protección de datos personales: verificar vigencia y obligaciones en bcn.cl).
6. Los feriados incluidos son de 2026 y 2027 y son aproximados. No contempla feriados regionales.

### Nivel 2 (opcional): guardar cada solicitud en una base

Con `config.envio = { url, llave, tabla }` el módulo, además de abrir WhatsApp, hace un `POST` a la API REST de Supabase (`<url>/rest/v1/<tabla>`) con los datos de la solicitud. **No bloquea**: si falla (sin internet, base caída), se ignora y la solicitud sigue saliendo por WhatsApp. En modo demo no se envía, salvo que se pida con `envio.enDemo: true`.

```js
BDReservas.montar('#reserva', {
  /* …configuración normal… */
  envio: { url: 'https://xxxx.supabase.co', llave: '<clave publicable (anon)>', tabla: 'reservas' }
});
```

Tabla mínima (el módulo envía estos campos; `creado` viene del navegador):

```sql
create table reservas (
  id          bigint generated always as identity primary key,
  creado      timestamptz not null default now(),
  estado      text not null default 'solicitada',   -- solicitada, confirmada, rechazada
  negocio     text not null,
  modo        text not null,                        -- horas | noches
  nombre      text not null,
  celular     text not null,
  correo      text,
  nota        text,
  servicio    text,
  profesional text,
  alojamiento text,
  fecha       date,
  hora        time,
  llegada     date,
  salida      date,
  huespedes   int,
  total       int
);
alter table reservas enable row level security;
-- La clave publicable solo puede INSERTAR; leer y confirmar queda para el panel interno con sesión.
create policy "insertar solicitudes" on reservas for insert to anon with check (true);
```

Importante: en la página va **solo la clave publicable (anon)**, nunca la `service_role`. Con la política de arriba, quien vea la clave en el código solo puede agregar filas, no leerlas. Conviene sumar límites de tamaño y de frecuencia en la base o en una función de borde para evitar spam.

Lo que **todavía no hace** este módulo y que completaría un nivel 2 real, por orden de valor:

1. **Leer la disponibilidad desde la base** al montar (una vista pública solo con `negocio`, `fecha`, `hora`/`llegada`/`salida` de solicitudes confirmadas) y mezclarla con `ocupados`, para que los bloques tomados desaparezcan sin republicar el sitio.
2. **Evitar el doble agendamiento**: un índice único sobre `(negocio, profesional, fecha, hora)` para solicitudes confirmadas, de modo que la base rechace el segundo intento.
3. **Panel interno** (el de Bío Digital ya tiene login) para ver las solicitudes y pasarlas a confirmada o rechazada, y que esa decisión actualice lo que ve el público.
4. **Aviso automático** al negocio (correo o webhook) y confirmación a la persona.

Cada uno de esos puntos es trabajo extra por cliente y tiene costo recurrente si usa servicios de terceros (plan de base de datos, correo transaccional): cotizarlo aparte del módulo, que es de entrega única.

---

## 7. Cómo se probó

Con el revisor automático de Bío Digital, desde la raíz del proyecto y con el servidor local en `http://localhost:4321`:

```
node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/_compartido/reservas-demo.html --tag reservas --probar web/herramientas/pruebas/reservas.js
```

El guion `web/herramientas/pruebas/reservas.js` recorre con clics un flujo completo de cada modo (incluida la validación de datos, el cambio de pasos desde el resumen, el teclado en el calendario, la descarga del `.ics` y su contenido, la configuración inválida y el horario de verano) y devuelve qué pasos funcionaron. El revisor mide además desborde horizontal, textos menores de 12 px, áreas táctiles menores de 44 px y errores de consola a 390 y 1440 px.
