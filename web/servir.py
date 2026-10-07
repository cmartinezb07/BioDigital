# Servidor local de las maquetas sin caché: el navegador siempre pide la versión más nueva de cada archivo
# (con "python -m http.server" el navegador a veces mostraba copias viejas del gato y de los scripts).
# Uso: python web/servir.py [puerto] [carpeta]   (por defecto 4321 y web/propuesta)
# Escucha solo en este computador (127.0.0.1 y ::1, así "localhost" responde por las dos vías).
import functools
import http.server
import os
import socket
import sys
import threading

puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
carpeta = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'propuesta')


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    # Si la consola que lo lanzó se cierra, escribir el registro fallaba y cortaba todas las conexiones
    def log_message(self, formato, *args):
        try:
            super().log_message(formato, *args)
        except (OSError, ValueError):
            pass


class Servidor(http.server.ThreadingHTTPServer):
    # Cola amplia: con la de 5 por defecto, Windows rechazaba conexiones cuando el navegador pedía muchos archivos a la vez
    request_queue_size = 128
    daemon_threads = True


class Servidor6(Servidor):
    address_family = socket.AF_INET6


manejador = functools.partial(SinCache, directory=carpeta)
try:
    s6 = Servidor6(('::1', puerto), manejador)
    threading.Thread(target=s6.serve_forever, daemon=True).start()
except OSError:
    pass
Servidor(('127.0.0.1', puerto), manejador).serve_forever()
