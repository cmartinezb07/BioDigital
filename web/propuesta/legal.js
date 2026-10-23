// Páginas legales: marca en el índice la sección que se está leyendo.
(function () {
  var links = [].slice.call(document.querySelectorAll('.lg-ind a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var porId = {};
  links.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = porId[e.target.id];
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.lg-txt section').forEach(function (s) { io.observe(s); });
})();
