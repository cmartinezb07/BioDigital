# Recorta las reacciones de la hoja 2 (4 animales x 12 reacciones) en PNG transparentes con relleno blanco.
# Uso: python recortar.py   (desde esta carpeta). Deja ../<animal>/<reaccion>.webp y control.png para revisar.
# hoja-2.webp es la hoja de reacciones del equipo (extraída del chat del 17-sep-2026).
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

AQUI = os.path.dirname(os.path.abspath(__file__))
HOJA = os.path.join(AQUI, 'hoja-2.webp')
SALIDA = os.path.dirname(AQUI)

# Límites de las celdas en la hoja (px). El lagarto (x 340–650) se descarta.
COLUMNAS = {'gato': (0, 172, 335), 'panda': (648, 792, 955), 'conejo': (955, 1086, 1258), 'pinguino': (1258, 1392, 1536)}
FILAS = [38, 228, 396, 562, 725, 871, 1024]
REACCIONES = [
    ('feliz', 'negacion'), ('triste', 'enojado'), ('sorprendido', 'soberbio'),
    ('pensativo', 'afirmando'), ('miedo', 'guino'), ('cansado', 'muyfeliz'),
]
ESCALA = 3

gris_total = np.asarray(Image.open(HOJA).convert('L')).astype(np.float32)
control = Image.open(HOJA).convert('RGB')
dib = ImageDraw.Draw(control)

for animal, (xa, xm, xb) in COLUMNAS.items():
    os.makedirs(os.path.join(SALIDA, animal), exist_ok=True)
    for r in range(6):
        for c, (x0, x1) in enumerate(((xa, xm), (xm, xb))):
            y0, y1 = FILAS[r], FILAS[r + 1]
            gris = gris_total[y0:y1, x0:x1]
            tinta = gris < 150
            lab, n = ndimage.label(ndimage.binary_dilation(tinta, iterations=1))
            if n == 0:
                continue
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
                    continue  # subrayado de los títulos
                # Partes del cuerpo: altas y dentro de la figura (las letras de los rótulos miden ~15 px)
                grande = areas[k - 1] >= 300 and kh >= 26 and izq - 10 <= cx <= der + 10 and top < cy < bot
                # Chispas y signos junto a la cabeza (los rótulos de la fila de arriba quedan sobre la cabeza)
                chispa = top + 4 < cy < top + 0.62 * alto and izq - 45 <= cx <= der + 45 and kh < 40
                if grande or chispa:
                    mascara |= lab == k
            # Letras de rótulos pegadas a los pies: piezas chicas sueltas (sin dilatar) al nivel del suelo
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
            # Silueta rellena: cierra huecos del contorno y rellena el interior (se ve bien sobre fondo oscuro)
            sil = ndimage.binary_dilation(m, iterations=5)
            sil = ndimage.binary_fill_holes(sil)
            sil = ndimage.binary_erosion(sil, iterations=4) | m
            # Tinta negra, papel blanco
            tono = np.clip((g - 45) * 255 / (215 - 45), 0, 255)
            tono = np.where(sil, tono, 255).astype(np.uint8)
            alfa = np.where(sil, 255, 0).astype(np.uint8)
            L = Image.fromarray(tono).resize(((X1 - X0) * ESCALA, (Y1 - Y0) * ESCALA), Image.LANCZOS)
            A = Image.fromarray(alfa).resize(L.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5)).point(lambda v: 255 if v > 110 else 0)
            # Tinta más nítida: curva de contraste suave
            L = L.filter(ImageFilter.GaussianBlur(.6)).point(lambda v: 0 if v < 70 else (255 if v > 190 else int((v - 70) * 255 / 120)))
            final = Image.merge('RGBA', (L, L, L, A))
            final.thumbnail((360, 600), Image.LANCZOS)
            final.save(os.path.join(SALIDA, animal, f'{REACCIONES[r][c]}.webp'), 'WEBP', quality=88, method=6)
            dib.rectangle([x0 + X0, y0 + Y0, x0 + X1, y0 + Y1], outline=(230, 30, 30), width=2)
            dib.text((x0 + X0 + 2, y0 + Y0 + 2), REACCIONES[r][c], fill=(230, 30, 30))

control.save(os.path.join(AQUI, 'control.png'))
print('listo')
