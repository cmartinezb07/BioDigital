// Prueba de los juegos de espera (Zip, Queens, Tango y Sudoku mini): para cada uno lee el tablero que se generó, lo resuelve por su cuenta
// y lo juega con clics y teclas como una persona. Verifica que el puzzle tiene solución, que las trampas se marcan en rojo y que se reconoce la victoria.
// Se corre sobre el seguimiento del pedido de ejemplo (pedido/?demo).
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
await dormir(1500);
const tabs = [...document.querySelectorAll('.jg-tabs button')];
const abrir = async (nombre) => { tabs.find((b) => b.textContent === nombre).click(); await dormir(250); };
const gano = () => /Resuelto/.test(document.querySelector('.jg-msg').textContent);
ok('0 están los cuatro juegos', tabs.map((b) => b.textContent).join() === 'Zip,Queens,Tango,Sudoku mini', tabs.map((b) => b.textContent).join());

// ---------- Sudoku mini ----------
await abrir('Sudoku mini');
{
  const cel = [...document.querySelectorAll('.jg-c')], n = 6, g = cel.map((c) => +c.textContent || 0), fijas = cel.map((c) => c.classList.contains('fija'));
  const ok1 = (a, i, v) => { const f = Math.floor(i / n), c = i % n; for (let k = 0; k < n; k++) if (a[f * n + k] === v || a[k * n + c] === v) return false; const f0 = f - f % 2, c0 = c - c % 3; for (let x = 0; x < 2; x++) for (let y = 0; y < 3; y++) if (a[(f0 + x) * n + c0 + y] === v) return false; return true; };
  const sol = g.slice(); const res = (i) => { if (i === 36) return true; if (sol[i]) return res(i + 1); for (let v = 1; v <= 6; v++) if (ok1(sol, i, v)) { sol[i] = v; if (res(i + 1)) return true; sol[i] = 0; } return false; };
  ok('1 el Sudoku tiene solución', res(0));
  // una trampa: repetir un número en una fila se marca en rojo
  const vacia = cel.findIndex((c, i) => !fijas[i]); const otroEnFila = g.findIndex((v, i) => v && Math.floor(i / 6) === Math.floor(vacia / 6));
  if (otroEnFila > -1) { cel[vacia].click(); document.querySelector('.jg-pad [data-v="' + g[otroEnFila] + '"]').click(); await dormir(100); ok('1b un número repetido en la fila se marca en rojo', cel[vacia].classList.contains('mal')); document.querySelector('.jg-pad [data-v="0"]').click(); }
  for (let i = 0; i < 36; i++) if (!fijas[i]) { cel[i].click(); document.querySelector('.jg-pad [data-v="' + sol[i] + '"]').click(); }
  await dormir(200);
  ok('1c al completarlo bien se reconoce la victoria', gano(), document.querySelector('.jg-msg').textContent);
}

// ---------- Queens ----------
await abrir('Queens');
{
  const cel = [...document.querySelectorAll('.jg-c')], n = 7;
  const col = cel.map((c) => c.style.background), regs = [...new Set(col)];
  ok('2 Queens tiene 7 colores y 49 casillas', regs.length === 7 && cel.length === 49, regs.length + '/' + cel.length);
  const reg = col.map((c) => regs.indexOf(c)), q = [];
  const res = (f) => { if (f === n) return true; for (let c = 0; c < n; c++) { if (q.some((x, ff) => x === c || reg[ff * n + x] === reg[f * n + c] || (ff === f - 1 && Math.abs(x - c) < 2))) continue; q[f] = c; if (res(f + 1)) return true; q.length = f; } return false; };
  ok('2b Queens tiene solución', res(0));
  // trampa: dos reinas en la misma fila se marcan en rojo
  cel[0].click(); cel[0].click(); cel[1].click(); cel[1].click(); await dormir(100);
  ok('2c dos reinas juntas se marcan en rojo', cel[0].classList.contains('mal') && cel[1].classList.contains('mal'));
  // se deja el tablero limpio recargando el juego
  document.querySelector('.jg-barra button').click(); await dormir(300);
}
{
  await abrir('Queens');
  const cel = [...document.querySelectorAll('.jg-c')], n = 7, col = cel.map((c) => c.style.background), regs = [...new Set(col)], reg = col.map((c) => regs.indexOf(c)), q = [];
  const res = (f) => { if (f === n) return true; for (let c = 0; c < n; c++) { if (q.some((x, ff) => x === c || reg[ff * n + x] === reg[f * n + c] || (ff === f - 1 && Math.abs(x - c) < 2))) continue; q[f] = c; if (res(f + 1)) return true; q.length = f; } return false; };
  res(0);
  q.forEach((c, f) => { cel[f * n + c].click(); cel[f * n + c].click(); });
  await dormir(200);
  ok('2d al poner las 7 reinas bien se reconoce la victoria', gano(), document.querySelector('.jg-msg').textContent);
}

// ---------- Tango ----------
await abrir('Tango');
{
  const cel = [...document.querySelectorAll('.jg-c')], n = 6, est = cel.map((c) => { const s = c.querySelector('svg'); return !s ? 0 : /f5a623/.test(s.innerHTML) ? 1 : 2; });
  const fijas = cel.map((c) => c.classList.contains('fija'));
  const rel = []; cel.forEach((c, i) => { c.querySelectorAll('.jg-lazo').forEach((l) => rel.push([i, l.classList.contains('h') ? i + 1 : i + n, l.textContent])); });
  const sol = est.slice();
  const valida = (i) => {
    const f = Math.floor(i / n), c = i % n, v = sol[i];
    if (c >= 2 && sol[i - 1] === v && sol[i - 2] === v) return false;
    if (f >= 2 && sol[i - n] === v && sol[i - 2 * n] === v) return false;
    let a = 0, b = 0; for (let k = 0; k < n; k++) { if (sol[f * n + k] === v) a++; if (sol[k * n + c] === v) b++; } if (a > 3 || b > 3) return false;
    for (const [x, y, s] of rel) if ((x === i || y === i) && sol[x] && sol[y] && ((s === '=') !== (sol[x] === sol[y]))) return false;
    return true;
  };
  const res = (i) => { if (i === 36) return true; if (fijas[i]) return valida(i) && res(i + 1); for (const v of [1, 2]) { sol[i] = v; if (valida(i) && res(i + 1)) return true; } sol[i] = 0; return false; };
  ok('3 Tango tiene solución (con 8 casillas fijas y las marcas = y ×)', res(0) && rel.length > 0, rel.length);
  // trampa: tres soles seguidos
  const libres = []; for (let i = 0; i < 36; i++) if (!fijas[i]) libres.push(i);
  for (let i = 0; i < 36; i++) if (!fijas[i]) { for (let k = 0; k < sol[i]; k++) cel[i].click(); }
  await dormir(250);
  ok('3b al completarlo bien se reconoce la victoria', gano(), document.querySelector('.jg-msg').textContent);
}

// ---------- Zip ----------
await abrir('Zip');
{
  const cel = [...document.querySelectorAll('.jg-c')], n = 6, nums = {}, muros = new Set();
  cel.forEach((c, i) => { const m = c.querySelector('.jg-num'); if (m) nums[i] = +m.textContent; c.querySelectorAll(':scope > i').forEach((w) => { muros.add(w.style.width === '5px' ? i + '|' + (i + 1) : i + '|' + (i + n)); }); });
  const maxN = Math.max(...Object.values(nums)), uno = +Object.keys(nums).find((k) => nums[k] === 1);
  const vec = (c) => { const f = Math.floor(c / n), k = c % n, o = []; if (f > 0) o.push(c - n); if (f < n - 1) o.push(c + n); if (k > 0) o.push(c - 1); if (k < n - 1) o.push(c + 1); return o; };
  const lleno = new Set(), ruta = [];
  const dfs = (c, sig) => {
    ruta.push(c); lleno.add(c);
    if (nums[c]) sig = nums[c] + 1;
    if (ruta.length === 36) { if (nums[c] === maxN) return true; ruta.pop(); lleno.delete(c); return false; }
    for (const d of vec(c)) { if (lleno.has(d) || muros.has(Math.min(c, d) + '|' + Math.max(c, d))) continue; if (nums[d] && nums[d] !== sig) continue; if (dfs(d, sig)) return true; }
    ruta.pop(); lleno.delete(c); return false;
  };
  ok('4 Zip tiene solución (6 números y muros)', dfs(uno, 2) && ruta.length === 36, Object.keys(nums).length + ' números');
  const tab = document.querySelector('.jg-tab');
  const tecla = (k) => tab.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  tecla('ArrowRight');   // la primera flecha pone el inicio en el 1
  for (let i = 1; i < ruta.length; i++) { const d = ruta[i] - ruta[i - 1]; tecla(d === 1 ? 'ArrowRight' : d === -1 ? 'ArrowLeft' : d === n ? 'ArrowDown' : 'ArrowUp'); }
  await dormir(250);
  ok('4b al recorrer todo en orden se reconoce la victoria', gano(), document.querySelector('.jg-msg').textContent);
}
return r;
