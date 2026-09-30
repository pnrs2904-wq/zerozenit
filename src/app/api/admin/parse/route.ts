import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { parseArticle, computeSeoScore, suggestInternalLinks, type PostSummary } from '@/lib/article-tools';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const content = String(body.content || '');
  if (!content.trim()) return NextResponse.json({ error: 'No content provided.' }, { status: 400 });

  const parsed = parseArticle(content, body.filename);
  const existingPosts: PostSummary[] = Array.isArray(body.existingPosts) ? body.existingPosts : [];
  const related = suggestInternalLinks({ category: parsed.category, tags: parsed.tags }, existingPosts);
  const seo = computeSeoScore({
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt,
    content: parsed.content,
    coverImage: body.coverImage,
    internalLinks: (parsed.content.match(/\]\(/g) || []).length,
  });

  return NextResponse.json({ ...parsed, seo, relatedSuggestions: related });
}
