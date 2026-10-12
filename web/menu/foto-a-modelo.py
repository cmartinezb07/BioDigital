"""Prepara las fotos de los platos para el menú digital (necesita Pillow: pip install pillow).

  Foto de la tarjeta (cuadrada, liviana):
    python foto-a-modelo.py tarjeta foto.jpg fotos/plato.webp --caja X Y LADO
      Recorta un cuadrado de LADO px con la esquina superior izquierda en (X, Y) y lo deja de 800 x 800.

  Imagen para compartir en redes (1200 x 630, JPG):
    python foto-a-modelo.py og og.jpg --nombre "Fogón del Sur" --lema "Cocina a las brasas" --fondo "#1a110c" --texto "#f4e8d7" --acento "#cf9b4a" [--foto fotos/plato.webp]

  "Plato sobre la mesa" a partir de UNA foto tomada desde arriba (modelo provisorio, plano):
    python foto-a-modelo.py disco foto.jpg modelos/plato.glb --centro CX CY --radio R --diametro-cm 26
      Convierte el círculo de la foto (centro CX, CY y radio R en px) en un disco de 26 cm con la foto de textura.
      En realidad aumentada se ve realista desde arriba, pero es PLANO: de lado se nota. Sirve para probar y
      como solución mínima. Para un efecto 3D de verdad hay que escanear el plato (ver referencias/captura-3d.md).
"""
import argparse
import io
import json
import math
import struct
import sys

from PIL import Image


def abrir(ruta):
    return Image.open(ruta).convert('RGB')


def tarjeta(a):
    im = abrir(a.entrada)
    x, y, l = a.caja
    if x < 0 or y < 0 or x + l > im.width or y + l > im.height:
        sys.exit(f'La caja se sale de la foto ({im.width} x {im.height}).')
    im.crop((x, y, x + l, y + l)).resize((800, 800), Image.LANCZOS).save(a.salida, quality=80, method=6)
    print(f'{a.salida} listo')


def disco(a):
    im = abrir(a.entrada)
    cx, cy = a.centro
    r = a.radio
    if cx - r < 0 or cy - r < 0 or cx + r > im.width or cy + r > im.height:
        sys.exit(f'El círculo se sale de la foto ({im.width} x {im.height}).')
    lado = min(1024, int(r * 2))
    tex = im.crop((cx - r, cy - r, cx + r, cy + r)).resize((lado, lado), Image.LANCZOS)
    buf = io.BytesIO()
    tex.save(buf, 'JPEG', quality=85)
    jpg = buf.getvalue()

    R = a.diametro_cm / 200.0          # radio real en metros
    N = 96
    HB = 0.022                          # alto total del plato: 2,2 cm
    PIE = 0.72                          # el pie es más angosto que el borde
    # perfil del plato (fracción del radio, altura): centro levemente hundido y borde levantado
    perfil = [(0.0, 0.0105), (0.30, 0.0105), (0.55, 0.0120), (0.72, 0.0145), (0.84, 0.0185), (0.93, 0.0215), (1.0, HB)]
    pos, nor, uv, idx = [], [], [], []
    for k, (f, h) in enumerate(perfil):
        k1, k0 = min(k + 1, len(perfil) - 1), max(k - 1, 0)
        pend = (perfil[k1][1] - perfil[k0][1]) / max((perfil[k1][0] - perfil[k0][0]) * R, 1e-6)
        for jx in range(N + 1):
            t = 2 * math.pi * jx / N
            c, sn = math.cos(t), math.sin(t)
            pos.append((R * f * c, h, -R * f * sn))
            nx, ny, nz = -pend * c, 1.0, pend * sn
            m = math.sqrt(nx * nx + ny * ny + nz * nz); nor.append((nx / m, ny / m, nz / m))
            uv.append((0.5 + 0.5 * f * c, 0.5 - 0.5 * f * sn))
    ring = N + 1
    for k in range(len(perfil) - 1):
        for jx in range(N):
            a0, b0, c0, d0 = k * ring + jx, k * ring + jx + 1, (k + 1) * ring + jx, (k + 1) * ring + jx + 1
            idx += [a0, c0, d0, a0, d0, b0]
    # pared exterior inclinada y base lisa (material sin foto)
    pos2, nor2, idx2 = [], [], []
    dr, dy = R * (1 - PIE), HB
    ln = math.sqrt(dr * dr + dy * dy)
    for jx in range(N + 1):
        t = 2 * math.pi * jx / N
        c, sn = math.cos(t), -math.sin(t)
        pos2 += [(R * c, HB, R * sn), (R * PIE * c, 0, R * PIE * sn)]
        nor2 += [(c * dy / ln, -dr / ln, sn * dy / ln)] * 2
    for jx in range(N):
        a0, a1, b0, b1 = 2 * jx, 2 * jx + 1, 2 * jx + 2, 2 * jx + 3
        idx2 += [a0, a1, b0, a1, b1, b0]
    base = len(pos2)
    pos2 += [(0, 0, 0)]; nor2 += [(0, -1, 0)]
    for jx in range(N + 1):
        t = 2 * math.pi * jx / N
        pos2.append((R * PIE * math.cos(t), 0, -R * PIE * math.sin(t))); nor2.append((0, -1, 0))
    for jx in range(N):
        idx2 += [base, base + jx + 2, base + jx + 1]

    def f32(v): return b''.join(struct.pack('<3f', *p) for p in v)
    def u16(v): return struct.pack(f'<{len(v)}H', *v)
    partes = []  # (bytes, target)
    def add(b, tgt=None):
        while sum(len(x[0]) for x in partes) % 4: partes.append((b'\x00', None))
        partes.append((b, tgt)); return len(partes) - 1
    views = []
    def vista(b, tgt=None):
        off = sum(len(x[0]) for x in partes)
        while off % 4:
            partes.append((b'\x00', None)); off += 1
        partes.append((b, tgt))
        d = {'buffer': 0, 'byteOffset': off, 'byteLength': len(b)}
        if tgt: d['target'] = tgt
        views.append(d); return len(views) - 1
    v_pos = vista(f32(pos), 34962); v_nor = vista(f32(nor), 34962)
    v_uv = vista(b''.join(struct.pack('<2f', *p) for p in uv), 34962); v_idx = vista(u16(idx), 34963)
    v_pos2 = vista(f32(pos2), 34962); v_nor2 = vista(f32(nor2), 34962); v_idx2 = vista(u16(idx2), 34963)
    v_img = vista(jpg)
    def lim(v):
        return [min(p[k] for p in v) for k in range(3)], [max(p[k] for p in v) for k in range(3)]
    acc = []
    def accesor(vw, comp, cnt, tipo, mn=None, mx=None):
        d = {'bufferView': vw, 'componentType': comp, 'count': cnt, 'type': tipo}
        if mn is not None: d['min'], d['max'] = mn, mx
        acc.append(d); return len(acc) - 1
    mn, mx = lim(pos); mn2, mx2 = lim(pos2)
    a_pos = accesor(v_pos, 5126, len(pos), 'VEC3', mn, mx); a_nor = accesor(v_nor, 5126, len(nor), 'VEC3')
    a_uv = accesor(v_uv, 5126, len(uv), 'VEC2'); a_idx = accesor(v_idx, 5123, len(idx), 'SCALAR')
    a_pos2 = accesor(v_pos2, 5126, len(pos2), 'VEC3', mn2, mx2); a_nor2 = accesor(v_nor2, 5126, len(nor2), 'VEC3')
    a_idx2 = accesor(v_idx2, 5123, len(idx2), 'SCALAR')
    blob = b''.join(x[0] for x in partes)
    while len(blob) % 4: blob += b'\x00'
    gltf = {
        'asset': {'version': '2.0', 'generator': 'Bío Digital foto-a-modelo'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': 'plato'}],
        'meshes': [{'primitives': [
            {'attributes': {'POSITION': a_pos, 'NORMAL': a_nor, 'TEXCOORD_0': a_uv}, 'indices': a_idx, 'material': 0},
            {'attributes': {'POSITION': a_pos2, 'NORMAL': a_nor2}, 'indices': a_idx2, 'material': 1}]}],
        'materials': [{'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 0.85}},
                      {'pbrMetallicRoughness': {'baseColorFactor': [0.93, 0.92, 0.9, 1], 'metallicFactor': 0, 'roughnessFactor': 0.6}}],
        'textures': [{'source': 0, 'sampler': 0}], 'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}],
        'images': [{'bufferView': v_img, 'mimeType': 'image/jpeg'}],
        'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': len(blob)}],
    }
    js = json.dumps(gltf, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(a.salida, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(js), b'JSON')); f.write(js)
        f.write(struct.pack('<I4s', len(blob), b'BIN\x00')); f.write(blob)
    print(f'{a.salida} listo ({total / 1024:.0f} KB, disco de {a.diametro_cm:g} cm)')


def og(a):
    from PIL import ImageDraw, ImageFont
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), a.fondo)
    d = ImageDraw.Draw(im)
    def fuente(nombres, tam):
        for n in nombres:
            for base in ('C:/Windows/Fonts/', '/Library/Fonts/', '/System/Library/Fonts/Supplemental/', '/usr/share/fonts/truetype/dejavu/', ''):
                try: return ImageFont.truetype(base + n, tam)
                except OSError: pass
        return ImageFont.load_default()
    serif = ['georgiab.ttf', 'Georgia Bold.ttf', 'DejaVuSerif-Bold.ttf']
    serifi = ['georgiai.ttf', 'Georgia Italic.ttf', 'DejaVuSerif-Italic.ttf']
    x0 = 80
    if a.foto:
        f = abrir(a.foto); l = min(f.size); f = f.crop(((f.width - l) // 2, (f.height - l) // 2, (f.width + l) // 2, (f.height + l) // 2)).resize((380, 380), Image.LANCZOS)
        m = Image.new('L', (380, 380), 0); ImageDraw.Draw(m).ellipse((0, 0, 379, 379), fill=255)
        cx, cy = 920, 315
        d.ellipse((cx - 200, cy - 200, cx + 200, cy + 200), outline=a.acento, width=4)
        im.paste(f, (cx - 190, cy - 190), m)
    d.text((x0, 150), 'CARTA', font=fuente(['arialbd.ttf', 'Arial Bold.ttf', 'DejaVuSans-Bold.ttf'], 26), fill=a.acento)
    tam = 96
    fn = fuente(serif, tam)
    while d.textlength(a.nombre, font=fn) > (540 if a.foto else 1040) and tam > 40:
        tam -= 4; fn = fuente(serif, tam)
    d.text((x0, 200), a.nombre, font=fn, fill=a.texto)
    d.line((x0, 200 + tam + 40, x0 + 140, 200 + tam + 40), fill=a.acento, width=3)
    if a.lema:
        fl = fuente(serifi, 34); linea, y = '', 200 + tam + 70
        for palabra in a.lema.split():
            prueba = (linea + ' ' + palabra).strip()
            if d.textlength(prueba, font=fl) > (540 if a.foto else 1040) and linea:
                d.text((x0, y), linea, font=fl, fill=a.texto); y += 46; linea = palabra
            else: linea = prueba
        if linea: d.text((x0, y), linea, font=fl, fill=a.texto)
    im.save(a.salida, quality=88)
    print(f'{a.salida} listo (1200 x 630)')


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
s = p.add_subparsers(dest='modo', required=True)
t = s.add_parser('tarjeta'); t.add_argument('entrada'); t.add_argument('salida'); t.add_argument('--caja', type=int, nargs=3, required=True, metavar=('X', 'Y', 'LADO'))
d = s.add_parser('disco'); d.add_argument('entrada'); d.add_argument('salida')
d.add_argument('--centro', type=int, nargs=2, required=True, metavar=('CX', 'CY')); d.add_argument('--radio', type=int, required=True)
d.add_argument('--diametro-cm', type=float, required=True)
o = s.add_parser('og'); o.add_argument('salida'); o.add_argument('--nombre', required=True); o.add_argument('--lema', default='')
o.add_argument('--fondo', default='#1a110c'); o.add_argument('--texto', default='#f4e8d7'); o.add_argument('--acento', default='#cf9b4a'); o.add_argument('--foto')
a = p.parse_args()
{'tarjeta': tarjeta, 'disco': disco, 'og': og}[a.modo](a)
