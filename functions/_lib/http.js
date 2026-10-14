const JSON_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
});

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function apiError(code, status, message) {
  return json({ error: { code, message } }, status);
}

export async function readSmallJson(request, maxBytes = 4096) {
  const type = request.headers.get('content-type') || '';
  if (!type.toLowerCase().startsWith('application/json')) {
    return { error: apiError('unsupported_media_type', 415, 'Se requiere application/json.') };
  }

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { error: apiError('payload_too_large', 413, 'La solicitud es demasiado grande.') };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return { error: apiError('payload_too_large', 413, 'La solicitud es demasiado grande.') };
  }

  try {
    const value = JSON.parse(text);
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('invalid object');
    return { value };
  } catch {
    return { error: apiError('invalid_json', 400, 'JSON inválido.') };
  }
}
