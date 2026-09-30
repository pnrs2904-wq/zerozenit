import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPosts, getPost, getAdjacentPosts, getRelatedPosts } from '@/lib/mdx';
import { buildMetadata } from '@/lib/seo';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { JsonLd } from '@/components/ui/json-ld';
import { BlogCard } from '@/components/ui/cards';
import { Mdx } from '@/components/blog/mdx';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ReadingProgress, ShareBar } from '@/components/blog/article-actions';
import { NewsletterForm } from '@/components/ui/newsletter-form';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    image: post.ogImage,
    publishedTime: post.date,
    modifiedTime: post.updatedDate,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(post);

  const schema = [
    articleSchema(post),
    breadcrumbSchema([
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    ...(post.faq && post.faq.length ? [faqSchema(post.faq)] : []),
  ];

  return (
    <>
      <ReadingProgress />
      <JsonLd data={schema} />

      <div className="mx-auto grid max-w-6xl gap-10 py-12 lg:grid-cols-[1fr_16rem]">
        <article className="mx-auto w-full max-w-2xl">
          <nav className="text-sm text-[var(--muted)]" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-accent">Blog</Link>
            {' / '}
            <Link href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-accent">
              {post.category}
            </Link>
          </nav>

          <span className="mt-6 block text-5xl" aria-hidden>{post.cover}</span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
            {post.readingTime} min read · {post.author}
          </p>

          <div className="mt-6"><ShareBar title={post.title} /></div>

          <p className="mt-8 text-xl text-[var(--muted)]">{post.excerpt}</p>

          <div className="prose-content mt-2">
            <Mdx source={post.content} />
          </div>

          {post.faq && post.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold">FAQ</h2>
              <div className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
                {post.faq.map((f) => (
                  <details key={f.q} className="group px-6 py-4">
                    <summary className="cursor-pointer list-none font-medium focus-visible:text-accent">{f.q}</summary>
                    <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} href={`/blog/tag/${t}`} className="rounded-full bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted)] hover:text-accent">
                #{t}
              </Link>
            ))}
          </div>

          <section className="my-12 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center">
            <h2 className="font-display text-xl font-semibold">Enjoyed this?</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">Get one thoughtful essay like this each week.</p>
            <div className="mt-5"><NewsletterForm /></div>
          </section>

          <div className="flex justify-between border-t border-[var(--border)] pt-6 text-sm">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="inline-flex items-center gap-1 text-accent">
                <ArrowLeft size={14} /> {prev.title}
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/blog/${next.slug}`} className="inline-flex items-center gap-1 text-right text-accent">
                {next.title} <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 font-display text-xl font-semibold">Related</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {related.map((p) => <BlogCard key={p.slug} post={p} />)}
              </div>
            </section>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={post.toc ?? []} />
          </div>
        </aside>
      </div>
    </>
  );
}
