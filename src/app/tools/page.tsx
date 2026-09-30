import type { Metadata } from 'next';
import { tools } from '@/data/tools';
import { ToolsExplorer } from './explorer';

export const metadata: Metadata = {
  title: 'AI Tools',
  description: 'A curated, searchable directory of AI tools for focus and productivity.',
  alternates: { canonical: '/tools' },
};

export default function ToolsPage() {
  return (
    <div className="py-12">
      <h1 className="font-display text-4xl font-semibold">AI Tools</h1>
      <p className="mt-2 text-[var(--muted)]">Curated tools we actually use. Search, filter, and compare.</p>
      <ToolsExplorer tools={tools} />
    </div>
  );
}
