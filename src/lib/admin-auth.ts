import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'zz_admin_session';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'change-me';
}

export function isAdminPasswordValid(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function token() {
  return crypto.createHmac('sha256', secret()).update('zerozenit-admin').digest('hex');
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}

export async function isAdmin() {
  const store = await cookies();
  return store.get(COOKIE)?.value === token();
}
