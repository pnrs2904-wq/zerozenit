'use client';
import type { SeoResult } from '@/lib/article-tools';

export function SeoChecklist({ seo }: { seo: SeoResult }) {
  const color = seo.score >= 80 ? 'text-green-500' : seo.score >= 50 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">SEO checklist</h3>
        <span className={`text-lg font-bold ${color}`}>{seo.score}/100</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {seo.checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2">
            <span className={c.pass ? 'text-green-500' : 'text-amber-500'}>{c.pass ? '✓' : '⚠'}</span>
            <span className="flex-1">
              {c.label}
              <span className="ml-1 text-xs text-[var(--muted)]">({c.hint})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
