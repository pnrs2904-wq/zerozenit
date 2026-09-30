import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { SearchClient } from './search-client';

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search articles, tags, and tools across ZeroZenit.',
  path: '/search',
});

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-semibold">Search</h1>
      <p className="mt-2 text-[var(--muted)]">Find articles, tags, and tools.</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
