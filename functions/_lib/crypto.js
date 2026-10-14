const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function deriveOrderAccessToken(secret, orderId) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('ORDER_TOKEN_SECRET is missing or too short');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`order-access:${orderId}`));
  return toBase64Url(new Uint8Array(signature));
}

export async function sha256Base64Url(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toBase64Url(new Uint8Array(digest));
}

function fromHex(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/i.test(value)) return null;
  return new Uint8Array(value.match(/../g).map((byte) => Number.parseInt(byte, 16)));
}

export async function verifyHmacSha256Hex(secret, message, expectedHex) {
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new Error('MP_WEBHOOK_SECRET is missing or too short');
  }
  const expected = fromHex(expectedHex);
  if (!expected) return false;
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  return crypto.subtle.verify('HMAC', key, expected, encoder.encode(message));
}
