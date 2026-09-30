'use client';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import type { TocItem } from '@/types';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const ids = items.map((i) => i.id);
  const active = useScrollSpy(ids);
  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 font-semibold uppercase tracking-wide text-[var(--muted)]">On this page</p>
      <ul className="space-y-2 border-l border-[var(--border)]">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? 20 : 8 }}>
            <a
              href={`#${item.id}`}
              className={`-ml-px block border-l-2 pl-3 transition ${
                active === item.id
                  ? 'border-accent font-medium text-accent'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
