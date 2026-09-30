import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import { categories, categorySlug } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { BlogCard } from '@/components/ui/cards';

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Essays on AI, deep work, ancient wisdom, and clear thinking.',
  path: '/blog',
});

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="py-12">
      <h1 className="font-display text-4xl font-semibold">Blog</h1>
      <p className="mt-2 text-[var(--muted)]">Essays on focus, technology, and living deliberately.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/blog/category/${categorySlug(c)}`}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((p) => <BlogCard key={p.slug} post={p} />)}
      </div>
    </div>
  );
}
