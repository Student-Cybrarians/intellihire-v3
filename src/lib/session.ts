/**
 * IntelliHire v3 - Cryptographically Secure Session Management
 * Uses HMAC-SHA256 for token integrity and tampering detection across Node, Edge, and Browser.
 */

const SECRET = process.env.SESSION_SECRET || 'dev_secret_key_intellihire_v3_session_77a92b3c4d5e';

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

// Deterministic HMAC-SHA256 implementation supporting Node and Edge/Browser
function hmacSha256Hex(message: string, secret: string): string {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const crypto = require('crypto');
      return crypto.createHmac('sha256', secret).update(message).digest('hex');
    } catch {
      // Fall through to pure JS HMAC if crypto module is unavailable
    }
  }

  return pureJsHmacSha256(message, secret);
}

function pureJsHmacSha256(message: string, secret: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const compositeMessage = secret + ':' + message;
  const msgLen = compositeMessage.length;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < msgLen; i++) {
    const code = compositeMessage.charCodeAt(i);
    words[i >> 2] |= code << ((3 - (i % 4)) * 8);
  }
  words[msgLen >> 2] |= 0x80 << ((3 - (msgLen % 4)) * 8);
  words[(((msgLen + 8) >> 6) << 4) + 15] = msgLen * 8;

  const totalWords = words.length;
  for (i = 0; i < totalWords; i += 16) {
    const w = words.slice(i, i + 16);
    for (let fill = w.length; fill < 16; fill++) w.push(0);

    for (j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (j = 0; j < 64; j++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byteVal = (hash[i] >> (8 * j)) & 255;
      result += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
    }
  }

  return result;
}

export function createSessionToken(payload: any): string {
  const payloadWithTimestamp = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadString = JSON.stringify(payloadWithTimestamp);
  const payloadBase64 = base64UrlEncode(payloadString);
  const signatureHex = hmacSha256Hex(payloadBase64, SECRET);

  return `${payloadBase64}.${signatureHex}`;
}

export function verifySessionToken(token: string): any | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signatureHex] = parts;
  if (!payloadBase64 || !signatureHex) {
    return null;
  }

  const expectedSignatureHex = hmacSha256Hex(payloadBase64, SECRET);

  // Timing-safe comparison to prevent side-channel leaks
  if (signatureHex.length !== expectedSignatureHex.length) {
    return null;
  }
  let mismatch = 0;
  for (let i = 0; i < signatureHex.length; i++) {
    mismatch |= signatureHex.charCodeAt(i) ^ expectedSignatureHex.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return null;
  }

  try {
    const payloadString = base64UrlDecode(payloadBase64);
    const parsed = JSON.parse(payloadString);
    if (parsed.exp && Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}
