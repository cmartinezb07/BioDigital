// Gato de Bío Digital: personaje dibujado en SVG por partes (cabeza, orejas, ojos, cejas, boca, brazos,
// piernas, cola) y animado con resortes a la tasa de la pantalla (60 cuadros por segundo o más).
// Tiene dos dibujos: de frente y de perfil. Al girar del todo, la cara se desliza hacia el lado, parpadea
// y aparece el perfil (en espejo si mira a la izquierda).
// La ropa se pinta con los colores de la página (--c1 y --c2), así que cambia con la paleta y con el tema.
// mascota.js lo usa si existe window.MascotaRig: en vez de cambiar imágenes, le pide poses y gestos.
// API: var g = MascotaRig.crear({ quieto: false });  g.el (el <svg>)
//      g.pose('guino')  g.gesto('salta')  g.mirar('i'|'d', completo)  g.hablar(ms)  g.oreja()  g.poses()
//      g.seguir(x, y): los ojos (y un poco la cabeza) siguen ese punto de la pantalla; g.seguir(null) los suelta.
//      g.foco(x, y): mira fijo un punto (el campo que se está llenando) aunque el mouse se mueva; g.foco(null) lo suelta.
// Cuidados: un giro de perfil empezado siempre termina (nunca queda a medias), un gesto no se reinicia a medias,
// y si el mouse se mueve muy rápido o a tirones los ojos siguen el promedio en vez de temblar.
(function () {
  'use strict';
  if (window.MascotaRig) return;
  var calmMQ = matchMedia('(prefers-reduced-motion: reduce)');
  var uid = 0;
  var ESPEJO = 'transform="translate(240 0) scale(-1 1)"';
  var RAD = Math.PI / 180;

  // ---------- Dibujo ----------
  // Cuadro de 240 x 300. Suelo en y = 292. Cuello en (120, 132).
  function ojo(id, lado) {
    return '<g data-p="abierto-' + lado + '">' +
      '<ellipse class="g-blanco" rx="11.5" ry="13.5"/>' +
      '<g clip-path="url(#' + id + '-ojo)">' +
        '<g data-p="pupila-' + lado + '"><ellipse class="g-tinta" rx="7" ry="9" cy="1"/><circle class="g-blanco" cx="2.6" cy="-3.2" r="2.5"/></g>' +
        '<g data-p="parpado-' + lado + '"><rect class="g-piel" x="-16" y="-34" width="32" height="34"/><path class="g-linea" d="M-15 0H15"/></g>' +
        '<g data-p="bajo-' + lado + '"><rect class="g-piel" x="-16" y="0" width="32" height="30"/><path class="g-linea g-fina" d="M-15 0H15"/></g>' +
      '</g>' +
      '<ellipse class="g-borde g-fina" fill="none" rx="11.5" ry="13.5"/>' +
    '</g>' +
    '<path data-p="cerrado-' + lado + '" class="g-linea" d="M-10.5 1Q0 8 10.5 1"/>' +
    '<path data-p="feliz-' + lado + '" class="g-linea" d="M-10 3Q0 -9 10 3"/>' +
    '<path data-p="aprieta-' + lado + '" class="g-linea" d="' + (lado === 'd' ? 'M8 -7L-7 0L8 7' : 'M-8 -7L7 0L-8 7') + '"/>';
  }
  // Brazo: tubo negro grueso + manga de color + puño + mano (cinco formas; se muestra una)
  function brazo(lado, lejos) {
    return '<g data-p="brazo-' + lado + '"' + (lejos ? ' class="g-lejos"' : '') + '>' +
      '<path data-p="manga-borde-' + lado + '" class="g-tubo g-tubo-borde"/>' +
      '<path data-p="manga-' + lado + '" class="g-tubo g-manga"/>' +
      '<path data-p="puno-' + lado + '" class="g-tubo g-puno"/>' +
      '<g data-p="mano-' + lado + '"><g' + (lado === 'i' ? ' transform="scale(1 -1)"' : '') + '>' +
        '<g data-mano="puno"><ellipse class="g-piel g-borde" cx="7" rx="10.5" ry="10"/><path class="g-linea g-fina" d="M13 -5Q16.5 -2.5 13 0M13 0Q16.5 2.5 13 5"/></g>' +
        '<g data-mano="palma"><ellipse class="g-piel g-borde" cx="3" cy="-10" rx="4.6" ry="6.5" transform="rotate(-30 3 -10)"/><path class="g-piel g-borde" d="M-1 -9C5 -12.5 16 -12.5 21 -8C25.5 -4 25.5 4 21 8C16 12.5 5 12.5 -1 9Z"/><path class="g-linea g-fina" d="M24 -3H18M24 3H18"/></g>' +
        '<g data-mano="dedo"><rect class="g-piel g-borde" x="9" y="-11" width="21" height="8" rx="4"/><ellipse class="g-piel g-borde" cx="7" rx="10.5" ry="10"/><path class="g-linea g-fina" d="M13 1Q16.5 3.5 13 6"/></g>' +
        '<g data-mano="pulgar"><rect class="g-piel g-borde" x="1" y="-24" width="8.5" height="17" rx="4.2"/><ellipse class="g-piel g-borde" cx="7" rx="10.5" ry="10"/><path class="g-linea g-fina" d="M13 -3Q16.5 -0.5 13 2M13 2Q16.5 4.5 13 7"/></g>' +
      '</g></g>' +
    '</g>';
  }
  function cola(pre) {
    return '<g><path data-p="' + pre + 'cola-borde" class="g-tubo g-tubo-borde g-cola-b"/><path data-p="' + pre + 'cola-piel" class="g-tubo g-cola-p"/><path data-p="' + pre + 'cola-punta" class="g-tubo g-cola-t" pathLength="100"/></g>';
  }

  // Vista de frente
  function frente(id) {
    var oreja = '<path class="g-piel g-borde" d="M63 76C58 52 57 27 66 10C82 17 97 30 107 45Z"/>' +
      '<path class="g-tinta" d="M71 58C68 44 68 31 71 22C81 28 89 36 95 45Z"/>';
    var pierna = function (lado) {
      var g = '<path class="g-pantalon g-borde" d="M97 195H121L120.5 262C112 266 94 266 83 262C85 236 89 214 97 195Z"/>' +
        '<path class="g-pantalon-2 g-borde g-fina" d="M85 226H99L99.5 246H85.5C85 238 85 232 85 226Z"/><path class="g-linea g-fina" d="M84.5 231H99.5"/>' +
        '<path class="g-linea g-fina" d="M112 202L111 220"/>' +
        '<path class="g-zapato g-borde" d="M71 283C69 272 78 264 90 263H107C116 263 121 268 121 276V284C121 289 118 292 113 292H78C73 292 71 289 71 283Z"/>' +
        '<path class="g-tinta" d="M71.5 284H120.6C120.4 289.5 117.5 292 113 292H78C73.5 292 71.6 289.4 71.5 284Z"/>' +
        '<path class="g-linea g-fina" d="M73 277C77 271 84 268.5 91 268.5"/>' +
        '<path class="g-cordon" d="M98 266.5L109 269.5M96 271.5L107 274"/>';
      return '<g data-p="pierna-' + lado + '">' + (lado === 'd' ? '<g ' + ESPEJO + '>' + g + '</g>' : g) + '</g>';
    };
    return cola('') +
      // Mochila (se asoma a la izquierda)
      '<g data-p="mochila"><path class="g-bolso g-borde" d="M60 150C60 142 66 138 74 138H86V202H67C62 202 58 198 58 192Z"/>' +
        '<path class="g-bolso-2 g-borde g-fina" d="M60.5 173H80V195H65C62 195 60.5 193 60.5 190Z"/><path class="g-linea g-fina" d="M63 180H78"/></g>' +
      pierna('i') + pierna('d') +
      // Torso: capucha, polera, chaqueta abierta, tirantes, cinturón
      '<g data-p="torso">' +
        '<path class="g-chaqueta-2 g-borde" d="M83 137C88 125 152 125 157 137C163 147 155 156 144 153L120 147L96 153C85 156 77 147 83 137Z"/>' +
        '<path class="g-polera g-borde" d="M100 134H140L142 201H98Z"/>' +
        '<g class="g-logo"><path d="M120 158V174M113 162L127 170M113 170L127 162"/></g>' +
        '<path class="g-chaqueta g-borde" d="M84 138C88 134 96 132 102 134L106 150L105 205C95 208 85 207 77 204C75 186 75 160 78 148C79 143 81 140 84 138Z"/>' +
        '<path class="g-chaqueta g-borde" d="M156 138C152 134 144 132 138 134L134 150L135 205C145 208 155 207 163 204C165 186 165 160 162 148C161 143 159 140 156 138Z"/>' +
        '<path class="g-linea g-fina g-pliegue" d="M78 197C86 200.5 96 201 105 199M162 197C154 200.5 144 201 135 199M103 150L102.5 196M137 150L137.5 196"/>' +
        '<path class="g-tubo g-tirante-b" d="M91 136C93 150 95 164 96 180M149 136C147 150 145 164 144 180"/>' +
        '<path class="g-tubo g-tirante" d="M91 136C93 150 95 164 96 180M149 136C147 150 145 164 144 180"/>' +
        '<path class="g-tinta" d="M98 193.5H142V202H98Z"/><rect class="g-hebilla" x="114" y="192.5" width="12" height="10.5" rx="2.2"/>' +
      '</g>' +
      // Cabeza
      '<g data-p="cabeza">' +
        '<g data-p="oreja-i">' + oreja + '</g>' +
        '<g data-p="oreja-d"><g ' + ESPEJO + '>' + oreja + '</g></g>' +
        '<path class="g-piel g-borde" d="M120 38C148 38 171 48 179 68C185 82 185 96 181 105L189 110L179 113L185 119L171 121C159 129 141 132 120 132C99 132 81 129 69 121L55 119L61 113L51 110L59 105C55 96 55 82 61 68C69 48 92 38 120 38Z"/>' +
        '<g data-p="cara">' +
          '<g data-p="bigotes-i" class="g-linea g-fina"><path d="M68 104L44 99M68 110L42 111M69 116L46 123"/></g>' +
          '<g data-p="bigotes-d" class="g-linea g-fina"><path d="M172 104L196 99M172 110L198 111M171 116L194 123"/></g>' +
          '<g data-p="rubor" class="g-rubor"><ellipse cx="82" cy="109" rx="8.5" ry="4.6"/><ellipse cx="158" cy="109" rx="8.5" ry="4.6"/></g>' +
          '<g data-p="ojo-i">' + ojo(id, 'i') + '</g>' +
          '<g data-p="ojo-d">' + ojo(id, 'd') + '</g>' +
          '<path data-p="ceja-i" class="g-linea" d="M-9 1.5Q0 -2.5 9 1.5"/>' +
          '<path data-p="ceja-d" class="g-linea" d="M-9 1.5Q0 -2.5 9 1.5"/>' +
          '<path class="g-tinta" d="M113.5 97.5Q120 95 126.5 97.5Q122 104 120 104Q118 104 113.5 97.5Z"/>' +
          '<g data-p="boca">' +
            '<path data-boca="gato" class="g-linea g-fina" d="M-10 2Q-5 7.5 0 2Q5 7.5 10 2"/>' +
            '<g data-boca="burla"><path class="g-linea g-fina" d="M-12 2.5Q-3 9 5 5Q10 2.5 13 -3"/><path class="g-blanco g-borde g-fina" d="M2 5.6L4.2 10L6.6 4.8Z"/></g>' +
            '<path data-boca="sonrisa" class="g-linea g-fina" d="M-13 1Q0 14 13 1"/>' +
            '<g data-boca="dientes"><path class="g-tinta g-borde g-fina" d="M-16 0Q0 4 16 0Q12 17 0 18Q-12 17 -16 0Z"/><path class="g-blanco" d="M-13.5 1.8Q0 5 13.5 1.8L12.4 6.4Q0 9 -12.4 6.4Z"/><path class="g-lengua" d="M-7 15Q0 10 7 15Q0 19 -7 15Z"/></g>' +
            '<g data-boca="risa"><path class="g-tinta g-borde g-fina" d="M-15 -1Q0 3 15 -1Q14 22 0 23Q-14 22 -15 -1Z"/><path class="g-lengua" d="M-9 18Q0 10 9 18Q0 24 -9 18Z"/></g>' +
            '<ellipse data-boca="o" class="g-tinta" cy="8" rx="5" ry="6.2"/>' +
            '<ellipse data-boca="oo" class="g-tinta" cy="11" rx="7.5" ry="10"/>' +
            '<path data-boca="plano" class="g-linea g-fina" d="M-8 6H8"/>' +
            '<path data-boca="triste" class="g-linea g-fina" d="M-10 10Q0 1 10 10"/>' +
            '<g data-boca="apreta"><rect class="g-blanco g-borde g-fina" x="-13" y="1" width="26" height="11" rx="4"/><path class="g-linea g-fina" d="M-12 6.5H12M-4.5 1.5V11.5M4.5 1.5V11.5"/></g>' +
            '<g data-boca="lengua"><path class="g-linea g-fina" d="M-12 2Q0 12 12 2"/><path class="g-lengua g-borde g-fina" d="M-1 7Q4 19 10 8"/></g>' +
            '<g data-boca="bostezo"><ellipse class="g-tinta" cy="12" rx="8.5" ry="12"/><path class="g-lengua" d="M-6 19Q0 14 6 19Q0 23.5 -6 19Z"/></g>' +
            '<circle data-boca="silba" class="g-tinta" cx="-3" cy="7" r="3.6"/>' +
            '<path data-boca="nervio" class="g-linea g-fina" d="M-11 7Q-7.5 3 -4 7Q-0.5 11 3 7Q6.5 3 10 7"/>' +
            '<path data-boca="habla" class="g-tinta" d="M-7 3Q0 1.5 7 3Q6 12 0 12.5Q-6 12 -7 3Z"/>' +
          '</g>' +
        '</g>' +
        '<g data-p="lentes"><path class="g-tinta" d="M76 76H116L113 94C112 99 108 101 103 101H90C84 101 80 97 79 92Z"/><path class="g-tinta" d="M164 76H124L127 94C128 99 132 101 137 101H150C156 101 160 97 161 92Z"/><path class="g-linea" d="M114 79H126"/><path class="g-brillo" d="M83 81L93 81M131 81L141 81"/></g>' +
      '</g>' +
      brazo('i') + brazo('d');
  }

  // Vista de perfil (mirando a la derecha; a la izquierda se dibuja en espejo)
  function perfil(id) {
    var pierna = function (lejos) {
      return '<g data-p="ppierna-' + (lejos ? 'q' : 'n') + '"' + (lejos ? ' class="g-lejos"' : '') + '><g' + (lejos ? ' transform="translate(-15 0)"' : '') + '>' +
        '<path class="g-pantalon g-borde" d="M108 196H142L146 264C134 268 116 268 104 264Z"/>' +
        (lejos ? '' : '<path class="g-pantalon-2 g-borde g-fina" d="M110 226H126V246H110Z"/><path class="g-linea g-fina" d="M109.5 231H126.5"/>') +
        '<path class="g-zapato g-borde" d="M102 283C100 272 106 264 118 264H130C144 264 156 272 158 281V285C158 289 155 292 150 292H106C103 292 102 289 102 285Z"/>' +
        '<path class="g-tinta" d="M102.4 284H157.6C157.4 289 154.6 292 150 292H106C103.2 292 102.4 289.4 102.4 284Z"/>' +
        '<path class="g-linea g-fina" d="M141 266.5C150 270 155.5 276 156.8 281"/>' +
        '<path class="g-cordon" d="M122 266.5L128 272M128.5 265.5L134.5 271"/>' +
      '</g></g>';
    };
    return cola('p') +
      pierna(true) + brazo('pq', true) + pierna(false) +
      // Torso de lado: capucha atrás, chaqueta, franja de polera adelante
      '<g data-p="ptorso">' +
        '<path class="g-chaqueta-2 g-borde" d="M93 150C84 136 94 123 112 126C106 132 104 140 104 152Z"/>' +
        '<path class="g-chaqueta g-borde" d="M104 132C116 127 134 127 142 134C150 142 152 160 152 180V206C138 210 114 210 100 206L98 160C98 146 100 138 104 132Z"/>' +
        '<path class="g-polera g-borde g-fina" d="M143.5 137C149 146 150.5 162 150.5 182V199H145L144.5 150Z"/>' +
        '<path class="g-tinta" d="M145 194H151.5V202H145Z"/>' +
        '<path class="g-linea g-fina g-pliegue" d="M101 199C115 202 138 202 151 199M112 176C118 186 128 190 138 190"/>' +
      '</g>' +
      // Mochila vista de lado, en la espalda
      '<g data-p="pmochila">' +
        '<path class="g-linea" d="M80 136C80 125 95 125 95 136"/>' +
        '<path class="g-bolso g-borde" d="M71 147C71 139 77 135 85 135H105L106 204H79C73 204 69 200 69 194Z"/>' +
        '<path class="g-bolso-2 g-borde g-fina" d="M70 176H101L101.5 198H75C71.5 198 70 196 70 192Z"/><path class="g-linea g-fina" d="M74 184H97"/>' +
        '<path class="g-tubo g-tirante-b" d="M103 141C112 132 128 133 134 145C138 156 139 170 139 184"/>' +
        '<path class="g-tubo g-tirante" d="M103 141C112 132 128 133 134 145C138 156 139 170 139 184"/>' +
      '</g>' +
      // Cabeza de perfil
      '<g data-p="pcabeza">' +
        '<g data-p="poreja-q"><path class="g-piel-2 g-borde" d="M78 66C73 46 75 29 84 16C97 26 105 38 110 52Z"/></g>' +
        '<g data-p="poreja-n"><path class="g-piel g-borde" d="M110 52C109 33 115 18 126 6C138 18 146 32 150 50Z"/><path class="g-tinta" d="M118 46C117.5 34 121.5 23 127 15C134 24 139 34 142.5 46Z"/></g>' +
        '<path class="g-piel g-borde" d="M112 38C142 36 166 44 176 58C181 65 183 72 185 78C190 80 197 84 198 90C199 96 195 99 190 100C189 106 184 112 176 114C168 120 158 124 146 127C128 131 108 131 94 127L84 131L86 124L74 124L80 117C66 108 60 92 62 76C64 52 84 39 112 38Z"/>' +
        '<g class="g-linea g-fina"><path d="M184 96L210 89M184 101L212 102M183 106L206 113"/></g>' +
        '<ellipse data-p="prubor" class="g-rubor" cx="166" cy="103" rx="7.5" ry="4.2"/>' +
        '<g data-p="ojo-p">' + ojo(id, 'p') + '</g>' +
        '<path data-p="ceja-p" class="g-linea" d="M-8 1.5Q0 -2.5 8 1.5"/>' +
        '<path class="g-tinta" d="M190 82.5Q199.5 83.5 199.5 90Q195 92 189.5 87.5Z"/>' +
        '<g data-p="pboca">' +
          '<path data-bocap="sonrisa" class="g-linea g-fina" d="M1 0Q-4 8 -15 4"/>' +
          '<g data-bocap="burla"><path class="g-linea g-fina" d="M1 0Q-5 7 -12 5Q-16 4 -17 -1"/><path class="g-blanco g-borde g-fina" d="M-4 4.6L-2.5 9L0 4Z"/></g>' +
          '<path data-bocap="plano" class="g-linea g-fina" d="M1 2L-13 3"/>' +
          '<path data-bocap="triste" class="g-linea g-fina" d="M1 4Q-6 -2 -14 5"/>' +
          '<g data-bocap="abierta"><path class="g-tinta g-borde g-fina" d="M2 -1L-15 1Q-11 15 1 11Z"/><path class="g-lengua" d="M-10 9Q-5 5 -1 10Q-6 13 -10 9Z"/></g>' +
          '<ellipse data-bocap="o" class="g-tinta" cx="-2" cy="5" rx="3.4" ry="4.4"/>' +
          '<circle data-bocap="silba" class="g-tinta" cx="3" cy="4" r="3.4"/>' +
          '<g data-bocap="lengua"><path class="g-linea g-fina" d="M1 0Q-4 8 -15 4"/><path class="g-lengua g-borde g-fina" d="M-3 5Q1 15 6 6"/></g>' +
          '<g data-bocap="apreta"><path class="g-blanco g-borde g-fina" d="M2 0L-14 1L-13 9L2 8Z"/><path class="g-linea g-fina" d="M1 4.5H-13M-5 1V8.5"/></g>' +
          '<path data-bocap="habla" class="g-tinta" d="M2 0L-12 1Q-8 10 1 8Z"/>' +
        '</g>' +
        '<g data-p="plentes"><path class="g-tinta" d="M148 67H180L178 85C177 90 173 93 167 93H156C152 93 148 90 148 86Z"/><path class="g-linea" d="M149 71L106 66"/><path class="g-brillo" d="M154 72L165 72"/></g>' +
      '</g>' +
      brazo('pn');
  }

  function dibujo(id) {
    return '<svg class="gato" viewBox="0 0 240 300" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="' + id + '-ojo"><ellipse rx="11.5" ry="13.5"/></clipPath></defs>' +
      '<ellipse class="g-piso" cx="120" cy="293" rx="58" ry="6"/>' +
      '<g data-p="todo">' +
        '<g data-p="frente">' + frente(id) + '</g>' +
        '<g data-p="perfil" style="display:none">' + perfil(id) + '</g>' +
        // Efectos junto a la cabeza (compartidos por las dos vistas)
        '<g data-p="fx">' +
          '<g data-p="fx-chispas" class="g-fx-linea"><path d="M188 52L200 45M190 68H203M180 38L187 27M52 52L40 45M50 68H37"/></g>' +
          '<g data-p="fx-exclama"><path class="g-fx-1" d="M186 6H193L191.5 29H187.5Z"/><circle class="g-fx-1" cx="189.6" cy="36" r="3.2"/></g>' +
          '<g data-p="fx-pregunta"><path class="g-fx-linea g-fx-2" d="M198 22C198 13 212 12 212 21C212 27 205 27 205 34"/><circle class="g-fx-2" cx="205" cy="41.5" r="2.6"/></g>' +
          '<g data-p="fx-gota"><path class="g-gota g-borde g-fina" d="M184 56C184 56 176 68 176 73C176 78 180 81 184 81C188 81 192 78 192 73C192 68 184 56 184 56Z"/></g>' +
          '<g data-p="fx-vena" class="g-vena"><path d="M162 50Q167 49 168 44M172 44Q173 49 178 50M178 54Q173 55 172 60M168 60Q167 55 162 54"/></g>' +
          '<g data-p="fx-zzz" class="g-fx-linea"><path d="M0 0H8L0 9H8"/><path d="M0 0H8L0 9H8"/><path d="M0 0H8L0 9H8"/></g>' +
          '<g data-p="fx-notas" class="g-nota"><path d="M0 0V-15L9 -18V-3M-4 1A4 3 0 1 0 4 1A4 3 0 1 0 -4 1M5 -2A4 3 0 1 0 13 -2A4 3 0 1 0 5 -2"/><path d="M0 0V-15L7 -12M-4 1A4 3 0 1 0 4 1A4 3 0 1 0 -4 1"/></g>' +
          '<g data-p="fx-estrellas">' + [1, 2, 3].map(function (n) { return '<path class="g-estrella g-conf-' + n + '" d="M0 -7.5L2.1 -2.1L7.5 0L2.1 2.1L0 7.5L-2.1 2.1L-7.5 0L-2.1 -2.1Z"/>'; }).join('') + '</g>' +
          '<g data-p="fx-suspiro" class="g-nube g-borde g-fina"><path d="M188 112C184 112 182 108 185 105C184 101 189 99 192 101C194 97 200 98 201 102C205 101 208 105 205 108C207 112 202 114 199 112C197 115 191 115 188 112Z"/></g>' +
        '</g>' +
        '<g data-p="fx-confeti" class="g-confeti"></g>' +
      '</g>' +
    '</svg>';
  }

  // ---------- Poses ----------
  // Cada pose cambia solo lo que difiere de la base. Brazos de frente (bI, bD): [x, y] de la muñeca, forma de
  // la mano, hacia dónde dobla el codo ('fuera' | 'dentro' | 'abajo' | 'arriba' | 'atras' | 'delante'), giro de la
  // mano en grados y, si el sexto valor es true, ese giro es absoluto (0 = dedos a la derecha).
  // pb = postura de los brazos cuando está de perfil (ver BRAZOS_PERFIL). vista: 1 = perfil a la derecha, -1 = a la izquierda.
  // sigue = cuánto siguen los ojos al puntero (1 = del todo). Por defecto 1, o 0.3 si la pose define su propia mirada
  // (pupX o pupY), y 0 con los ojos cerrados. Las poses que miran a propósito a otro lado lo fijan en 0.
  var BASE = {
    y: 0, x: 0, sx: 1, sy: 1, incl: 0,
    rot: 0, cy: 0, giro: 0.22,
    lid: 0.36, lidB: 0.12, lidAng: 0, lidI: 0, lidD: 0, pupX: 0.25, pupY: 0.1, pupS: 1,
    cejaOp: 0, cejaY: 0, cejaAng: 0,
    rubor: 0.35, orejaI: 0, orejaD: 0,
    piernaI: 0, piernaD: 0, cola: 0, colaAmp: 1,
    lentes: 0,
    ojos: 'abiertos', boca: 'burla',
    bI: [91, 213, 'bolsillo', 'fuera', 0], bD: [149, 213, 'bolsillo', 'fuera', 0], pb: 'bolsillo',
    fx: [],
  };
  var CRUZADOS = { bI: [141, 171, 'puno', 'abajo', 0], bD: [100, 167, 'puno', 'abajo', 0], pb: 'cruzado' };
  function con(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  var POSES = {
    feliz: {},
    sarcastico: { lid: 0.55, rot: -4, giro: 0.35, boca: 'burla', pupX: 0.6 },
    muyfeliz: { ojos: 'felices', boca: 'risa', rubor: 0.75, cy: -2, bI: [46, 78, 'puno', 'fuera', 0], bD: [194, 78, 'puno', 'fuera', 0], pb: 'arriba', fx: ['chispas'], orejaI: -6, orejaD: -6 },
    risa: { ojos: 'felices', boca: 'risa', rubor: 0.7, rot: 7, bI: [114, 186, 'palma', 'abajo', 0, true], bD: [190, 150, 'dedo', 'abajo', 0], pb: 'barriga', fx: ['chispas'] },
    guino: { ojos: 'guino', boca: 'dientes', rot: -4, giro: 0.45, bD: [190, 150, 'dedo', 'abajo', 0], pb: 'apunta' },
    afirmando: { ojos: 'guino', boca: 'dientes', rot: -3, giro: 0.35, bD: [184, 146, 'pulgar', 'abajo', 0, true], pb: 'pulgar' },
    soberbio: con(CRUZADOS, { sigue: 0, lid: 0.58, lidB: 0.05, rot: -7, giro: -0.15, pupX: -0.5, pupY: -0.2, boca: 'plano', cejaOp: 0.8, cejaY: -3, cejaAng: -6 }),
    lentes: con(CRUZADOS, { lentes: 1, boca: 'burla', rot: -6, giro: 0.3, lid: 0.2 }),
    pensativo: { sigue: 0.15, lid: 0.3, lidB: 0, pupX: 0.55, pupY: -0.85, boca: 'plano', rot: 5, cejaOp: 0.7, cejaY: -4, cejaAng: -4, bD: [132, 124, 'puno', 'fuera', -90], pb: 'menton' },
    idea: { lid: 0, lidB: 0, pupS: 1.1, pupY: -0.5, boca: 'sonrisa', rot: -3, cy: -3, bD: [178, 112, 'dedo', 'abajo', -90, true], pb: 'idea', fx: ['exclama'], cejaOp: 0.8, cejaY: -6 },
    sorprendido: { lid: 0, lidB: 0, pupS: 0.78, pupX: 0, pupY: 0, boca: 'oo', cy: -4, orejaI: -8, orejaD: -8, cejaOp: 0.9, cejaY: -7, bI: [113, 168, 'puno', 'abajo', 0], bD: [127, 168, 'puno', 'abajo', 0], pb: 'pecho', fx: ['exclama'] },
    confundido: { rot: 12, giro: -0.25, lid: 0.05, lidB: 0, lidD: 0.3, pupX: -0.3, pupY: -0.4, boca: 'nervio', cejaOp: 0.9, cejaAng: -10, fx: ['pregunta'], orejaD: 10 },
    enojado: { lid: 0.3, lidAng: 22, lidB: 0.1, pupS: 0.85, boca: 'apreta', cejaOp: 1, cejaY: 5, cejaAng: 24, bI: [74, 162, 'puno', 'abajo', 0], bD: [166, 162, 'puno', 'abajo', 0], pb: 'cadera', fx: ['vena'], orejaI: 14, orejaD: 14, rubor: 0 },
    triste: { lid: 0.45, lidAng: -20, lidB: 0, pupY: 0.6, pupX: -0.2, boca: 'triste', cejaOp: 1, cejaY: -2, cejaAng: -20, cy: 4, rot: 5, orejaI: 26, orejaD: 26, cola: 10, colaAmp: 0.25, rubor: 0.2, bI: [82, 212, 'puno', 'fuera', 0], bD: [158, 212, 'puno', 'fuera', 0], pb: 'cuelga' },
    miedo: { lid: 0, lidB: 0, pupS: 0.62, boca: 'nervio', cejaOp: 1, cejaY: -6, cejaAng: -14, orejaI: 18, orejaD: 18, bI: [110, 112, 'puno', 'abajo', -90], bD: [130, 112, 'puno', 'abajo', 90], pb: 'boca', fx: ['gota'], cy: 2 },
    cansado: { sigue: 0.2, lid: 0.72, lidB: 0.1, boca: 'bostezo', rot: -6, bD: [128, 112, 'palma', 'fuera', 180, true], pb: 'boca', orejaI: 12, orejaD: 12 },
    dormido: { lid: 1, lidB: 0, boca: 'gato', rot: 9, cy: 4, colaAmp: 0.3, orejaI: 16, orejaD: 16, fx: ['zzz'], rubor: 0.5 },
    facepalm: { sigue: 0, lid: 0.6, boca: 'plano', rot: 10, cy: 3, bD: [132, 86, 'palma', 'fuera', 200, true], pb: 'cara', orejaI: 10, orejaD: 10 },
    aburrido: { lid: 0.62, lidB: 0.15, pupX: 0.6, pupY: 0.2, boca: 'plano', rot: -3, fx: ['suspiro'], colaAmp: 0.4 },
    // Datos personales: se da vuelta del todo hacia afuera, cierra los ojos, levanta la nariz y silba
    indiferente: con(CRUZADOS, { vista: -1, giro: -1, rot: -12, lid: 1, lidB: 0, boca: 'silba', fx: ['notas'], orejaD: -6, colaAmp: 1.6, rubor: 0.15 }),
    negacion: con(CRUZADOS, { sigue: 0, giro: -0.7, rot: -8, lid: 0.6, pupX: -0.8, boca: 'plano', cejaOp: 0.7, cejaY: -3 }),
    lengua: { ojos: 'felices', boca: 'lengua', rot: 7, giro: 0.4, bD: [190, 150, 'dedo', 'abajo', 0], pb: 'apunta', rubor: 0.6 },
    saluda: { lid: 0.12, lidB: 0, boca: 'sonrisa', giro: 0.3, bD: [186, 96, 'palma', 'abajo', -90, true], pb: 'saluda', rubor: 0.5 },
    curioso: { giro: 0.85, pupX: 1, lid: 0.08, lidB: 0, boca: 'o', rot: 5, orejaD: -8 },
    preocupado: { lid: 0.12, lidAng: -16, lidB: 0, boca: 'nervio', cejaOp: 1, cejaAng: -16, cejaY: -3, bI: [113, 170, 'puno', 'abajo', 0], bD: [127, 170, 'puno', 'abajo', 0], pb: 'pecho', fx: ['gota'] },
    burlon: { ojos: 'aprieta', boca: 'risa', rot: -6, rubor: 0.7, bI: [114, 186, 'palma', 'abajo', 0, true], pb: 'barriga', fx: ['chispas'] },
    orgulloso: { ojos: 'felices', boca: 'sonrisa', rot: -8, cy: -2, rubor: 0.6, bI: [80, 188, 'puno', 'fuera', 0], bD: [160, 188, 'puno', 'fuera', 0], pb: 'cadera' },
    // Mareado (el mouse se movió como loco): estrellas alrededor de la cabeza, brazos sueltos; el gesto 'mareo' le da vueltas a los ojos
    mareado: { sigue: 0, lid: 0.1, lidB: 0, pupS: 0.85, boca: 'nervio', rot: 8, cy: 2, cejaOp: 0.9, cejaY: -3, cejaAng: -12, orejaI: 14, orejaD: -4, rubor: 0.2, bI: [82, 212, 'puno', 'fuera', 0], bD: [158, 212, 'puno', 'fuera', 0], pb: 'cuelga', fx: ['estrellas'] },
    // Perfil completo: mira del todo hacia un lado
    'mira-d': { vista: 1, sigue: 0.5, lid: 0.08, lidB: 0, pupS: 1, boca: 'o', rot: -3, orejaD: -8, orejaI: -4 },
    'mira-i': { vista: -1, sigue: 0.5, lid: 0.3, lidB: 0.05, boca: 'burla', rot: 2, orejaD: -4 },
  };
  // Brazos de perfil: n = el brazo cercano, q = el lejano (detrás del cuerpo)
  var BOLSILLO_Q = [112, 214, 'bolsillo', 'atras', 0];
  var BRAZOS_PERFIL = {
    bolsillo: { n: [123, 216, 'bolsillo', 'atras', 0] },
    cruzado: { n: [153, 174, 'bolsillo', 'abajo', 0], q: [148, 170, 'bolsillo', 'abajo', 0] },
    apunta: { n: [200, 148, 'dedo', 'abajo', 0] },
    pulgar: { n: [186, 150, 'pulgar', 'abajo', 0, true] },
    arriba: { n: [168, 62, 'puno', 'delante', 0], q: [150, 56, 'puno', 'delante', 0] },
    menton: { n: [180, 122, 'puno', 'abajo', -90, true] },
    idea: { n: [180, 100, 'dedo', 'abajo', -90, true] },
    boca: { n: [190, 108, 'palma', 'abajo', 170, true] },
    cara: { n: [176, 84, 'palma', 'abajo', 200, true] },
    saluda: { n: [180, 96, 'palma', 'abajo', -90, true] },
    pecho: { n: [154, 166, 'puno', 'abajo', 0], q: [148, 166, 'puno', 'abajo', 0] },
    cadera: { n: [138, 198, 'puno', 'atras', 0] },
    cuelga: { n: [128, 222, 'puno', 'atras', 0] },
    barriga: { n: [152, 190, 'palma', 'abajo', 0, true] },
  };

  var FX = ['chispas', 'exclama', 'pregunta', 'gota', 'vena', 'zzz', 'notas', 'suspiro', 'estrellas'];
  var NUM = ['y', 'x', 'sx', 'sy', 'incl', 'rot', 'cy', 'giro', 'vista', 'lid', 'lidB', 'lidAng', 'lidI', 'lidD', 'pupX', 'pupY', 'pupS',
    'cejaOp', 'cejaY', 'cejaAng', 'rubor', 'orejaI', 'orejaD', 'piernaI', 'piernaD', 'cola', 'colaAmp', 'lentes',
    'a1I', 'a2I', 'hI', 'a1D', 'a2D', 'hD', 'a1P', 'a2P', 'hP', 'a1Q', 'a2Q', 'hQ', 'lookX', 'lookY', 'headX', 'headY', 'mira', 'sigue'].concat(FX.map(function (n) { return 'fx-' + n; }));
  // Resorte por parámetro: rigidez (más rígido = más rápido). Mirada: los ojos van rápido (look), la cabeza lento (head).
  var RIGIDEZ = { lid: 420, lidB: 300, pupX: 260, pupY: 260, lookX: 150, lookY: 150, headX: 36, headY: 36, mira: 26, sigue: 90, lentes: 120, colaAmp: 40, cola: 90, vista: 150, 'fx-zzz': 60, 'fx-notas': 80 };
  var MIRADA = { lookX: 1, lookY: 1, headX: 1, headY: 1, mira: 1 };
  // Gestos de cuerpo entero: no se suman entre ellos (el anterior se desvanece)
  var GRANDES = { salta: 1, celebra: 1, sacude: 1, tiembla: 1, baila: 1, risa: 1, estira: 1, vuelta: 1, mareo: 1 };
  var ANGULOS = /^(a[12]|h)[IDPQ]$/;

  var SL = [88, 145], SR = [152, 145], SPN = [126, 150], SPQ = [116, 148], L1 = 38, L2 = 36;
  function ik(S, W, codo) {
    var dx = W[0] - S[0], dy = W[1] - S[1], d = Math.sqrt(dx * dx + dy * dy);
    d = Math.max(8, Math.min(L1 + L2 - 0.6, d));
    var th = Math.atan2(dy, dx);
    var al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    var best = null;
    [1, -1].forEach(function (s) {
      var a1 = th + s * al, ex = S[0] + L1 * Math.cos(a1), ey = S[1] + L1 * Math.sin(a1);
      var wx = S[0] + d * Math.cos(th), wy = S[1] + d * Math.sin(th);
      var a2 = Math.atan2(wy - ey, wx - ex);
      var score = codo === 'dentro' ? -Math.abs(ex - 120) : codo === 'abajo' ? ey : codo === 'arriba' ? -ey
        : codo === 'atras' ? -ex : codo === 'delante' ? ex : Math.abs(ex - 120);
      if (!best || score > best.score) best = { a1: a1 / RAD, a2: a2 / RAD, score: score };
    });
    return best;
  }
  function brazoObj(S, b) {
    var r = ik(S, b, b[3]);
    return { a1: r.a1, a2: r.a2, h: b[5] ? (b[4] || 0) - r.a2 : b[4] || 0, mano: b[2] };
  }
  function envolver(objetivo, actual) {
    while (objetivo - actual > 180) objetivo -= 360;
    while (objetivo - actual < -180) objetivo += 360;
    return objetivo;
  }
  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function lim(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function f(n) { return Math.round(n * 100) / 100; }
  // Boca de frente -> boca de perfil
  var BOCA_PERFIL = { gato: 'sonrisa', burla: 'burla', sonrisa: 'sonrisa', dientes: 'abierta', risa: 'abierta', o: 'o', oo: 'abierta', plano: 'plano',
    triste: 'triste', apreta: 'apreta', lengua: 'lengua', bostezo: 'abierta', silba: 'silba', nervio: 'plano', habla: 'habla' };

  function crear(op) {
    op = op || {};
    var id = 'gato' + (++uid);
    var caja = document.createElement('div');
    caja.innerHTML = dibujo(id);
    var svg = caja.firstChild;
    var P = {};
    [].forEach.call(svg.querySelectorAll('[data-p]'), function (el) { P[el.dataset.p] = el; });
    var bocas = {}, bocasP = {};
    [].forEach.call(svg.querySelectorAll('[data-boca]'), function (b) { bocas[b.dataset.boca] = b; });
    [].forEach.call(svg.querySelectorAll('[data-bocap]'), function (b) { bocasP[b.dataset.bocap] = b; });
    var manos = {};
    ['i', 'd', 'pn', 'pq'].forEach(function (l) {
      manos[l] = {};
      [].forEach.call(P['mano-' + l].querySelectorAll('[data-mano]'), function (m) { manos[l][m.dataset.mano] = m; });
    });
    var zs = [].slice.call(P['fx-zzz'].children), notas = [].slice.call(P['fx-notas'].children), estrellas = [].slice.call(P['fx-estrellas'].children);

    var cur = {}, vel = {}, obj = {};
    var disc = { ojos: 'abiertos', boca: 'burla', mI: 'bolsillo', mD: 'bolsillo', mP: 'bolsillo', mQ: 'bolsillo' };
    var poseNombre = 'feliz', lado = 'd', vistaMirar = 0;
    // Giro: vistaMeta es la vista pedida; se aplica solo cuando el giro anterior terminó (ver paso)
    var vistaMeta = 0, vistaQuieta = 0;
    var calm = calmMQ.matches || !!op.quieto;

    function objetivos(nombre) {
      var p = con(BASE, POSES[nombre] || {});
      var o = {};
      NUM.forEach(function (k) { if (typeof p[k] === 'number') o[k] = p[k]; });
      var bi = brazoObj(SL, p.bI), bd = brazoObj(SR, p.bD);
      var bp = BRAZOS_PERFIL[p.pb] || BRAZOS_PERFIL.bolsillo;
      var bn = brazoObj(SPN, bp.n), bq = brazoObj(SPQ, bp.q || BOLSILLO_Q);
      o.a1I = bi.a1; o.a2I = bi.a2; o.hI = bi.h;
      o.a1D = bd.a1; o.a2D = bd.a2; o.hD = bd.h;
      o.a1P = bn.a1; o.a2P = bn.a2; o.hP = bn.h;
      o.a1Q = bq.a1; o.a2Q = bq.a2; o.hQ = bq.h;
      o.vista = typeof p.vista === 'number' ? p.vista : vistaMirar;
      var propia = POSES[nombre] || {};
      o.sigue = typeof propia.sigue === 'number' ? propia.sigue : p.lid >= 0.9 ? 0 : ('pupX' in propia || 'pupY' in propia) ? 0.3 : 1;
      FX.forEach(function (fx) { o['fx-' + fx] = p.fx.indexOf(fx) > -1 ? 1 : 0; });
      return { num: o, ojos: p.ojos, boca: p.boca, mI: bi.mano, mD: bd.mano, mP: bn.mano, mQ: bq.mano };
    }
    var inicial = objetivos('feliz');
    NUM.forEach(function (k) { cur[k] = obj[k] = inicial.num[k] || 0; vel[k] = 0; });

    // Capas que se suman encima de los resortes (reposo, gestos, habla)
    var actos = [];
    var hablaHasta = 0, proxBoca = 0, bocaAbierta = false;
    var proxParpadeo = 1800, parpadeoT = -1, proxOreja = 5000, orejaT = -1, orejaLado = 'i';
    var saltoOjos = 0;
    var confeti = [], confetiT = -1;

    function pose(nombre) {
      if (!POSES[nombre]) nombre = 'feliz';
      poseNombre = nombre;
      var t = objetivos(nombre);
      Object.keys(t.num).forEach(function (k) {
        if (MIRADA[k]) return;
        if (k === 'vista') { vistaMeta = t.num[k]; if (calm) obj.vista = vistaMeta; return; }
        obj[k] = ANGULOS.test(k) ? envolver(t.num[k], cur[k]) : t.num[k];
      });
      if (lado === 'i' && !POSES[nombre].vista && nombre !== 'negacion') obj.giro = -Math.abs(obj.giro) - 0.25;
      if (disc.ojos !== t.ojos) { disc.ojos = t.ojos; saltoOjos = reloj(); }
      disc.boca = t.boca; disc.mI = t.mI; disc.mD = t.mD; disc.mP = t.mP; disc.mQ = t.mQ;
      if (calm) { NUM.forEach(function (k) { cur[k] = obj[k]; vel[k] = 0; }); pintar(reloj()); }
    }
    // Hora actual: la del último cuadro si el bucle corre; si estaba detenido, la del reloj (así un gesto pedido
    // después de esconder el gato no nace ya terminado)
    function reloj() { return raf ? ahora : performance.now(); }
    // mirar('d'|'i'): gira un poco la cabeza. Con completo = true se da vuelta del todo (perfil).
    function mirar(hacia, completo) {
      lado = hacia === 'i' ? 'i' : 'd';
      vistaMirar = completo ? (lado === 'd' ? 1 : -1) : 0;
      pose(poseNombre);
    }
    function gesto(nombre) {
      if (calm || !GESTOS[nombre]) return;
      var t = reloj();
      // Si ya lo está haciendo, no lo reinicia (empezar de nuevo a medias da un salto)
      for (var i = 0; i < actos.length; i++) if (actos[i].n === nombre && !actos[i].fin) return;
      // Dos gestos de cuerpo entero no se suman: el anterior se desvanece en 180 ms
      if (GRANDES[nombre]) actos.forEach(function (a) { if (GRANDES[a.n] && !a.fin) a.fin = t; });
      actos.push({ n: nombre, t0: t, d: GESTOS[nombre].d, fn: GESTOS[nombre].fn });
      if (nombre === 'celebra') lanzarConfeti();
    }
    function hablar(ms) { hablaHasta = reloj() + (ms || 1500); }
    function oreja() { orejaT = reloj(); orejaLado = Math.random() < 0.5 ? 'i' : 'd'; }

    // ---------- Mirada ----------
    // El puntero llega con seguir(x, y). Cada cuadro se suaviza: con movimientos normales los ojos van casi
    // justo al puntero; si el mouse va muy rápido, salta o se sacude, el suavizado se alarga y los ojos siguen
    // el promedio en vez de temblar. Sin puntero (salió de la ventana o lleva 6 s quieto) vuelve a la mirada de la pose.
    var ptr = null, ptrT = 0, ptrVel = 0, fijo = null, filt = null, caja = null, cajaT = -1e9;
    function seguir(x, y) {
      var t = performance.now();
      if (x == null) { ptr = null; return; }
      if (ptr) {
        var dx = x - ptr[0], dy = y - ptr[1], v = Math.sqrt(dx * dx + dy * dy) / Math.max(4, t - ptrT) * 1000;
        ptrVel = Math.max(ptrVel * 0.85, ptrVel * 0.6 + v * 0.4);
      }
      ptr = [x, y]; ptrT = t;
    }
    function foco(x, y) { fijo = x == null ? null : [x, y]; }
    function apuntar(t, dt) {
      ptrVel *= Math.exp(-dt / 0.25);
      var src = fijo || (ptr && t - ptrT < 6000 ? ptr : null);
      if (!src) { filt = null; obj.lookX = obj.lookY = obj.headX = obj.headY = obj.mira = 0; return; }
      var tau = fijo ? 0.08 : 0.045 + lim(ptrVel / 3000, 0, 1) * 0.4;
      if (!filt) filt = src.slice();
      else { var k = 1 - Math.exp(-dt / tau); filt[0] += (src[0] - filt[0]) * k; filt[1] += (src[1] - filt[1]) * k; }
      if (t - cajaT > 500) { caja = svg.getBoundingClientRect(); cajaT = t; }
      if (!caja.width) return;
      // Dirección desde la cabeza; a más de ~150 px mira del todo hacia allá, más cerca mira menos
      var dx = filt[0] - (caja.left + caja.width * 0.5), dy = filt[1] - (caja.top + caja.height * 0.29);
      var R = Math.max(150, caja.height * 1.1), d = Math.max(R, Math.sqrt(dx * dx + dy * dy));
      obj.lookX = obj.headX = dx / d;
      obj.lookY = obj.headY = dy / d;
      obj.mira = 1;
    }

    function lanzarConfeti() {
      var capa = P['fx-confeti'];
      capa.textContent = '';
      confeti = [];
      for (var i = 0; i < 16; i++) {
        var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('width', 6); r.setAttribute('height', 3.6); r.setAttribute('rx', 1);
        r.setAttribute('class', i % 3 === 0 ? 'g-conf-1' : i % 3 === 1 ? 'g-conf-2' : 'g-conf-3');
        capa.appendChild(r);
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        var v = 150 + Math.random() * 120;
        confeti.push({ el: r, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, x: 120, y: 70, g: Math.random() * 360, vg: (Math.random() - 0.5) * 900 });
      }
      confetiT = ahora;
    }

    // ---------- Gestos (se suman durante un tiempo) ----------
    var GESTOS = {
      salta: { d: 700, fn: function (t, a) {
        if (t < 0.17) { var k = suave(t / 0.17); a.sy -= 0.08 * k; a.sx += 0.05 * k; a.cy += 2 * k; }
        else if (t < 0.62) { var u = Math.sin(Math.PI * (t - 0.17) / 0.45); a.y -= 30 * u; a.sy += 0.05 * u; a.sx -= 0.035 * u; a.piernaI -= 9 * u; a.piernaD += 9 * u; a.a1I += 20 * u; a.a1D -= 20 * u; a.orejaI -= 8 * u; a.orejaD -= 8 * u; }
        else { var w = (t - 0.62) / 0.38; var s = Math.sin(Math.PI * Math.min(1, w * 1.6)) * (1 - w); a.sy -= 0.07 * s; a.sx += 0.045 * s; a.cy += 2.5 * s; }
      } },
      celebra: { d: 1500, fn: function (t, a) { GESTOS.salta.fn((t * 2) % 1, a); a.a2I += 16 * Math.sin(t * Math.PI * 6); a.a2D -= 16 * Math.sin(t * Math.PI * 6); } },
      sacude: { d: 760, fn: function (t, a) { var e = 1 - t; a.giro += 0.55 * Math.sin(t * Math.PI * 6) * e; a.rot += 3 * Math.sin(t * Math.PI * 6) * e; a.pupX -= 0.4 * Math.sin(t * Math.PI * 6) * e; } },
      asiente: { d: 640, fn: function (t, a) { var s = Math.sin(t * Math.PI * 4); a.cy += 3.6 * Math.max(0, s); a.pupY += 0.25 * Math.max(0, s); a.lid += 0.1 * Math.max(0, s); } },
      tiembla: { d: 620, fn: function (t, a) { var e = 1 - t * 0.6; a.x += (Math.random() - 0.5) * 2.6 * e; a.cy += (Math.random() - 0.5) * 1.4 * e; a.orejaI += (Math.random() - 0.5) * 6 * e; a.orejaD += (Math.random() - 0.5) * 6 * e; } },
      saluda: { d: 1700, fn: function (t, a) { var e = suave(Math.min(1, t * 5)) * suave(Math.min(1, (1 - t) * 4)); a.a2D += 26 * Math.sin(t * Math.PI * 8) * e; a.hD += 14 * Math.sin(t * Math.PI * 8 - 0.6) * e; a.rot += 2 * Math.sin(t * Math.PI * 4) * e; } },
      baila: { d: 2600, fn: function (t, a) {
        var e = suave(Math.min(1, t * 6)) * suave(Math.min(1, (1 - t) * 6)), b = Math.sin(t * Math.PI * 8), c = Math.cos(t * Math.PI * 8);
        a.x += 7 * b * e; a.incl += 4 * b * e; a.rot -= 7 * b * e; a.y -= 5 * Math.abs(c) * e;
        a.piernaI -= 12 * Math.max(0, b) * e; a.piernaD += 12 * Math.max(0, -b) * e;
        a.a1I += 18 * b * e; a.a1D += 18 * b * e; a.a2I += 22 * c * e; a.a2D += 22 * c * e; a.giro += 0.25 * b * e;
      } },
      risa: { d: 1300, fn: function (t, a) { var e = 1 - t, s = Math.abs(Math.sin(t * Math.PI * 9)); a.sy -= 0.035 * s * e; a.sx += 0.02 * s * e; a.cy += 2.5 * s * e; a.rot += 2 * Math.sin(t * Math.PI * 9) * e; } },
      estira: { d: 1600, fn: function (t, a) { var s = Math.sin(Math.PI * t); a.sy += 0.05 * s; a.sx -= 0.02 * s; a.a1I -= 40 * s; a.a1D += 40 * s; a.cy -= 3 * s; } },
      // Mareo: los ojos dan vueltas (cada uno hacia un lado) y la cabeza se bambolea
      mareo: { d: 2600, fn: function (t, a) {
        var e = suave(Math.min(1, t * 6)) * suave(Math.min(1, (1 - t) * 4));
        a.mareo = (a.mareo || 0) + e;
        a.rot += 7 * Math.sin(t * Math.PI * 5) * e; a.giro += 0.3 * Math.sin(t * Math.PI * 5 + 1) * e;
        a.x += 3 * Math.sin(t * Math.PI * 2.5) * e; a.incl += 3 * Math.sin(t * Math.PI * 2.5 + 0.8) * e;
      } },
      // Vuelta completa: mira a un lado, al otro y vuelve
      vuelta: { d: 1800, fn: function (t, a) { a.vista += Math.sin(t * Math.PI * 2) * suave(Math.min(1, (1 - t) * 3)) * 1.1; } },
    };

    // ---------- Bucle ----------
    var ahora = 0, antes = 0, raf = 0, cuadros = 0;
    function paso(t) {
      raf = 0;
      ahora = t;
      var dt = Math.min(0.05, antes ? (t - antes) / 1000 : 0.016);
      antes = t;
      apuntar(t, dt);
      // Giro completo: nunca queda a medias. Si piden otra vista mientras gira, espera a que el giro termine y deja
      // una pausa corta antes del siguiente (así un scroll o un mouse indecisos no lo dejan "entre medio").
      if (Math.abs(cur.vista - obj.vista) < 0.03 && Math.abs(vel.vista) < 0.3) {
        if (!vistaQuieta) vistaQuieta = t;
        if (vistaMeta !== obj.vista && t - vistaQuieta >= 350) { obj.vista = vistaMeta; vistaQuieta = 0; }
      } else vistaQuieta = 0;
      var n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
      for (var s = 0; s < n; s++) {
        for (var i = 0; i < NUM.length; i++) {
          var k = NUM[i], kk = RIGIDEZ[k] || (k.indexOf('fx-') === 0 ? 140 : 190), c = 2 * Math.sqrt(kk) * (k === 'y' || k === 'sy' ? 0.62 : 0.86);
          vel[k] += ((obj[k] - cur[k]) * kk - vel[k] * c) * h;
          cur[k] += vel[k] * h;
        }
      }
      pintar(t);
      // Se detiene si la pestaña no se ve o el gato está escondido (cualquier pose o gesto lo vuelve a arrancar)
      if (++cuadros % 60 === 0 && !svg.getClientRects().length) return;
      if (!document.hidden && svg.isConnected) raf = requestAnimationFrame(paso);
    }
    function arrancar() { if (!raf && !calm) { antes = 0; raf = requestAnimationFrame(paso); } }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) arrancar(); });

    function pintar(t) {
      var a = {}; NUM.forEach(function (k) { a[k] = cur[k]; });
      if (!calm) {
        // Respira, mueve la cola, parpadea y a veces mueve una oreja
        var r = Math.sin(t / 3400 * Math.PI * 2);
        a.cy -= 0.9 * r;
        a.torsoS = 1 + 0.011 * r;
        a.colaS = Math.sin(t / 2600 * Math.PI * 2) * 0.7 * cur.colaAmp + Math.sin(t / 1150 * Math.PI * 2) * 0.18 * cur.colaAmp;
        if (t > proxParpadeo && parpadeoT < 0) { parpadeoT = t; }
        if (parpadeoT >= 0) {
          var bt = (t - parpadeoT) / 150;
          if (bt >= 1) { parpadeoT = -1; proxParpadeo = t + 2200 + Math.random() * 4200; if (Math.random() < 0.18) proxParpadeo = t + 220; }
          else a.parp = Math.sin(Math.PI * bt);
        }
        if (t > proxOreja && orejaT < 0) { orejaT = t; orejaLado = Math.random() < 0.5 ? 'i' : 'd'; proxOreja = t + 5000 + Math.random() * 7000; }
        if (orejaT >= 0) {
          var ot = (t - orejaT) / 260;
          if (ot >= 1) orejaT = -1; else a[orejaLado === 'i' ? 'orejaI' : 'orejaD'] += 11 * Math.sin(Math.PI * ot);
        }
        actos = actos.filter(function (ac) {
          var u = (t - ac.t0) / ac.d;
          if (u >= 1) return false;
          var peso = ac.fin ? 1 - (t - ac.fin) / 180 : 1;
          if (peso <= 0) return false;
          if (peso >= 1) { ac.fn(Math.max(0, u), a); return true; }
          // Gesto cortado por otro: se suma cada vez menos, sin saltos
          var dl = { mareo: 0 }; NUM.forEach(function (k) { dl[k] = 0; });
          ac.fn(Math.max(0, u), dl);
          for (var k in dl) if (dl[k]) a[k] = (a[k] || 0) + dl[k] * peso;
          return true;
        });
      } else { a.torsoS = 1; a.colaS = 0; }
      // Mirada: cuánto sigue al puntero (según la pose y si hay puntero)
      a.w = lim(cur.mira, 0, 1) * lim(cur.sigue, 0, 1);
      // El párpado acompaña a la mirada: sube al mirar hacia arriba (si no, la pupila se esconde y parece dormido) y baja un poco al mirar abajo
      a.lidMira = (cur.lookY < 0 ? cur.lookY * 0.5 : cur.lookY * 0.12) * a.w;
      // Vuelta: al cruzar la mitad cambia de dibujo, con un parpadeo y un leve agache que disimulan el cambio
      var v = lim(a.vista, -1, 1), av = Math.abs(v);
      if (av > 0.02 && av < 0.98) {
        a.y += 3 * Math.sin(Math.PI * av);
        a.parp = Math.max(a.parp || 0, lim(1 - Math.abs(av - 0.5) * 6, 0, 1));
      }
      render(a, t, v);
    }

    function set(el, v) { if (el.__t !== v) { el.setAttribute('transform', v); el.__t = v; } }
    function mostrarEl(el, on) { var v = on ? '' : 'none'; if (el.__d !== v) { el.style.display = v; el.__d = v; } }
    function opa(el, v) { v = lim(v, 0, 1); var s = v < 0.01 ? '0' : String(f(v)); if (el.__o !== s) { el.style.opacity = s; el.__o = s; } mostrarEl(el, v >= 0.01); }
    function dAttr(el, v) { if (el.__dd !== v) { el.setAttribute('d', v); el.__dd = v; } }

    // Ojo: tipo (abierto, feliz, apretado), párpados con el parpadeo encima y pupila
    function pintarOjo(l, a, escOjo, sgn, pupX, pupY, lidExtra) {
      var tipo = disc.ojos;
      var abierto = tipo === 'abiertos' || (tipo === 'guino' && l === 'i');
      var feliz = tipo === 'felices' || (tipo === 'guino' && l !== 'i');
      mostrarEl(P['feliz-' + l], feliz);
      mostrarEl(P['aprieta-' + l], tipo === 'aprieta');
      var ey = 'scale(1 ' + f(escOjo) + ')';
      set(P['feliz-' + l], ey); set(P['aprieta-' + l], ey);
      var lid = lim(a.lid + lidExtra + (a.lidMira || 0), 0, 1);
      if (a.parp) lid = lid + (1 - lid) * a.parp;
      // Casi cerrado: el ojo se funde en una línea curva (ojos cerrados y parpadeo)
      var cierre = abierto ? suave((lid - 0.74) / 0.22) : 0;
      opa(P['abierto-' + l], abierto ? 1 - cierre : 0);
      opa(P['cerrado-' + l], cierre);
      if (!abierto || cierre > 0.99) return;
      set(P['parpado-' + l], 'rotate(' + f(sgn * a.lidAng) + ') translate(0 ' + f(-14 + 27.5 * lid) + ')');
      set(P['bajo-' + l], 'translate(0 ' + f(14 - 20 * Math.max(0, a.lidB) * (1 - (a.parp || 0))) + ')');
      if (a.mareo > 0.01) {
        var giroOjo = ahora / 95 * (l === 'd' ? -1 : 1) + (l === 'd' ? 1.4 : 0);
        pupX += Math.cos(giroOjo) * a.mareo; pupY += Math.sin(giroOjo) * a.mareo;
      }
      set(P['pupila-' + l], 'translate(' + f(lim(pupX, -1.2, 1.2) * 4.2) + ' ' + f(lim(pupY, -1.2, 1.2) * 3.6) + ') scale(' + f(a.pupS) + ')');
    }
    // Brazo: cinemática directa desde los ángulos (el resorte trabaja en ángulos, así el movimiento hace arcos)
    function pintarBrazo(l, S, a1, a2, hm, forma, torsoY) {
      var r1 = a1 * RAD, r2 = a2 * RAD, sy2 = S[1] + torsoY;
      var ex = S[0] + L1 * Math.cos(r1), ey = sy2 + L1 * Math.sin(r1);
      var wx = ex + L2 * Math.cos(r2), wy = ey + L2 * Math.sin(r2);
      var cx = 2 * ex - (S[0] + wx) / 2, cy = 2 * ey - (sy2 + wy) / 2;
      var d = 'M' + f(S[0]) + ' ' + f(sy2) + 'Q' + f(cx) + ' ' + f(cy) + ' ' + f(wx) + ' ' + f(wy);
      dAttr(P['manga-borde-' + l], d);
      dAttr(P['manga-' + l], d);
      dAttr(P['puno-' + l], 'M' + f(wx - Math.cos(r2) * 7) + ' ' + f(wy - Math.sin(r2) * 7) + 'L' + f(wx - Math.cos(r2) * 1.5) + ' ' + f(wy - Math.sin(r2) * 1.5));
      for (var m in manos[l]) mostrarEl(manos[l][m], m === forma);
      mostrarEl(P['puno-' + l], forma !== 'bolsillo');
      set(P['mano-' + l], 'translate(' + f(wx) + ' ' + f(wy) + ') rotate(' + f(a2 + hm) + ')');
    }
    function formaBoca(t, abiertas) {
      var forma = disc.boca, esc = 1;
      if (!calm && t < hablaHasta) {
        if (t > proxBoca) { bocaAbierta = !bocaAbierta; proxBoca = t + 80 + Math.random() * 90; }
        if (abiertas[forma]) esc = bocaAbierta ? 1.12 : 0.82;
        else if (bocaAbierta) forma = 'habla';
      } else bocaAbierta = false;
      return [forma, esc];
    }
    var ABIERTAS = { dientes: 1, risa: 1, oo: 1, bostezo: 1, o: 1 };

    function render(a, t, v) {
      var av = Math.abs(v), dir = v < 0 ? -1 : 1, enPerfil = av >= 0.5;
      var torsoY = (1 - a.torsoS) * 60;
      // Cuerpo completo: salto, aplastado y balanceo desde los pies
      set(P.todo, 'translate(' + f(a.x) + ' ' + f(a.y) + ') rotate(' + f(a.incl) + ' 120 292) translate(120 292) scale(' + f(a.sx) + ' ' + f(a.sy) + ') translate(-120 -292)');
      mostrarEl(P.frente, !enPerfil);
      mostrarEl(P.perfil, enPerfil);
      var colaS = a.colaS + a.cola / 20;
      var dCola = 'M104 232C80 250 44 250 36 226C30 208 ' + f(34 + colaS * 7) + ' ' + f(192 + a.cola) + ' ' + f(48 + colaS * 10) + ' ' + f(182 - Math.abs(colaS) * 3 + a.cola * 1.8);
      var g = lim(a.giro + cur.headX * 0.34 * a.w, -1.2, 1.2);
      if (!enPerfil) {
        // Primera mitad de la vuelta: la cara se va del todo hacia el lado y el cuerpo se angosta
        var k = suave(Math.min(1, av * 2));
        g = g * (1 - k) + dir * 1.18 * k;
        set(P.frente, 'translate(' + f(120 + dir * 5 * k) + ' 0) scale(' + f(1 - 0.15 * k) + ' 1) translate(-120 0)');
        pintarFrente(a, t, g, torsoY, dCola);
      } else {
        // Segunda mitad: aparece el perfil (en espejo si mira a la izquierda) y se ensancha hasta su tamaño
        var m = suave(Math.min(1, (av - 0.5) * 2));
        set(P.perfil, 'translate(' + f(120 - dir * 5 * (1 - m)) + ' 0) scale(' + f(dir * (0.85 + 0.15 * m)) + ' 1) translate(-120 0)');
        pintarPerfil(a, t, torsoY, dCola);
      }
      // Efectos: siguen a la cabeza (sin espejo, para que "?" y "z" no se lean al revés)
      set(P.fx, 'translate(' + f(enPerfil ? 0 : g * 3) + ' ' + f(a.cy + torsoY) + ') rotate(' + f(enPerfil ? dir * a.rot : a.rot) + ' 120 132)');
      var bocaLado = enPerfil ? dir : (g < 0 ? -1 : 1);
      FX.forEach(function (n) {
        var val = lim(a['fx-' + n], 0, 1);
        opa(P['fx-' + n], val);
        if (val < 0.01) return;
        var tr = '';
        if (n === 'chispas') tr = 'translate(120 60) scale(' + f(0.7 + 0.3 * val + 0.05 * Math.sin(t / 140)) + ') translate(-120 -60)';
        else if (n === 'exclama' || n === 'pregunta') tr = 'translate(0 ' + f((1 - val) * 10 + Math.sin(t / 260) * 1.2) + ')';
        else if (n === 'gota') tr = 'translate(0 ' + f(((t / 1400) % 1) * 14) + ')';
        else if (n === 'vena') tr = 'translate(170 52) scale(' + f(0.6 + 0.4 * val + 0.12 * Math.abs(Math.sin(t / 180))) + ') translate(-170 -52)';
        else if (n === 'suspiro') tr = 'translate(' + f(((t / 1800) % 1) * 12) + ' 0)';
        if (tr) set(P['fx-' + n], tr);
        if (n === 'zzz') zs.forEach(function (z, i) {
          var u = ((t / 2400) + i / 3) % 1;
          set(z, 'translate(' + f(176 + u * 22) + ' ' + f(46 - u * 34) + ') scale(' + f(0.6 + u * 0.7) + ')');
          z.style.opacity = f(Math.sin(Math.PI * u));
        });
        if (n === 'estrellas') estrellas.forEach(function (z, i) {
          var ang = t / 520 + i * Math.PI * 2 / 3, cx = enPerfil ? 120 + dir * 12 : 120 + g * 3;
          set(z, 'translate(' + f(cx + Math.cos(ang) * 64) + ' ' + f(30 + Math.sin(ang) * 11) + ') rotate(' + f(t / 9 % 360) + ') scale(' + f((0.75 + 0.3 * (Math.sin(ang) + 1) / 2) * val) + ')');
        });
        if (n === 'notas') notas.forEach(function (z, i) {
          var u = ((t / 2000) + i / 2) % 1;
          var base = enPerfil ? (dir > 0 ? 198 : 42) : (bocaLado < 0 ? 58 : 182);
          set(z, 'translate(' + f(base + bocaLado * u * 26) + ' ' + f(108 - u * 58) + ') rotate(' + f(Math.sin(u * 9) * 12) + ') scale(' + f(0.75 + u * 0.3) + ')');
          z.style.opacity = f(Math.sin(Math.PI * u));
        });
      });
      // Confeti del envío
      if (confetiT >= 0) {
        var ct = (t - confetiT) / 1000;
        if (ct > 1.6) { confetiT = -1; P['fx-confeti'].textContent = ''; }
        else confeti.forEach(function (c) {
          c.el.setAttribute('transform', 'translate(' + f(c.x + c.vx * ct) + ' ' + f(c.y + c.vy * ct + 260 * ct * ct) + ') rotate(' + f(c.g + c.vg * ct) + ')');
          c.el.style.opacity = f(Math.max(0, 1 - ct / 1.6));
        });
      }
    }

    function pintarFrente(a, t, g, torsoY, dCola) {
      dAttr(P['cola-borde'], dCola); dAttr(P['cola-piel'], dCola); dAttr(P['cola-punta'], dCola);
      set(P.torso, 'translate(0 202) scale(1 ' + f(a.torsoS) + ') translate(0 -202)');
      set(P['pierna-i'], 'rotate(' + f(a.piernaI) + ' 108 200)');
      set(P['pierna-d'], 'rotate(' + f(a.piernaD) + ' 132 200)');
      set(P.mochila, 'translate(' + f(-g * 3) + ' 0)');
      // Cabeza: inclinación desde el cuello; el giro desplaza la cara hacia un lado (efecto de volumen)
      set(P.cabeza, 'translate(' + f(g * 3) + ' ' + f(a.cy + torsoY + cur.headY * 1.6 * a.w) + ') rotate(' + f(a.rot + cur.headX * 2.2 * a.w) + ' 120 132)');
      set(P.cara, 'translate(' + f(g * 13) + ' ' + f(Math.abs(g) * -0.6) + ')');
      set(P['oreja-i'], 'translate(' + f(g * 6 + (g > 0 ? g * 3 : 0)) + ' ' + f(g > 0 ? g * 3 : 0) + ') rotate(' + f(-a.orejaI + g * 4) + ' 84 60)');
      set(P['oreja-d'], 'translate(' + f(g * 6 + (g < 0 ? g * 3 : 0)) + ' ' + f(g < 0 ? -g * 3 : 0) + ') rotate(' + f(a.orejaD + g * 4) + ' 156 60)');
      var escI = 1 - Math.max(0, g) * 0.22, escD = 1 - Math.max(0, -g) * 0.22;
      set(P['bigotes-i'], 'translate(' + f(-g * 4) + ' 0) translate(68 0) scale(' + f(escI) + ' 1) translate(-68 0)');
      set(P['bigotes-d'], 'translate(' + f(-g * 4) + ' 0) translate(172 0) scale(' + f(escD) + ' 1) translate(-172 0)');
      set(P['ojo-i'], 'translate(' + f(99 + g * 3) + ' 86) scale(' + f(escI) + ' 1)');
      set(P['ojo-d'], 'translate(' + f(141 - g * 3) + ' 86) scale(' + f(escD) + ' 1)');
      var escOjo = calm ? 1 : 0.75 + 0.25 * suave(Math.min(1, (t - saltoOjos) / 160));
      // Pupilas: la mirada de la pose (con lo que sumen los gestos) mezclada con la dirección del puntero
      var px = a.pupX + (cur.lookX * 1.05 - cur.pupX) * a.w, py = a.pupY + (cur.lookY - cur.pupY) * a.w;
      pintarOjo('i', a, escOjo, 1, px, py, a.lidI);
      pintarOjo('d', a, escOjo, -1, px, py, a.lidD);
      set(P['ceja-i'], 'translate(' + f(99 + g * 3) + ' ' + f(66 + a.cejaY) + ') rotate(' + f(a.cejaAng) + ') scale(' + f(escI) + ' 1)');
      set(P['ceja-d'], 'translate(' + f(141 - g * 3) + ' ' + f(66 + a.cejaY) + ') rotate(' + f(-a.cejaAng) + ') scale(' + f(escD) + ' 1)');
      opa(P['ceja-i'], a.cejaOp); opa(P['ceja-d'], a.cejaOp);
      opa(P.rubor, a.rubor);
      var fb = formaBoca(t, ABIERTAS);
      for (var b in bocas) mostrarEl(bocas[b], b === fb[0]);
      set(P.boca, 'translate(' + f(120 + g * 2) + ' 104) scale(1 ' + f(fb[1]) + ')');
      opa(P.lentes, a.lentes * 1.4);
      set(P.lentes, 'translate(' + f(g * 13) + ' ' + f(-46 * (1 - Math.min(1, a.lentes))) + ')');
      pintarBrazo('i', SL, a.a1I, a.a2I, a.hI, disc.mI, torsoY);
      pintarBrazo('d', SR, a.a1D, a.a2D, a.hD, disc.mD, torsoY);
    }

    function pintarPerfil(a, t, torsoY, dCola) {
      dAttr(P['pcola-borde'], dCola); dAttr(P['pcola-piel'], dCola); dAttr(P['pcola-punta'], dCola);
      set(P.ptorso, 'translate(0 202) scale(1 ' + f(a.torsoS) + ') translate(0 -202)');
      set(P.pmochila, 'translate(0 ' + f(torsoY * 0.5) + ')');
      set(P['ppierna-n'], 'rotate(' + f(a.piernaD) + ' 124 200)');
      set(P['ppierna-q'], 'rotate(' + f(a.piernaI) + ' 110 200)');
      // "No" con la cabeza de perfil: el giro de los gestos se vuelve inclinación
      var dir = a.vista < 0 ? -1 : 1, adelante = lim(cur.headX * dir * 2 + 1, 0, 1);
      var rot = a.rot + (a.giro - cur.giro) * 14 + lim(cur.headY, -1, 0.6) * 7 * a.w * adelante;
      set(P.pcabeza, 'translate(0 ' + f(a.cy + torsoY) + ') rotate(' + f(rot) + ' 124 132)');
      set(P['poreja-n'], 'rotate(' + f(-a.orejaD) + ' 130 48)');
      set(P['poreja-q'], 'rotate(' + f(-a.orejaI * 0.7) + ' 94 58)');
      set(P['ojo-p'], 'translate(162 76) scale(0.78 0.95)');
      var escOjo = calm ? 1 : 0.75 + 0.25 * suave(Math.min(1, (t - saltoOjos) / 160));
      var base = cur.pupX * 0.5, mira = lim(cur.lookX * dir, -0.3, 1) * 0.65;
      pintarOjo('p', a, escOjo, 1, 0.45 + (a.pupX - cur.pupX) * 0.5 + base + (mira - base) * a.w, a.pupY + (cur.lookY - cur.pupY) * a.w, 0);
      set(P['ceja-p'], 'translate(162 ' + f(56 + a.cejaY) + ') rotate(' + f(a.cejaAng) + ')');
      opa(P['ceja-p'], a.cejaOp);
      opa(P.prubor, a.rubor);
      var fb = formaBoca(t, ABIERTAS), fp = BOCA_PERFIL[fb[0]] || 'sonrisa';
      for (var b in bocasP) mostrarEl(bocasP[b], b === fp);
      set(P.pboca, 'translate(191 100) scale(1 ' + f(fb[1]) + ')');
      opa(P.plentes, a.lentes * 1.4);
      set(P.plentes, 'translate(0 ' + f(-40 * (1 - Math.min(1, a.lentes))) + ')');
      // Brazos de perfil: los gestos que mueven los brazos de frente se traspasan (el derecho al cercano, el izquierdo al lejano)
      pintarBrazo('pq', SPQ, a.a1Q + (a.a1I - cur.a1I), a.a2Q + (a.a2I - cur.a2I), a.hQ, disc.mQ, torsoY);
      pintarBrazo('pn', SPN, a.a1P + (a.a1D - cur.a1D), a.a2P + (a.a2D - cur.a2D), a.hP + (a.hD - cur.hD), disc.mP, torsoY);
    }

    // Arranque
    ahora = performance.now();
    pose('feliz');
    NUM.forEach(function (k) { cur[k] = obj[k]; });
    pintar(ahora);
    if (!calm) arrancar();
    if (calmMQ.addEventListener) calmMQ.addEventListener('change', function (e) { calm = e.matches || !!op.quieto; if (!calm) arrancar(); });

    function envolverArranque(fn) { return function () { var r = fn.apply(null, arguments); arrancar(); return r; }; }
    return {
      el: svg,
      pose: envolverArranque(pose),
      gesto: envolverArranque(gesto),
      mirar: envolverArranque(mirar),
      hablar: envolverArranque(hablar),
      seguir: seguir,
      foco: foco,
      oreja: envolverArranque(oreja),
      poses: function () { return Object.keys(POSES); },
      actual: function () { return poseNombre; },
      // Para la lámina de revisión: salta los resortes y dibuja la pose final al tiro
      fijar: function (nombre) { pose(nombre); obj.vista = vistaMeta; NUM.forEach(function (k) { cur[k] = obj[k]; vel[k] = 0; }); pintar(reloj()); },
    };
  }

  window.MascotaRig = { crear: crear, poses: Object.keys(POSES) };
})();
