// UserPromptSubmit: recuerda consultar el vault de Obsidian antes de responder.
let s = ''; process.stdin.on('data', d => s += d).on('end', () => {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit',
    additionalContext: 'OBSIDIAN: antes de responder consulta el vault (carpeta del proyecto): abre "00 Inicio/Inicio.md" (tabla "qué necesito → dónde está") y solo el archivo que corresponda. Usa Grep, no leas archivos enteros grandes. Escribe en el vault SOLO cuando hay un avance o decisión real del proyecto (no investigación suelta ni borradores); entonces nota del día en "10 Decisiones", Estado y Pendientes.' } }));
});
