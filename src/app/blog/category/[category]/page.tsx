import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory } from '@/lib/mdx';
import { categories, categorySlug, categoryFromSlug } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { BlogCard } from '@/components/ui/cards';

export function generateStaticParams() {
  return categories.map((c) => ({ category: categorySlug(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const name = categoryFromSlug(category);
  return buildMetadata({
    title: name ? `${name} articles` : 'Category',
    description: name ? `Articles about ${name} on ZeroZenit.` : undefined,
    path: `/blog/category/${category}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const name = categoryFromSlug(category);
  if (!name) notFound();
  const filtered = getPostsByCategory(name);

  return (
    <div className="py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">Category</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{name}</h1>
      <p className="mt-2 text-[var(--muted)]">{filtered.length} article{filtered.length === 1 ? '' : 's'}</p>
      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">No articles here yet. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {filtered.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
      )}
    </div>
  );
}
