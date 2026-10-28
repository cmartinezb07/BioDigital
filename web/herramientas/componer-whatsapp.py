"""Arma imágenes para WhatsApp (una por pantalla) a partir de las capturas en bruto de capturar-whatsapp.mjs.
Uso:  python -I web/herramientas/componer-whatsapp.py <carpeta-con-bruto/>   (deja los JPG en la carpeta de arriba)
Celular: 1080x1920, marco de teléfono. Escritorio: 1080x1350, marco de ventana. Títulos y textos: solo lo que muestra la captura."""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BRUTO = os.path.abspath(sys.argv[1])
SALIDA = os.path.dirname(BRUTO)
F = 'C:/Windows/Fonts/'
def fuente(nombre, tam): return ImageFont.truetype(F + nombre, tam)
TIT, TXT, TXTB = 'georgiab.ttf', 'segoeui.ttf', 'seguisb.ttf'
BG, AZUL, TEXTO, TENUE = (11, 11, 13), (13, 165, 255), (245, 243, 241), (170, 166, 170)

def fondo(w, h):
    im = Image.new('RGB', (w, h), BG)
    glow = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(glow); d.ellipse((-200, -300, w + 200, 520), fill=(10, 60, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    return Image.blend(im, glow, 0.85)

def envolver(d, texto, fnt, ancho):
    lineas, actual = [], ''
    for p in texto.split(' '):
        prueba = (actual + ' ' + p).strip()
        if d.textlength(prueba, font=fnt) <= ancho: actual = prueba
        else: lineas.append(actual); actual = p
    if actual: lineas.append(actual)
    return lineas

def redondear(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0) + im.size, r, fill=255)
    out = im.convert('RGBA'); out.putalpha(m); return out

def cabecera(img, d, etiqueta, titulo, y=80):
    W = img.width
    if etiqueta:
        f = fuente(TXTB, 34); w = d.textlength(etiqueta, font=f) + 48
        d.rounded_rectangle((60, y, 60 + w, y + 58), 29, fill=AZUL); d.text((84, y + 8), etiqueta, font=f, fill=(5, 20, 32))
        y += 100
    f = fuente(TIT, 68)
    for l in envolver(d, titulo, f, W - 120):
        d.text((60, y), l, font=f, fill=TEXTO); y += 82
    return y

def pie(img, d, texto, y):
    f = fuente(TXT, 38)
    for l in envolver(d, texto, f, img.width - 120):
        d.text((60, y), l, font=f, fill=(215, 212, 215)); y += 54
    return y

def firma(img, d):
    f = fuente(TXTB, 30); d.text((60, img.height - 70), 'Bío Digital', font=f, fill=AZUL)
    g = fuente(TXT, 28); d.text((60 + d.textlength('Bío Digital  ', font=f), img.height - 68), 'biodigitales.cl · WhatsApp +56 9 4694 1640', font=g, fill=TENUE)

def celular(archivo, salida, etiqueta, titulo, texto, nota=None):
    img = fondo(1080, 1920); d = ImageDraw.Draw(img)
    y = cabecera(img, d, etiqueta, titulo)
    pant = Image.open(os.path.join(BRUTO, archivo)).convert('RGB')
    alto = 1180; ancho = int(alto * pant.width / pant.height)
    pant = redondear(pant.resize((ancho, alto), Image.LANCZOS), 46)
    marco = Image.new('RGBA', (ancho + 28, alto + 28), (0, 0, 0, 0)); ImageDraw.Draw(marco).rounded_rectangle((0, 0, ancho + 27, alto + 27), 62, fill=(34, 34, 40), outline=(70, 70, 80), width=3)
    marco.alpha_composite(pant, (14, 14))
    x = (img.width - marco.width) // 2; py = y + 20
    img.paste(marco, (x, py), marco)
    yy = pie(img, d, texto, py + marco.height + 34)
    if nota: d.text((60, yy + 6), nota, font=fuente(TXT, 28), fill=TENUE)
    firma(img, d); img.convert('RGB').save(os.path.join(SALIDA, salida), quality=90, optimize=True)

def ventana(archivo, salida, etiqueta, titulo, texto, nota=None):
    img = fondo(1080, 1350); d = ImageDraw.Draw(img)
    y = cabecera(img, d, etiqueta, titulo)
    pant = Image.open(os.path.join(BRUTO, archivo)).convert('RGB')
    ancho = 960; alto = int(ancho * pant.height / pant.width)
    pant = redondear(pant.resize((ancho, alto), Image.LANCZOS), 14)
    barra = 46; marco = Image.new('RGBA', (ancho + 20, alto + barra + 10), (0, 0, 0, 0)); md = ImageDraw.Draw(marco)
    md.rounded_rectangle((0, 0, marco.width - 1, marco.height - 1), 22, fill=(34, 34, 40), outline=(70, 70, 80), width=3)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]): md.ellipse((22 + i * 30, 15, 38 + i * 30, 31), fill=c)
    marco.alpha_composite(pant, (10, barra))
    x = (img.width - marco.width) // 2; py = y + 40
    img.paste(marco, (x, py), marco)
    yy = pie(img, d, texto, py + marco.height + 40)
    if nota: d.text((60, yy + 6), nota, font=fuente(TXT, 28), fill=TENUE)
    firma(img, d); img.convert('RGB').save(os.path.join(SALIDA, salida), quality=90, optimize=True)

def cierre(salida):
    img = fondo(1080, 1350); d = ImageDraw.Draw(img)
    y = cabecera(img, d, None, '¿Lo armamos para tu local?', y=200)
    y = pie(img, d, 'Te hacemos un diagnóstico gratis y te mostramos cómo se vería tu carta, con tus platos y tus colores.', y + 30)
    y += 40
    for t in ['WhatsApp: +56 9 4694 1640', 'Instagram: @biodigital.cl', 'biodigitales.cl']:
        f = fuente(TXTB, 46); d.rounded_rectangle((60, y, 1020, y + 96), 48, fill=(24, 24, 30), outline=(70, 70, 80), width=3); d.text((100, y + 22), t, font=f, fill=TEXTO); y += 124
    ft = fuente(TXT, 30)
    for l in envolver(d, 'Somos estudiantes de la Universidad de Concepción y trabajamos solo en el Gran Concepción.', ft, 960):
        d.text((60, y + 20), l, font=ft, fill=TENUE); y += 42
    firma(img, d); img.convert('RGB').save(os.path.join(SALIDA, salida), quality=90, optimize=True)

celular('m-carta.png', '01-menu-digital-portada.jpg', 'Menú digital con pedidos', 'Así funciona, paso a paso', 'Esta es la demo de Fogón del Sur: una carta que se ve perfecta en el celular y recibe pedidos.')
celular('m-carta-platos.png', '02-carta-en-el-celular.jpg', 'Paso 1', 'La carta en el celular del cliente', 'Fotos, precios, favoritos de la casa y buscador. Sin PDF, sin agrandar con los dedos.')
celular('m-carrito.png', '03-pedir.jpg', 'Paso 2', 'Pide en la mesa, para retirar o con delivery', 'El cliente elige sus platos y opciones, anota lo que quiera y envía. El pedido llega solo a la cocina.')
celular('m-seguimiento.png', '04-seguimiento-en-vivo.jpg', 'Paso 3', 'Sigue su pedido en vivo', 'Estados con color y tiempo estimado. En delivery ve al repartidor en el mapa, y tiene juegos para la espera.')
ventana('d-cocina.png', '05-cocina.jpg', 'Paso 4', 'La cocina lo recibe en una pantalla', 'Mesa, retiro y delivery en columnas, con reloj por pedido. Al marcar un paso, el cliente lo ve al instante.', 'Pedidos de ejemplo.')
ventana('d-panel-pedidos.png', '06-panel-pedidos.jpg', 'Paso 5', 'El dueño ve los pedidos en vivo', 'Pedidos activos, cobros y reparto desde un solo lugar. Cada persona entra con su código a lo que le toca.', 'Pedidos de ejemplo.')
ventana('d-panel-estadisticas.png', '07-panel-estadisticas.jpg', 'Paso 6', 'Y también sus números', 'Ventas, platos más pedidos, horas fuertes y opiniones de clientes con respuesta.', 'Datos de ejemplo, no son de un local real.')
ventana('d-casadulce.png', '08-pasteleria-sitio.jpg', 'Para pastelerías y tortas', 'Casa Dulce: así se vería tu local', 'Portada con tu producto, horarios, carta y botón para encargar. Ejemplo ficticio hecho por Bío Digital.')
celular('m-casadulce.png', '09-pasteleria-celular.jpg', 'Para pastelerías y tortas', 'Y en el celular se ve así', 'Pensado para quien te encuentra desde Instagram o Google con el celular en la mano.', 'Ejemplo ficticio.')
celular('m-casadulce-carta.png', '10-pasteleria-carta.jpg', 'Para pastelerías y tortas', 'Carta con tortas, pastelería y café', 'Con QR, buscador, fotos y precios. La cambiamos nosotros cuando cambian tus precios o tus tortas.', 'Ejemplo ficticio.')
cierre('11-contacto.jpg')
print('listo en', SALIDA)
