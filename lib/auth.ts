import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';

const COOKIE = 'tp_session';
const TTL_SECONDS = 12 * 60 * 60;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET não configurado no ambiente');
  return new TextEncoder().encode(s);
}

export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);
}

export function checkPassword(password: string): boolean {
  const admin = process.env.ADMIN_PASSWORD;
  if (!admin || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(admin);
  // comprimentos diferentes: compara contra si mesmo para manter tempo constante
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_SECONDS,
  });
}

export async function getSession(): Promise<{ role: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { role: String(payload.role ?? '') };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Não autenticado — faça login novamente.');
}

export function clearSession(): void {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}
