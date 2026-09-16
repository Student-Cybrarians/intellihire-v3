const SECRET = process.env.SESSION_SECRET || 'dev_secret_key_intellihire_v3_session';

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url');
  }
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf8');
  }
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

// Simple deterministic signature for edge/browser/node synchronization
function generateSignature(payloadBase64: string, secret: string): string {
  let hash = 0;
  const combined = payloadBase64 + ':' + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + 'v3';
}

export function createSessionToken(payload: any): string {
  const payloadString = JSON.stringify(payload);
  const payloadBase64 = base64UrlEncode(payloadString);
  const signatureBase64 = generateSignature(payloadBase64, SECRET);

  return `${payloadBase64}.${signatureBase64}`;
}

export function verifySessionToken(token: string): any | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [payloadBase64, signatureBase64] = token.split('.');
  if (!payloadBase64 || !signatureBase64) {
    return null;
  }

  const expectedSignature = generateSignature(payloadBase64, SECRET);
  if (signatureBase64 !== expectedSignature) {
    return null;
  }

  try {
    const payloadString = base64UrlDecode(payloadBase64);
    return JSON.parse(payloadString);
  } catch (e) {
    return null;
  }
}
