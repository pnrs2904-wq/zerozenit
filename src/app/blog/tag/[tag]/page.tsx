import type { Metadata } from 'next';
import { getAllTags, getPostsByTag } from '@/lib/mdx';
import { buildMetadata } from '@/lib/seo';
import { BlogCard } from '@/components/ui/cards';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  return buildMetadata({ title: `#${tag}`, description: `Articles tagged ${tag}.`, path: `/blog/tag/${tag}` });
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  return (
    <div className="py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">Tag</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">#{tag}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((p) => <BlogCard key={p.slug} post={p} />)}
      </div>
    </div>
  );
}
