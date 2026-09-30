'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Hash, Wrench } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

const icons = { article: FileText, tag: Hash, tool: Wrench } as const;

export function SearchClient() {
  const params = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const { search, loading } = useSearch();
  const results = search(query, 30);

  useEffect(() => setQuery(initial), [initial]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles, tags, tools…"
        aria-label="Search"
        autoFocus
        className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] px-5 py-3 text-sm outline-none focus:border-accent"
      />

      <div className="mt-8">
        {loading && <p className="text-sm text-[var(--muted)]">Loading index…</p>}
        {!loading && query && results.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No matches for “{query}”.</p>
        )}
        {!loading && !query && (
          <p className="text-sm text-[var(--muted)]">Start typing to search across the site.</p>
        )}
        <ul className="divide-y divide-[var(--border)]">
          {results.map((doc) => {
            const Icon = icons[doc.type];
            return (
              <li key={doc.url}>
                <Link href={doc.url} className="flex items-center gap-4 py-4 transition hover:text-accent">
                  <Icon size={18} className="shrink-0 text-[var(--muted)]" />
                  <span className="flex-1">
                    <span className="block font-medium">{doc.title}</span>
                    <span className="block text-sm text-[var(--muted)]">{doc.description}</span>
                  </span>
                  {doc.meta && <span className="text-xs text-[var(--muted)]">{doc.meta}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
