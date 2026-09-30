import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import GithubSlugger from 'github-slugger';
import type { Post, TocItem } from '@/types';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/** Extract h2/h3 headings from markdown body for the table of contents. */
function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[#*`]/g, '').trim();
      toc.push({ id: slugger.slug(text), text, level });
    }
  }
  return toc;
}

let cache: Post[] | null = null;

/** Load, parse, and normalize all blog posts from MDX. */
export function getAllPosts(): Post[] {
  if (cache) return cache;
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  const posts = files.map((file): Post => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = (data.slug as string) ?? file.replace(/\.mdx$/, '');
    return {
      slug,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? data.description ?? '',
      category: data.category ?? 'Uncategorized',
      subcategories: data.subcategories ?? [],
      tags: data.tags ?? [],
      author: data.author ?? 'ZeroZenit',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      updatedDate: data.updatedDate ? new Date(data.updatedDate).toISOString() : undefined,
      readingTime: Math.max(1, Math.round(readingTime(content).minutes)),
      cover: data.cover ?? '📄',
      content,
      toc: extractToc(content),
      faq: data.faq ?? [],
      featured: data.featured ?? false,
      draft: data.draft ?? false,
      canonicalURL: data.canonicalURL,
      ogImage: data.ogImage,
    };
  });

  cache = posts
    .filter((p) => !p.draft || process.env.NODE_ENV === 'development')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return cache;
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return { prev: all[i + 1], next: all[i - 1] }; // sorted newest-first
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);
}
