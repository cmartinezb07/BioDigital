// Se ejecuta antes de pintar la página: marca que hay JavaScript (para las apariciones suaves)
// y aplica el tema que la persona eligió la última vez (solo en cartas con modo automático claro/oscuro).
(function () {
  var r = document.documentElement;
  r.className = 'js';
  try { var t = localStorage.getItem('menu-tema'); if (t === 'claro' || t === 'oscuro') r.setAttribute('data-tema', t); } catch (e) {}
})();
