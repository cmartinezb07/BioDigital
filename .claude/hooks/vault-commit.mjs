// PreToolUse(Bash): bloquea `git commit` si el vault de Obsidian no está incluido.
import { execSync } from 'node:child_process';
let s = ''; process.stdin.on('data', d => s += d).on('end', () => {
  let cmd = ''; try { cmd = JSON.parse(s).tool_input?.command || ''; } catch {}
  if (!/\bgit\s+(-[^\s]+\s+)*commit\b/.test(cmd)) process.exit(0);
  if (/\[sin-vault\]/.test(cmd)) process.exit(0);
  const re = /(^|\/|")(00 Inicio|10 Decisiones|20 Servicios)\//;
  let staged = ''; try { staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }); } catch {}
  if (re.test(staged) || /00 Inicio|10 Decisiones|20 Servicios/.test(cmd)) process.exit(0);
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
    permissionDecisionReason: 'OBSIDIAN: este commit no incluye el vault. Antes de confirmar actualiza "10 Decisiones/<hoy>.md" (qué y por qué), "00 Inicio/Estado.md" y "00 Inicio/Pendientes.md" (y "20 Servicios/Servicios.md" si cambió un servicio), haz git add de esos archivos y reintenta el commit. Si NO es un avance real del proyecto (cambio menor), agrega [sin-vault] al mensaje del commit.' } }));
});
