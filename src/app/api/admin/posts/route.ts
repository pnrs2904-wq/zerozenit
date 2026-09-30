import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { isAdmin } from '@/lib/admin-auth';
import { deleteFile, getFile, upsertFile, listDir } from '@/lib/github-cms';
import { buildPostMdx, relativeForSlug, BLOG_DIR as DIR } from '@/lib/post-format';

const mdx = buildPostMdx;
const relativeFor = relativeForSlug;

/** GET /api/admin/posts            -> list all posts (metadata only), newest first
 *  GET /api/admin/posts?slug=foo   -> full content + metadata for editing
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const file = await getFile(relativeFor(slug));
      const { data, content } = matter(file.content);
      return NextResponse.json({ ...data, slug: data.slug || slug, content });
    }

    const entries = await listDir(DIR);
    const files = entries.filter((e) => e.type === 'file' && e.name.endsWith('.mdx') && !e.name.startsWith('_'));
    const posts = await Promise.all(
      files.map(async (entry) => {
        try {
          const file = await getFile(`${DIR}/${entry.name}`);
          const { data, content } = matter(file.content);
          const words = content.trim().split(/\s+/).filter(Boolean).length;
          return {
            slug: data.slug || entry.name.replace(/\.mdx$/, ''),
            title: data.title || entry.name,
            category: data.category || 'Uncategorized',
            tags: data.tags || [],
            date: data.date || null,
            updatedDate: data.updatedDate || null,
            draft: Boolean(data.draft),
            scheduledDate: data.scheduledDate || null,
            featured: Boolean(data.featured),
            cover: data.cover || '📄',
            words,
          };
        } catch {
          return null;
        }
      })
    );
    const clean = posts.filter(Boolean) as any[];
    clean.sort((a, b) => +new Date(b.date || 0) - +new Date(a.date || 0));
    return NextResponse.json({ posts: clean });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load posts.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.slug || !body.title || !body.content) return NextResponse.json({ error: 'Title, slug and content are required.' }, { status: 400 });
  const relative = relativeFor(body.slug);
  try {
    let sha: string | undefined;
    try { sha = (await getFile(relative)).sha; } catch (e) { if (!(e instanceof Error) || !e.message.includes('GitHub API 404')) throw e; }
    await upsertFile(relative, mdx(body), `${sha ? 'Update' : 'Add'} blog post: ${body.title}`, sha);
    return NextResponse.json({ ok: true, path: relative });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Publish failed.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  if (!body.slug) return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
  const relative = relativeFor(body.slug);
  try { await deleteFile(relative, `Delete blog post: ${body.slug}`); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Delete failed.' }, { status: 500 }); }
}
