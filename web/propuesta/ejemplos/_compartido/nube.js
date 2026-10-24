// Nube: conexión de los sistemas (pedidos, reservas, fidelización) con una base de datos compartida.
// Cliente, cocina, repartidor y dueño están en equipos distintos y ven lo mismo, cada uno solo lo que le corresponde:
//  · El cliente ve únicamente lo suyo: su pedido, su reserva o su tarjeta, que se encuentran por un código secreto.
//  · El equipo (cocina, reparto, recepción, caja, dueño) entra con un PIN y ve lo de su rol.
// La llave de abajo es la "publicable": es pública por diseño. Lo que protege los datos son las funciones de la base
// (security definer, tablas sin acceso directo): ver memoria/conexion-nube.md.
// Los cambios llegan por sondeo cada pocos segundos (sin servidores propios ni costo en el plan gratis).
(function () {
  'use strict';
  var URL_API = 'https://xoetybrsbuxcdoamcaeb.supabase.co/rest/v1/rpc/';
  var LLAVE = 'sb_publishable_xdq3-GyXexvdNDJlAd8mPA_2U1HNmKt';

  function rpc(fn, cuerpo, o) {
    var rapido = o && o.keepalive;
    var ctl = !rapido && window.AbortController ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, 12000) : null;
    return fetch(URL_API + fn, { method: 'POST', keepalive: !!rapido, headers: { apikey: LLAVE, Authorization: 'Bearer ' + LLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (t) clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function (e) { if (t) clearTimeout(t); throw e; });
  }
  function leer(neg, col, o) {
    o = o || {};
    return rpc('nube_leer', { p_neg: neg, p_col: col, p_pin: o.pin || null, p_ids: o.ids && o.ids.length ? o.ids : null, p_desde: o.desde || null });
  }
  // modo: 'parchar' (mezcla campos sobre lo que hay) o 'poner' (reemplaza). cupo: revisión atómica de unidades (reservas).
  function escribir(neg, col, id, data, o) {
    o = o || {};
    return rpc('nube_escribir', { p_neg: neg, p_col: col, p_id: id, p_data: data, p_pub: o.pub || null, p_pin: o.pin || null, p_modo: o.modo || 'parchar', p_cupo: o.cupo || null })
      .then(function (r) { if (r && r.error) { var e = new Error(r.error); e.codigo = r.error; throw e; } return r; });
  }
  // Igual que escribir, pero sobrevive al cierre de la página (por ejemplo para apagar "el cliente está modificando")
  function escribirRapido(neg, col, id, data, o) {
    o = o || {};
    return rpc('nube_escribir', { p_neg: neg, p_col: col, p_id: id, p_data: data, p_pub: null, p_pin: o.pin || null, p_modo: 'parchar', p_cupo: null }, { keepalive: true }).catch(function () {});
  }
  function importar(neg, col, pin, filas) { return rpc('nube_importar', { p_neg: neg, p_col: col, p_pin: pin, p_filas: filas }); }
  function personalListar(neg, pin) { return rpc('nube_personal_listar', { p_neg: neg, p_pin: pin }); }
  function personalGuardar(neg, pin, rol, nombre, pinNuevo, activo, pinActual) { return rpc('nube_personal_guardar', { p_neg: neg, p_pin: pin, p_rol: rol, p_nombre: nombre, p_pin_nuevo: pinNuevo, p_activo: activo, p_pin_actual: pinActual || null }); }
  function quien(neg, pin) { return rpc('nube_quien', { p_neg: neg, p_pin: pin }); }
  function vaciar(neg, col, pin) { return rpc('nube_vaciar', { p_neg: neg, p_col: col, p_pin: pin }); }
  // Solo el dueño: borra por prefijo de código o por contenido (las pruebas automáticas limpian solo lo suyo)
  function borrar(neg, col, pin, o) { o = o || {}; return rpc('nube_borrar', { p_neg: neg, p_col: col, p_pin: pin, p_prefijo: o.prefijo || null, p_filtro: o.filtro || null }); }
  // Cola por clave: los cambios de un mismo pedido, reserva o tarjeta se envían en orden, uno tras otro (si viajaran en paralelo
  // podrían llegar al revés y dejar el dato viejo)
  var colas = {};
  function cola(clave, fn) { var p = (colas[clave] || Promise.resolve()).then(fn); colas[clave] = p.catch(function () {}); return p; }
  function rol(neg, pin) { return rpc('nube_rol', { p_neg: neg, p_pin: pin }); }

  // PIN del equipo: se recuerda solo en esta pestaña (se borra al cerrarla)
  function pin(neg, valor) {
    try {
      if (valor === undefined) return sessionStorage.getItem('nube-pin-' + neg) || '';
      if (valor === null) sessionStorage.removeItem('nube-pin-' + neg); else sessionStorage.setItem('nube-pin-' + neg, valor);
    } catch (e) { return ''; }
    return valor || '';
  }
  function nombre(neg) { try { return sessionStorage.getItem('nube-nombre-' + neg) || ''; } catch (e) { return ''; } }
  function salir(neg) { pin(neg, null); try { sessionStorage.removeItem('nube-nombre-' + neg); } catch (e) {} location.reload(); }

  // Sondeo: llama cb con las filas nuevas o cambiadas. Si el PIN es del equipo, ve todo; si no, solo lo suyo (ids) y lo público.
  function sondear(neg, col, o, cb) {
    var desde = {}, parar = false, timer = null, fallos = 0, enVuelo = false;
    function vuelta() {
      if (parar || enVuelo) return;
      enVuelo = true;
      var opts = { pin: o.pin ? o.pin() : '', ids: o.ids ? o.ids() : null }, modo = opts.pin ? 'e' : 'c'; opts.desde = desde[modo] || null;
      var sinNada = !opts.pin && o.soloSiHayIds && (!opts.ids || !opts.ids.length);
      var p = sinNada ? Promise.resolve(null) : leer(neg, col, opts);
      p.then(function (r) {
        fallos = 0;
        if (r) {
          if (r.ahora) desde[modo] = new Date(new Date(r.ahora).getTime() - 6000).toISOString();   // se pide un poco hacia atrás: no se pierde nada
          cb(r.staff ? { staff: true, filas: r.filas || [], pub: [] } : { staff: false, filas: r.mios || [], pub: r.pub || [] });
        }
        if (o.alConectar) o.alConectar(true);
      }).catch(function () { fallos++; if (o.alConectar) o.alConectar(false); })
        .then(function () { enVuelo = false; if (!parar) timer = setTimeout(vuelta, (document.hidden ? 12000 : (o.cada || 2500)) * (1 + Math.min(fallos, 4))); });
    }
    vuelta();
    return { parar: function () { parar = true; clearTimeout(timer); }, ya: function () { clearTimeout(timer); vuelta(); }, reiniciar: function () { desde = {}; clearTimeout(timer); vuelta(); } };
  }

  // Pantalla de PIN para el equipo. aceptan: roles que pueden entrar. pistas: PIN de la demostración (en un cliente real no se muestran).
  function acceso(o) {
    return new Promise(function (ok) {
      var guardado = pin(o.negocio);
      function entrar(p, r, n) { pin(o.negocio, p); try { sessionStorage.setItem('nube-nombre-' + o.negocio, n || ''); } catch (e) {} ok({ pin: p, rol: r, nombre: n || '' }); }
      var validar = function (p) { return quien(o.negocio, p).then(function (q) { return q && o.aceptan.indexOf(q.rol) > -1 ? q : null; }); };
      function pintar() {
        if (!document.getElementById('nube-css')) {
          var st = document.createElement('style'); st.id = 'nube-css';
          st.textContent = '.nube-vel{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(10,8,6,.92);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}' +
            '.nube-caja{width:min(100%,380px);padding:26px;border-radius:18px;background:#1c1713;color:#f4ead9;border:1px solid #3a3027;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
            '.nube-caja h1{margin:0 0 6px;font-size:20px;line-height:1.2}.nube-caja p{margin:0 0 14px;font-size:14px;line-height:1.5;color:#cdbfa8}' +
            '.nube-caja input{width:100%;box-sizing:border-box;min-height:48px;padding:0 14px;border-radius:12px;border:1px solid #5a4a3a;background:#120e0b;color:#fff;font:600 22px/1 ui-monospace,Consolas,monospace;letter-spacing:.35em;text-align:center}' +
            '.nube-caja button{width:100%;min-height:48px;margin-top:12px;border:0;border-radius:12px;background:#cf9b4a;color:#1a110c;font:700 15px system-ui,sans-serif;cursor:pointer}' +
            '.nube-err{min-height:20px;margin:8px 0 0!important;color:#ff9b8a!important}.nube-pista{margin-top:16px;padding-top:14px;border-top:1px dashed #3a3027;font-size:13px;color:#a99b86}.nube-pista b{color:#f4ead9;font-family:ui-monospace,Consolas,monospace;letter-spacing:.1em}';
          document.head.appendChild(st);
        }
        var v = document.createElement('div'); v.className = 'nube-vel';
        v.innerHTML = '<form class="nube-caja" novalidate><h1></h1><p></p><label for="nube-pin" style="position:absolute;left:-9999px">PIN</label><input id="nube-pin" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="••••••" aria-describedby="nube-err"><p class="nube-err" id="nube-err" role="alert"></p><button type="submit">Entrar</button><div class="nube-pista" hidden></div></form>';
        v.querySelector('h1').textContent = o.titulo;
        v.querySelector('p').textContent = o.texto || 'Esta pantalla es del equipo del local. Escribe tu PIN para entrar.';
        if (o.pistas && o.pistas.length) {
          var pi = v.querySelector('.nube-pista'); pi.hidden = false;
          pi.innerHTML = 'Demostración de Bío Digital. PIN de prueba: ' + o.pistas.map(function (x) { return x.rol + ' <b>' + x.pin + '</b>'; }).join(' · ') + '<br>No escribas datos reales: lo que se ingresa en esta demostración es visible para quien tenga estos PIN. En un local real, cada persona tiene su PIN privado.';
        }
        document.body.appendChild(v);
        var inp = v.querySelector('input'), err = v.querySelector('.nube-err');
        setTimeout(function () { inp.focus(); }, 50);
        v.querySelector('form').addEventListener('submit', function (e) {
          e.preventDefault(); var p = inp.value.trim(); if (!p) { err.textContent = 'Escribe el PIN.'; return; }
          err.textContent = 'Revisando…';
          validar(p).then(function (q) { if (q) { v.remove(); entrar(p, q.rol, q.nombre); } else err.textContent = 'Ese PIN no corresponde a esta pantalla.'; })
            .catch(function () { err.textContent = 'No hay conexión. Revisa tu internet e intenta de nuevo.'; });
        });
      }
      if (guardado) validar(guardado).then(function (q) { if (q) entrar(guardado, q.rol, q.nombre); else { pin(o.negocio, null); pintar(); } }).catch(pintar); else pintar();
    });
  }

  // JSON con las llaves ordenadas: la base devuelve los campos en otro orden y no se debe tomar como un cambio
  function canon(v) { if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']'; return '{' + Object.keys(v).sort().filter(function (k) { return v[k] !== undefined; }).map(function (k) { return JSON.stringify(k) + ':' + canon(v[k]); }).join(',') + '}'; }

  function idNuevo() { var a = new Uint8Array(8); (window.crypto || window.msCrypto).getRandomValues(a); return [].map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }

  window.Nube = { rpc: rpc, leer: leer, escribir: escribir, escribirRapido: escribirRapido, importar: importar, personalListar: personalListar, personalGuardar: personalGuardar, quien: quien, nombre: nombre, vaciar: vaciar, borrar: borrar, cola: cola, rol: rol, pin: pin, salir: salir, sondear: sondear, acceso: acceso, idNuevo: idNuevo, canon: canon };
})();
