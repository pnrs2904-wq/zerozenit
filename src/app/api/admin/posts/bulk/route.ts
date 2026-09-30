import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getFile, upsertFile } from '@/lib/github-cms';
import { buildPostMdx, relativeForSlug } from '@/lib/post-format';

/** POST /api/admin/posts/bulk  { articles: Array<post body> }
 *  Publishes each article sequentially (GitHub's Contents API has no batch-commit
 *  endpoint for this auth flow, so each file is its own commit) and reports per-item results.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const articles = Array.isArray(body.articles) ? body.articles : [];
  if (!articles.length) return NextResponse.json({ error: 'No articles provided.' }, { status: 400 });
  if (articles.length > 100) return NextResponse.json({ error: 'Limit is 100 articles per bulk upload.' }, { status: 400 });

  const results: { slug: string; ok: boolean; error?: string }[] = [];
  for (const article of articles) {
    if (!article.slug || !article.title || !article.content) {
      results.push({ slug: article.slug || '(untitled)', ok: false, error: 'Missing title, slug, or content.' });
      continue;
    }
    const relative = relativeForSlug(article.slug);
    try {
      let sha: string | undefined;
      try { sha = (await getFile(relative)).sha; } catch (e) { if (!(e instanceof Error) || !e.message.includes('GitHub API 404')) throw e; }
      await upsertFile(relative, buildPostMdx(article), `${sha ? 'Update' : 'Add'} blog post (bulk): ${article.title}`, sha);
      results.push({ slug: article.slug, ok: true });
    } catch (error) {
      results.push({ slug: article.slug, ok: false, error: error instanceof Error ? error.message : 'Publish failed.' });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, succeeded, failed: results.length - succeeded, results });
}
