import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, X, ExternalLink, Star } from 'lucide-react';
import { tools, getTool } from '@/data/tools';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} review`,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: tool.category,
    description: tool.description,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: tool.rating, ratingCount: 1 },
    offers: { '@type': 'Offer', price: tool.pricing === 'Paid' ? '' : '0', priceCurrency: 'USD' },
    url: `${site.url}/tools/${tool.slug}`,
  };

  return (
    <div className="mx-auto max-w-2xl py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/tools" className="hover:text-accent">AI Tools</Link> / <span>{tool.name}</span>
      </nav>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-5xl" aria-hidden>{tool.logo}</span>
        <div>
          <h1 className="font-display text-3xl font-semibold">{tool.name}</h1>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--muted)]">
            <Star size={14} className="fill-secondary text-secondary" /> {tool.rating} · {tool.pricing} · {tool.category}
          </p>
        </div>
      </div>

      <p className="mt-6 text-lg text-[var(--muted)]">{tool.description}</p>

      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Visit website <ExternalLink size={16} />
      </a>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Features</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {tool.features.map((f) => (
            <li key={f} className="rounded-full bg-[var(--card)] px-3 py-1 text-sm">{f}</li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-semibold">Pros</h2>
          <ul className="mt-3 space-y-2">
            {tool.pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 text-secondary" />{p}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold">Cons</h2>
          <ul className="mt-3 space-y-2">
            {tool.cons.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm"><X size={16} className="mt-0.5 text-red-500" />{c}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
