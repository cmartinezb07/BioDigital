// Descarga las fotos de la carta base de Fogón del Sur desde las fuentes con licencia abierta que elegimos (Wikimedia Commons y Openverse:
// solo dominio público, CC0 y CC BY), las recorta a 4:3, las pasa a WebP y escribe fotos/CREDITOS.md con autor, licencia y enlace.
// La selección (con sus metadatos) está en fotos-carta-base.json. Las cuatro fotos que ya estaban (empanadas, ensalada, lomo, asado) son
// fotos de prueba que mandó el equipo y no se tocan.
// Uso: node web/herramientas/fotos-carta-base.mjs [plato …]        (necesita internet y Python con Pillow)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aqui, '../propuesta/ejemplos/fogon-del-sur/fotos');
mkdirSync(destino, { recursive: true });
const UA = { 'User-Agent': 'BioDigital-catalogo/1.0 (biodigitalici@gmail.com)' };
const FOTOS = JSON.parse(readFileSync(join(aqui, 'fotos-carta-base.json'), 'utf8'));
const sel = process.argv.slice(2);
for (const [plato, m] of Object.entries(FOTOS)) {
  if (sel.length && !sel.includes(plato)) continue;
  const r = await fetch(m.url, { headers: UA });
  if (!r.ok) { console.log('NO SE BAJÓ', plato, r.status); continue; }
  const tmp = join(destino, '_' + plato + '.img'); writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
  execFileSync('python', ['-I', '-c', 'import sys,os;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");w,h=im.size;t=4/3;nw,nh=(w,int(w/t)) if w/h<t else (int(h*t),h);l,tp=(w-nw)//2,(h-nh)//2;im=im.crop((l,tp,l+nw,tp+nh)).resize((800,600),Image.LANCZOS);im.save(sys.argv[2],"WEBP",quality=78,method=6);os.remove(sys.argv[1])', tmp, join(destino, plato + '.webp')]);
  console.log('ok', plato.padEnd(12), m.licencia);
  await new Promise((x) => setTimeout(x, 500));
}
if (!sel.length) {
  const filas = Object.entries(FOTOS).map(([plato, f]) => `| ${plato} | \`${plato}.webp\` | ${f.titulo.replace(/\|/g, '/')} | ${f.autor.replace(/\|/g, '/')} | ${f.licencia} | [${f.fuente}](${f.pagina}) |`).join('\n');
  writeFileSync(join(destino, 'CREDITOS.md'), `# Créditos de las fotos de la carta base (Fogón del Sur)

Las fotos de la carta de ejemplo son **de referencia**: representan el plato de forma aproximada y vienen de fuentes con licencia abierta
(dominio público, CC0 o CC BY: permiten uso comercial; CC BY exige mencionar al autor, y se hace aquí). Se recortaron a 4:3 y se
comprimieron a WebP. **Al adaptar el menú a un restaurante real, el dueño sube las fotos propias de sus platos desde el panel** y
estas se reemplazan.

Las cuatro fotos \`empanadas\`, \`ensalada\`, \`lomo\` y \`asado\` son fotos de prueba que entregó el equipo; no llevan créditos de terceros.

| Plato | Archivo | Foto original | Autor | Licencia | Fuente |
|---|---|---|---|---|---|
${filas}

**Notas honestas:** la sopaipilla es de estilo mexicano (frita y con azúcar; la chilena es redonda y se come con pebre), la leche asada
usa un flan de referencia, y el cóctel y el jugo son referencias de bebidas parecidas. Son marcadores de posición con licencia limpia, no
fotos del plato exacto del local.

Cómo reemplazar una foto: panel del dueño → Carta → editar el plato → "Cambiar foto" (queda guardada en la base y se ve de inmediato),
o dejar un archivo con el nombre del plato en esta carpeta y apuntarlo en \`carta-base.json\`.
`);
  console.log('CREDITOS.md escrito con', Object.keys(FOTOS).length, 'fotos');
}
