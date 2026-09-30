import { getAllPosts, getAllTags } from '@/lib/mdx';
import { tools } from '@/data/tools';

export interface SearchDoc {
  type: 'article' | 'tag' | 'tool';
  title: string;
  description: string;
  url: string;
  meta?: string; // category / pricing / count
}

/** Build a flat, searchable index across every content type. */
export function buildSearchIndex(): SearchDoc[] {
  const articles: SearchDoc[] = getAllPosts().map((p) => ({
    type: 'article',
    title: p.title,
    description: p.excerpt,
    url: `/blog/${p.slug}`,
    meta: p.category,
  }));

  const tagDocs: SearchDoc[] = getAllTags().map(({ tag, count }) => ({
    type: 'tag',
    title: `#${tag}`,
    description: `${count} article${count === 1 ? '' : 's'} tagged ${tag}`,
    url: `/blog/tag/${tag}`,
    meta: 'Tag',
  }));

  const toolDocs: SearchDoc[] = tools.map((t) => ({
    type: 'tool',
    title: t.name,
    description: t.description,
    url: `/tools/${t.slug}`,
    meta: t.pricing,
  }));

  // Products & resources will append here once those collections exist.
  return [...articles, ...tagDocs, ...toolDocs];
}
