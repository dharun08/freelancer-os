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
  const pathname = request.nextUrl.pathname;

  // Static files, API routes, and favicon checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/join-beta' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname.startsWith('/accept-invite') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Unauthenticated user trying to access protected route -> redirect to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on login/register -> redirect to dashboard
  if (session && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', request.nextUrl);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
