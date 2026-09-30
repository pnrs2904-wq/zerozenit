import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/mdx';
import { tools } from '@/data/tools';
import { site } from '@/lib/site';
import { organizationSchema, websiteSchema, faqSchema } from '@/lib/schema';
import { JsonLd } from '@/components/ui/json-ld';
import { BlogCard, ToolCard } from '@/components/ui/cards';
import { NewsletterForm } from '@/components/ui/newsletter-form';

const faqs = [
  { q: 'What is ZeroZenit about?', a: 'It combines ancient wisdom, AI, and deep focus practices into practical guidance for modern work and thinking.' },
  { q: 'Is the content free?', a: 'Yes. Every article and tool review is free to read.' },
  { q: 'How often do you publish?', a: 'New articles land weekly, alongside regularly updated AI tool reviews.' },
];

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <Link href={href} className="text-sm text-accent hover:underline">View all</Link>
    </div>
  );
}

export default function Home() {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const latest = posts.slice(0, 3);

  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), faqSchema(faqs)]} />

      <section className="py-16 text-center md:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Clarity over noise</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
          {site.tagline}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]">{site.description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
            Read the blog <ArrowRight size={16} />
          </Link>
          <Link href="/tools" className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium transition hover:bg-[var(--card)]">
            Explore AI tools
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-12">
          <SectionHeader title="Featured articles" href="/blog" />
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <section className="py-12">
        <SectionHeader title="Latest posts" href="/blog" />
        <div className="grid gap-6 md:grid-cols-3">
          {latest.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
      </section>

      <section className="py-12">
        <SectionHeader title="Trending AI tools" href="/tools" />
        <div className="grid gap-6 md:grid-cols-3">
          {tools.slice(0, 3).map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      <section className="my-12 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
        <h2 className="font-display text-2xl font-semibold">The weekly signal</h2>
        <p className="mx-auto mt-2 max-w-md text-[var(--muted)]">One thoughtful email a week. No noise, unsubscribe anytime.</p>
        <div className="mt-6"><NewsletterForm /></div>
      </section>

      <section className="py-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">Frequently asked</h2>
        <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-4">
              <summary className="cursor-pointer list-none font-medium focus-visible:text-accent">{f.q}</summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
