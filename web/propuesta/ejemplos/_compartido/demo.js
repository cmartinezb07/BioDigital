// Sitios de muestra de Bío Digital: cinta fija que avisa que es un ejemplo y lleva a Bío Digital,
// y aviso para los formularios y botones de contacto (no envían nada: es una demostración).
// Uso en cada ejemplo: <link rel="stylesheet" href="../_compartido/demo.css"> y <script src="../_compartido/demo.js" defer></script>
// En un botón o formulario de la demo: data-demo="Texto del aviso" (opcional) para mostrar un aviso en vez de enviar.
(function () {
  var WA = '56946941640';
  var SITIO = '/';
  var nombre = document.documentElement.getAttribute('data-ejemplo') || document.title.split('·')[0].trim();
  function aviso(txt) {
    var t = document.createElement('div'); t.className = 'bd-toast'; t.setAttribute('role', 'status'); t.textContent = txt;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4200);
  }
  window.bdAvisoDemo = aviso;
  // "Mira tu página": con ?negocio=Nombre en la dirección, el ejemplo muestra el nombre del visitante en vez del ficticio.
  // Solo cambia texto (textContent), nunca HTML. Los alias son las formas en que cada ejemplo escribe su nombre.
  var ALIAS = {
    'Centro Aurora': ['Centro Aurora', 'aurora'], 'Cabañas Los Copihues': ['Cabañas Los Copihues', 'Los Copihues'],
    'Clínica Dental Sonríe': ['Clínica Dental Sonríe', 'Clínica Sonríe', 'Sonríe'], 'Ríos & Asociados': ['Ríos & Asociados'],
    'TecnoRápido': ['TecnoRápido', 'TECNORÁPIDO'], 'Barbería El Filo': ['Barbería El Filo', 'El Filo'],
    'Casa Dulce': ['Casa Dulce', 'casa dulce'], 'Fogón del Sur': ['Fogón del Sur']
  };
  var propio = '';
  try { propio = (new URLSearchParams(location.search).get('negocio') || '').replace(/\s+/g, ' ').trim().slice(0, 40); } catch (e) {}
  if (propio && ALIAS[nombre]) {
    var lista = ALIAS[nombre].slice().sort(function (a, b) { return b.length - a.length; });
    var forma = function (alias) { return alias === alias.toUpperCase() ? propio.toUpperCase() : alias === alias.toLowerCase() ? propio.toLowerCase() : propio; };
    var cambiar = function (t) { lista.forEach(function (al) { if (t.indexOf(al) > -1) t = t.split(al).join(forma(al)); }); return t; };
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, nodos = [];
    while ((n = w.nextNode())) if (n.parentNode && !/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) nodos.push(n);
    nodos.forEach(function (t) { var v = cambiar(t.data); if (v !== t.data) t.data = v; });
    document.title = cambiar(document.title);
    nombre = propio;
  }
  var c = document.createElement('aside'); c.className = 'bd-demo'; c.setAttribute('aria-label', 'Aviso: sitio de ejemplo');
  var msg = encodeURIComponent('Hola Bío Digital, vi el ejemplo "' + nombre + '" y quiero una página así para mi negocio.');
  c.innerHTML = '<span class="bd-txt"><b>Ejemplo</b> de Bío Digital<span> · negocio ficticio</span></span>' +
    '<a href="https://wa.me/' + WA + '?text=' + msg + '" target="_blank" rel="noopener">Quiero una así</a>' +
    '<button type="button" aria-label="Ocultar aviso">×</button>';
  document.body.appendChild(c);
  c.querySelector('button').addEventListener('click', function () { c.remove(); });
  // Formularios y botones de la demo: no envían, avisan
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f.matches('[data-demo]')) return;
    e.preventDefault(); aviso(f.getAttribute('data-demo') || 'Esto es un ejemplo: en el sitio real, este formulario llega al WhatsApp o correo del negocio.');
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('a[data-demo], button[data-demo]'); if (!b) return;
    e.preventDefault(); aviso(b.getAttribute('data-demo') || 'Esto es un ejemplo: en el sitio real, este botón abre el WhatsApp del negocio.');
  }, true);
})();
