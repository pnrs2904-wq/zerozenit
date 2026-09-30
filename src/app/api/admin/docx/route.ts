import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { htmlToMarkdown } from '@/lib/article-tools';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const base64 = String(body.base64 || '');
  if (!base64) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

  try {
    const mammoth = (await import('mammoth')).default as any;
    const buffer = Buffer.from(base64, 'base64');
    const { value: html } = await mammoth.convertToHtml({ buffer });
    const markdown = htmlToMarkdown(html);
    return NextResponse.json({ markdown });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'DOCX conversion failed.' }, { status: 500 });
  }
}
