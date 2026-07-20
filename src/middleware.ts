import { NextResponse, NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a_very_long_and_extremely_secure_default_secret_32_chars';
const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
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

interface SessionData {
  userId: string;
  expiresAt: number;
}

async function decryptSession(token: string): Promise<SessionData | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signatureHex] = parts;

    const key = await getCryptoKey(SESSION_SECRET);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signatureHex) as any,
      encoder.encode(encodedPayload)
    );

    if (!isValid) return null;

    const payloadStr = atob(encodedPayload);
    const parsed = JSON.parse(payloadStr) as SessionData;
    if (parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('[middleware decryptSession Exception]:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const session = token ? await decryptSession(token) : null;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  // Static files, API routes, and favicon checks
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (!session && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPage) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
