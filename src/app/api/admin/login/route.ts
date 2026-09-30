import { NextResponse } from 'next/server';
import { isAdminPasswordValid, setAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isAdminPasswordValid(String(body.password || ''))) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
