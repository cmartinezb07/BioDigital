# Recorta una hoja de personajes (grilla de poses o cuadros de animación) en imágenes transparentes listas para la web.
# Requiere: pip install pillow numpy scipy
#
# Uso:  python recortar-hoja.py recorte.json
#
# recorte.json (ver recorte.ejemplo.json):
#   hoja        imagen de entrada (png/jpg/webp), fondo claro y personajes con contorno oscuro
#   salida      carpeta donde quedan <personaje>/<reaccion>.<formato>
#   filas       límites verticales en px [y0, y1, …, yN]   (o "auto": N para partir en partes iguales)
#   personajes  { "nombre": [x0, x1, …] }  límites horizontales de sus columnas (o { "nombre": {"desde": x0, "hasta": x1, "columnas": 2} })
#   reacciones  [[fila 1: col 1, col 2…], [fila 2…], …]  nombre de archivo de cada celda ("" = saltar)
#   opcional: formato (webp|png), alto_max (px, 600), escala (3), umbral_tinta (150), contorno_blanco (true)
#
# Genera también control.png (cajas sobre la hoja) y lamina.png (todos los recortes sobre gris) para revisar.
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage


def cargar(ruta):
    with open(ruta, encoding='utf-8') as f:
        cfg = json.load(f)
    base = os.path.dirname(os.path.abspath(ruta))
    cfg['hoja'] = os.path.join(base, cfg['hoja'])
    cfg['salida'] = os.path.join(base, cfg.get('salida', 'recortes'))
    return cfg


def limites(valor, total):
    if isinstance(valor, dict) and 'auto' in valor:
        n = valor['auto']
        return [round(i * total / n) for i in range(n + 1)]
    if isinstance(valor, int):
        return [round(i * total / valor) for i in range(valor + 1)]
    return valor


def recortar_celda(gris, umbral, escala, contorno_blanco):
    """Devuelve una imagen RGBA con solo el personaje principal de la celda (sin rótulos de texto)."""
    tinta = gris < umbral
    lab, n = ndimage.label(ndimage.binary_dilation(tinta, iterations=1))
    if n == 0:
        return None
    areas = ndimage.sum(np.ones_like(lab), lab, index=range(1, n + 1))
    principal = int(np.argmax(areas)) + 1
    ys, xs = np.where(lab == principal)
    top, bot, izq, der = ys.min(), ys.max(), xs.min(), xs.max()
    alto = bot - top
    mascara = lab == principal
    for k in range(1, n + 1):
        if k == principal:
            continue
        ky, kx = np.where(lab == k)
        cy, cx = ky.mean(), kx.mean()
        kh, kw = ky.max() - ky.min(), kx.max() - kx.min()
        if kw > 50 and kh < 10:
            continue  # líneas de subrayado de títulos
        # Partes del cuerpo sueltas: altas y dentro de la figura (las letras de rótulos son bajas)
        grande = areas[k - 1] >= 300 and kh >= 26 and izq - 10 <= cx <= der + 10 and top < cy < bot
        # Chispas, signos y gotas junto a la cabeza
        chispa = top + 4 < cy < top + 0.62 * alto and izq - 45 <= cx <= der + 45 and kh < 40
        if grande or chispa:
            mascara |= lab == k
    # Letras de rótulos pegadas a los pies
    crudo, nc = ndimage.label(tinta & mascara)
    for k in range(1, nc + 1):
        ky, kx = np.where(crudo == k)
        if ky.max() - ky.min() < 20 and len(ky) < 160 and ky.mean() > bot - 34 and (kx.mean() > der - 70 or kx.mean() < izq + 20):
            vecinos = ndimage.binary_dilation(crudo == k, iterations=3) & tinta & ~(crudo == k)
            if vecinos.sum() < 25:
                mascara &= ~ndimage.binary_dilation(crudo == k, iterations=1)
    ys, xs = np.where(mascara)
    Y0, Y1 = max(0, ys.min() - 3), min(gris.shape[0], ys.max() + 4)
    X0, X1 = max(0, xs.min() - 3), min(gris.shape[1], xs.max() + 4)
    m = mascara[Y0:Y1, X0:X1]
    g = gris[Y0:Y1, X0:X1]
    # Silueta rellena: el interior queda blanco y opaco (se ve bien sobre fondos oscuros)
    sil = ndimage.binary_fill_holes(ndimage.binary_dilation(m, iterations=5))
    sil = (ndimage.binary_erosion(sil, iterations=4) if contorno_blanco else ndimage.binary_erosion(sil, iterations=5)) | m
    tono = np.clip((g - 45) * 255 / (215 - 45), 0, 255)
    tono = np.where(sil, tono, 255).astype(np.uint8)
    alfa = np.where(sil, 255, 0).astype(np.uint8)
    tam = ((X1 - X0) * escala, (Y1 - Y0) * escala)
    L = Image.fromarray(tono).resize(tam, Image.LANCZOS)
    A = Image.fromarray(alfa).resize(tam, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5)).point(lambda v: 255 if v > 110 else 0)
    L = L.filter(ImageFilter.GaussianBlur(.6)).point(lambda v: 0 if v < 70 else (255 if v > 190 else int((v - 70) * 255 / 120)))
    return Image.merge('RGBA', (L, L, L, A)), (X0, Y0, X1, Y1)


def main():
    if len(sys.argv) < 2:
        print('Uso: python recortar-hoja.py recorte.json')
        sys.exit(1)
    cfg = cargar(sys.argv[1])
    hoja = Image.open(cfg['hoja'])
    gris_total = np.asarray(hoja.convert('L')).astype(np.float32)
    H, W = gris_total.shape
    filas = limites(cfg['filas'], H)
    formato = cfg.get('formato', 'webp')
    alto_max = cfg.get('alto_max', 600)
    escala = cfg.get('escala', 3)
    umbral = cfg.get('umbral_tinta', 150)
    contorno = cfg.get('contorno_blanco', True)
    control = hoja.convert('RGB')
    dib = ImageDraw.Draw(control)
    hechos = []
    for nombre, cols in cfg['personajes'].items():
        if isinstance(cols, dict):
            x0, x1, n = cols['desde'], cols['hasta'], cols['columnas']
            cols = [round(x0 + i * (x1 - x0) / n) for i in range(n + 1)]
        os.makedirs(os.path.join(cfg['salida'], nombre), exist_ok=True)
        for r, fila in enumerate(cfg['reacciones']):
            for c, reaccion in enumerate(fila):
                if not reaccion or c + 1 >= len(cols) or r + 1 >= len(filas):
                    continue
                xa, xb, ya, yb = cols[c], cols[c + 1], filas[r], filas[r + 1]
                res = recortar_celda(gris_total[ya:yb, xa:xb], umbral, escala, contorno)
                if not res:
                    print(f'  vacío: {nombre}/{reaccion}')
                    continue
                img, (X0, Y0, X1, Y1) = res
                img.thumbnail((alto_max, alto_max), Image.LANCZOS)
                destino = os.path.join(cfg['salida'], nombre, f'{reaccion}.{formato}')
                if formato == 'webp':
                    img.save(destino, 'WEBP', quality=88, method=6)
                else:
                    img.save(destino, optimize=True)
                hechos.append((nombre, reaccion, destino))
                dib.rectangle([xa + X0, ya + Y0, xa + X1, ya + Y1], outline=(230, 30, 30), width=2)
                dib.text((xa + X0 + 2, ya + Y0 + 2), f'{nombre}/{reaccion}', fill=(230, 30, 30))
    control.save(os.path.join(cfg['salida'], 'control.png'))
    # Lámina para revisar: recortes sobre gris, con su nombre
    if hechos:
        cw, ch, por_fila = 170, 240, 8
        filas_l = (len(hechos) + por_fila - 1) // por_fila
        lam = Image.new('RGB', (cw * por_fila, ch * filas_l), (110, 110, 120))
        d = ImageDraw.Draw(lam)
        for i, (nombre, reaccion, ruta) in enumerate(hechos):
            im = Image.open(ruta)
            im.thumbnail((cw - 10, ch - 30))
            x, y = (i % por_fila) * cw, (i // por_fila) * ch
            lam.paste(im, (x + 5, y + 22), im)
            d.text((x + 5, y + 4), f'{nombre}/{reaccion}', fill=(255, 255, 0))
        lam.save(os.path.join(cfg['salida'], 'lamina.png'))
    print(f'{len(hechos)} recortes en {cfg["salida"]} · revisa control.png y lamina.png')


if __name__ == '__main__':
    main()
