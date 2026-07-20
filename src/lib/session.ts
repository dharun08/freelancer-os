import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a_very_long_and_extremely_secure_default_secret_32_chars';
const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const cryptoObj = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : require('crypto').webcrypto;
  return cryptoObj.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function hexToBuffer(hex: string): Uint8Array {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return view;
}

export async function encryptSession(data: { userId: string; expiresAt: number }): Promise<string> {
  const cryptoObj = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : require('crypto').webcrypto;
  const payloadStr = JSON.stringify(data);
  // Base64 encode the payload string in a way that works in all environments
  const encodedPayload = Buffer.from(payloadStr).toString('base64');
  const key = await getCryptoKey(SESSION_SECRET);
  const signatureBuffer = await cryptoObj.subtle.sign(
    'HMAC',
    key,
    encoder.encode(encodedPayload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${encodedPayload}.${signatureHex}`;
}

export async function decryptSession(token: string): Promise<{ userId: string; expiresAt: number } | null> {
  try {
    const cryptoObj = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : require('crypto').webcrypto;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signatureHex] = parts;

    const key = await getCryptoKey(SESSION_SECRET);
    const isValid = await cryptoObj.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signatureHex) as any,
      encoder.encode(encodedPayload)
    );

    if (!isValid) return null;

    const payloadStr = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const parsed = JSON.parse(payloadStr) as { userId: string; expiresAt: number };
    if (parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('[session decryptSession Exception]:', error);
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const token = await encryptSession({ userId, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
}

export async function getSession(): Promise<{ userId: string; expiresAt: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return decryptSession(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
