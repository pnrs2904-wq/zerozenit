import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { upsertBinaryFile } from '@/lib/github-cms';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const base64 = String(body.base64 || '');
  const filename = String(body.filename || 'image').replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!base64) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });

  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '.jpg';
  const name = `${Date.now()}-${filename.replace(ext, '').slice(0, 60)}${ext}`;
  const relative = `public/uploads/${name}`;

  try {
    await upsertBinaryFile(relative, base64, `Upload featured image: ${name}`);
    return NextResponse.json({ ok: true, path: `/uploads/${name}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 500 });
  }
}
