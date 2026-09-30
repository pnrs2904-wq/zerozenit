import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Post, Tool } from '@/types';

export function BlogCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="text-3xl" aria-hidden>{post.cover}</span>
      <span className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">{post.category}</span>
      <h3 className="mt-1 font-display text-lg font-semibold group-hover:text-accent">{post.title}</h3>
      <p className="mt-2 flex-1 text-sm text-[var(--muted)]">{post.excerpt}</p>
      <span className="mt-4 text-xs text-[var(--muted)]">{post.readingTime} min read</span>
    </Link>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl" aria-hidden>{tool.logo}</span>
        <span className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
          <Star size={14} className="fill-secondary text-secondary" /> {tool.rating}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-accent">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm text-[var(--muted)]">{tool.description}</p>
      <span className="mt-4 inline-block w-fit rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
        {tool.pricing}
      </span>
    </Link>
  );
}
