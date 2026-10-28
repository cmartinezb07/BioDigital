# Instalar la skill de propuestas comerciales de Bío Digital

> **Para la persona:** entrégale este archivo a tu IA (Claude Code, Cursor, Codex, Gemini CLI o Copilot), abierta en
> una terminal o en la carpeta del proyecto, y dile: «sigue este archivo». Ella hace todo y te pregunta lo que necesite.
> ChatGPT o Claude en el navegador no sirven para esto, porque no pueden correr comandos en tu computador.

---

## Instrucciones para la IA

Vas a dejar lista en este computador la skill `propuesta-comercial` de Bío Digital. Con ella se hace, desde el
Instagram de un negocio, una propuesta comercial de una página **en PDF**, más el correo y el WhatsApp para mandarla.
Bío Digital es una startup de cinco estudiantes de la Universidad de Concepción que digitaliza negocios de barrio del
Gran Concepción.

Habla en español, tuteando y sin tecnicismos. Haz los pasos en orden. Corre tú los comandos; pídele a la persona solo
lo que no puedas hacer tú, como instalar un programa con su contraseña o iniciar sesión en GitHub. Si un paso falla,
explica en una línea qué pasó y cómo se arregla, y no sigas hasta resolverlo.

### Paso 1. Revisar lo que hace falta
Detecta el sistema operativo (Mac, Windows o Linux) y comprueba:

| Programa | Cómo comprobarlo | Si falta |
|---|---|---|
| Git | `git --version` | Que lo instale desde https://git-scm.com |
| Node 18 o más nuevo | `node -v` | Que instale la versión LTS desde https://nodejs.org |
| Google Chrome o Microsoft Edge | Mac: `/Applications/Google Chrome.app` o `/Applications/Microsoft Edge.app`. Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe` o `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` | Que instale Chrome desde https://www.google.com/chrome |

El navegador es obligatorio: es el que crea el PDF. Si la persona instala algo, vuelve a comprobarlo antes de seguir.

### Paso 2. Tener el proyecto actualizado
El proyecto es el repositorio privado `https://github.com/cmartinezb07/BioDigital`. Christhoper invita a cada
integrante del equipo.

- Si ya estás dentro de la carpeta del proyecto (tiene `CLAUDE.md`, `propuestas/` y `respaldo-skills/`), corre
  `git pull`.
- Si no, pregúntale a la persona si ya tiene la carpeta en algún lugar y entra ahí. Si no la tiene, pregúntale dónde
  la quiere y corre `git clone https://github.com/cmartinezb07/BioDigital.git`. Puede pedir iniciar sesión en GitHub:
  eso lo hace la persona.

Después comprueba que exista `respaldo-skills/propuesta-comercial/SKILL.md`. **Si no está**, los cambios todavía no
llegaron al repositorio del equipo: dile a la persona que le avise a Xavier y detente ahí.

### Paso 3. Probar que el PDF se genera
Dentro de la carpeta del proyecto:
```
node propuestas/generar.mjs kairos-cafe
```
Tiene que responder algo como `kairos-cafe/propuesta.pdf · 3 piezas…` y actualizar
`propuestas/kairos-cafe/propuesta.pdf`. Ábreselo a la persona para que vea cómo queda una propuesta terminada.

Ese comando regenera una propuesta que ya existe. Si después `git status` la muestra como cambiada, déjala como
estaba con `git checkout -- propuestas/kairos-cafe/propuesta.pdf`.

| Error | Qué hacer |
|---|---|
| `No encontré Chrome ni Edge` | Volver al paso 1. Si está en otra ruta: `CHROME="<ruta>" node propuestas/generar.mjs kairos-cafe` |
| `Cannot find module` o un error de sintaxis | Node demasiado antiguo: instalar la versión LTS |
| El PDF sale sin la letra de la marca | Hace falta internet al generar |

### Paso 4. Instalar la skill
**Si eres Claude Code**, copia la carpeta de la skill a las skills de la persona.

En Mac o Linux:
```
mkdir -p ~/.claude/skills && cp -r respaldo-skills/propuesta-comercial ~/.claude/skills/
```
En Windows (PowerShell):
```
New-Item -ItemType Directory -Force "$HOME\.claude\skills"; Copy-Item -Recurse -Force respaldo-skills\propuesta-comercial "$HOME\.claude\skills\"
```
Comprueba que quedó `~/.claude/skills/propuesta-comercial/SKILL.md`. Dile a la persona que cierre Claude Code y lo
abra de nuevo **dentro de la carpeta del proyecto** para que tome la skill.

**Si eres otra IA** (Cursor, Codex, Gemini CLI, Copilot), no hay nada que copiar: cada vez que pidan una propuesta,
lee y sigue `respaldo-skills/propuesta-comercial/SKILL.md`. Si tu herramienta tiene un archivo de reglas propio
(`AGENTS.md`, `.cursor/rules`, `GEMINI.md`), **no lo crees ni lo cambies** sin preguntarle a la persona.

### Paso 5. Explicarle a la persona cómo se usa
Cierra con este resumen, adaptado a la IA que eres:

1. **Saca capturas de pantalla del negocio:** el perfil de Instagram completo (bio, links y seguidores), las
   historias destacadas que digan carta, menú, precios o reservas, unas 6 publicaciones con el texto abierto y su
   ficha en Google Maps (nota, reseñas, si tiene sitio web y teléfono). La IA casi nunca puede abrir Instagram sola.
2. **Pide la propuesta**, abriendo la IA dentro de la carpeta del proyecto:
   - Claude Code con la skill instalada: «Hazle una propuesta a este negocio: <link del Instagram>. Te adjunto
     capturas.»
   - Otra IA: «Lee respaldo-skills/propuesta-comercial/SKILL.md y síguelo al pie de la letra para hacer la propuesta
     comercial de Bío Digital a este negocio: <link del Instagram>. Te adjunto capturas.»
3. **Revisa el PDF** que queda en `propuestas/<negocio>/propuesta.pdf`:
   - una sola página;
   - todo lo que dice del negocio se ve en su Instagram o en Maps, nada inventado;
   - el nombre del negocio bien escrito.

   Si recomienda el pack de lanzamiento ($69.990), avisa por el grupo, porque es solo para los primeros 5 clientes.
4. **Mándala tú.** El correo y el WhatsApp los escribe el script en `propuestas/<negocio>/mensajes.md`: son
   genéricos y no se editan. El correo sale desde
   biodigitalici@gmail.com y el WhatsApp desde el número de Bío Digital, siempre con el PDF adjunto y tu nombre en la
   firma. La IA no envía nada.
5. **Déjala registrada** con `git add propuestas`, `git commit -m "Propuesta para <negocio>"` y `git push`, y avisa
   por el grupo a quién se le mandó.
6. **Si la skill cambia:** `git pull` y repetir el paso 4.
