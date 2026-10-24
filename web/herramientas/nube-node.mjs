// Cliente de la nube para scripts de Node (pruebas y cargas): habla con las mismas funciones de la base que las pantallas.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const fuente = readFileSync(join(aqui, '../propuesta/ejemplos/_compartido/nube.js'), 'utf8');
const URL_API = /var URL_API = '([^']+)'/.exec(fuente)[1], LLAVE = /var LLAVE = '([^']+)'/.exec(fuente)[1];
export const rpc = (fn, cuerpo) => fetch(URL_API + fn, { method: 'POST', headers: { apikey: LLAVE, Authorization: 'Bearer ' + LLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }).then((r) => r.json());
export const leer = (neg, col, o = {}) => rpc('nube_leer', { p_neg: neg, p_col: col, p_pin: o.pin || null, p_ids: o.ids || null, p_desde: null });
export const escribir = (neg, col, id, data, o = {}) => rpc('nube_escribir', { p_neg: neg, p_col: col, p_id: id, p_data: data, p_pub: o.pub || null, p_pin: o.pin || null, p_modo: o.modo || 'parchar', p_cupo: o.cupo || null });
export const importar = (neg, col, pin, filas) => rpc('nube_importar', { p_neg: neg, p_col: col, p_pin: pin, p_filas: filas });
export const borrar = (neg, col, pin, o = {}) => rpc('nube_borrar', { p_neg: neg, p_col: col, p_pin: pin, p_prefijo: o.prefijo || null, p_filtro: o.filtro || null });
export const vaciar = (neg, col, pin) => rpc('nube_vaciar', { p_neg: neg, p_col: col, p_pin: pin });
export const quien = (neg, pin) => rpc('nube_quien', { p_neg: neg, p_pin: pin });
export const personalListar = (neg, pin) => rpc('nube_personal_listar', { p_neg: neg, p_pin: pin });
export const personalGuardar = (neg, pin, rol, nombre, pinNuevo, activo, pinActual = null) => rpc('nube_personal_guardar', { p_neg: neg, p_pin: pin, p_rol: rol, p_nombre: nombre, p_pin_nuevo: pinNuevo, p_activo: activo, p_pin_actual: pinActual });
export const PIN = { dueno: '482916', cocina: '247135', reparto: '913572', reparto2: '913573' };
