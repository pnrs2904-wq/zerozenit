'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Tool } from '@/types';
import { ToolCard } from '@/components/ui/cards';

const filters = ['All', 'Free', 'Freemium', 'Paid'] as const;

export function ToolsExplorer({ tools }: { tools: Tool[] }) {
  const [q, setQ] = useState('');
  const [pricing, setPricing] = useState<(typeof filters)[number]>('All');

  const results = useMemo(() => {
    return tools.filter((t) => {
      const matchesQ =
        !q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.description.toLowerCase().includes(q.toLowerCase());
      const matchesPricing = pricing === 'All' || t.pricing === pricing;
      return matchesQ && matchesPricing;
    });
  }, [tools, q, pricing]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <label htmlFor="tool-search" className="sr-only">Search tools</label>
          <input
            id="tool-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools…"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setPricing(f)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                pricing === f ? 'border-accent bg-accent text-white' : 'border-[var(--border)] text-[var(--muted)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-12 text-center text-[var(--muted)]">No tools match that search. Try broader terms.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {results.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      )}
    </>
  );
}
