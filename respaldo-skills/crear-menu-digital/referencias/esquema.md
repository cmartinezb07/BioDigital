# Esquema de menu.json

```jsonc
{
  "url": "https://minegocio.cl",            // dirección pública FINAL (canonical, sitemap, imagen de redes). Sin barra al final
  "demo": false,                            // true = demostración: pone noindex, no genera datos estructurados ni sitemap
  "negocio": {
    "nombre": "Fogón del Sur",              // obligatorio
    "lema": "Cocina a las brasas…",         // opcional
    "descripcion": "Texto corto para Google y redes",   // opcional; si falta se usa el lema
    "logo": "logo.png",                      // opcional; ruta dentro de la carpeta
    "direccion": "…", "comuna": "Concepción",           // opcionales
    "horario": ["Lunes a sábado 12:30 a 16:00"],        // líneas que se ven en la portada
    "horario_estructurado": [{ "dias": ["Monday", "Tuesday"], "abre": "12:30", "cierra": "16:00" }],   // opcional: para Google (días en inglés)
    "cocina": "Parrilla chilena",           // opcional (schema servesCuisine)
    "rango_precios": "$$",                  // opcional (schema priceRange)
    "tipo_schema": "Restaurant",            // Restaurant | CafeOrCoffeeShop | BarOrPub | Bakery | FastFoodRestaurant
    "whatsapp": "569XXXXXXXX",              // solo dígitos
    "correo": "contacto@…",                 // opcional; aparece en privacidad
    "instagram": "usuario",                 // opcional
    "og": "og.jpg",                         // imagen para redes 1200×630 (python foto-a-modelo.py og …)
    "pedidos_whatsapp": false               // true = botón flotante "Pedir por WhatsApp"
  },
  "tema": {
    "estilo": "cafe",                       // cafe | crema | nocturno | bistro | jardin  (ver esteticas-menu.md)
    // "auto": { "claro": "crema", "oscuro": "cafe" },   // alternativa: sigue al sistema y deja un botón para cambiar
    "c1": "#cf9b4a", "c2": "#e9c98f",        // opcionales: color de filetes/botones y de precios (contraste ≥ 4,5:1)
    "fuente": "Playfair Display",            // títulos: Playfair Display, Cormorant Garamond, Fraunces, DM Serif Display, Lora
    "fuente_cuerpo": "DM Sans"               // textos: DM Sans, Inter, Geist, Lora
  },
  "analitica": { "cloudflare": "token-de-32-caracteres" },   // opcional: Cloudflare Web Analytics (sin cookies)
  "aviso": "texto opcional arriba (se usa en demostraciones)",
  "creditos": true,                          // "Menú digital hecho por Bío Digital" al pie
  "categorias": [
    {
      "id": "entradas",                      // minúsculas, números y guion; único
      "nombre": "Entradas",
      "descripcion": "Para abrir la mesa",  // opcional
      // sugeridas: Entradas, Ensaladas, Platos de fondo, Postres, Bebestibles (y Cócteles, Cafetería…)
      "platos": [
        {
          "id": "empanadas",                 // único en todo el menú; es el nombre del archivo .glb
          "nombre": "Empanadas de horno",
          "descripcion": "Tres empanadas de masa dorada…",
          "precio": 5900,                    // entero en CLP
          "foto": "fotos/empanadas.webp",    // opcional; cuadrada 800×800, ≤ 120 KB. Sin foto = línea de carta
          "modelo": "modelos/empanadas.glb", // opcional; ≤ 5 MB, tamaño real en metros
          "alt": "texto alternativo opcional",
          "etiquetas": ["vegetariano", "sin-gluten", "vegano", "picante", "nuevo", "favorito"],   // solo las confirmadas por el cliente
          "agotado": false                   // true = "Agotado hoy", precio tachado y sin botón 3D
        }
      ]
    }
  ]
}
```

El generador (`node generar-menu.mjs`) valida todo esto y lista lo que haya que corregir: ids repetidos, fotos o modelos que faltan o pesan de más, texto de relleno o `[PENDIENTE]` en un plato, colores sin contraste, falta de `url` u `og.jpg`. No acepta fuentes, estilos ni etiquetas fuera de las listas.

## Archivos que genera
`index.html`, `404.html`, `privacidad.html`, `robots.txt`, `sitemap.xml` (si hay `url` y no es demo), `llms.txt`, `favicon.svg`, `manifest.webmanifest`, `_headers`. Con `--opciones`: `opciones.html` y `opcion-<estilo>.html`.

## Cómo se ve
- Portada con nombre, lema, horarios, botones "Compartir carta" y "Escribir por WhatsApp"; barra fija con categorías y buscador.
- "Favoritos de la casa": se arma sola con los platos con etiqueta `favorito` y foto.
- Cada categoría es una carta con puntos guía entre el nombre y el precio. Los platos con foto muestran una miniatura redonda; los que tienen 3D, un botón "Ver en tu mesa".
- Los platos aparecen suavemente al hacer scroll (se desactiva con movimiento reducido).
