import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { getFile, upsertFile, listDir } from '@/lib/github-cms';
import { buildPostMdx, BLOG_DIR } from '@/lib/post-format';

/** GET /api/cron/publish-scheduled
 * Wired up via vercel.json "crons" (requires a Vercel plan that supports Cron Jobs).
 * Vercel calls this with an "Authorization: Bearer <CRON_SECRET>" header automatically
 * when CRON_SECRET is set as an env var; we verify that here so the endpoint can't be
 * triggered by anyone who finds the URL.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await listDir(BLOG_DIR);
  const files = entries.filter((e) => e.type === 'file' && e.name.endsWith('.mdx') && !e.name.startsWith('_'));

  const published: string[] = [];
  for (const entry of files) {
    const relative = `${BLOG_DIR}/${entry.name}`;
    const file = await getFile(relative);
    const { data, content } = matter(file.content);
    if (!data.draft || !data.scheduledDate) continue;
    if (new Date(data.scheduledDate).getTime() > Date.now()) continue;

    const { scheduledDate, ...rest } = data;
    await upsertFile(relative, buildPostMdx({ ...rest, content, draft: false }), `Auto-publish scheduled post: ${data.title}`, file.sha);
    published.push(data.slug || entry.name);
  }

  return NextResponse.json({ ok: true, published });
}
