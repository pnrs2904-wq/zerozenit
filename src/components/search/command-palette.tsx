'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Hash, Wrench, CornerDownLeft } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import type { SearchDoc } from '@/lib/search';

const icons = { article: FileText, tag: Hash, tool: Wrench } as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const { search } = useSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const results: SearchDoc[] = search(query);

  // Global Ctrl+K / Cmd+K toggle + Escape to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function go(doc: SearchDoc) {
    setOpen(false);
    router.push(doc.url);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--card)]"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-[var(--border)] px-1.5 text-xs sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[15vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
        >
          <div
            className="glass w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
              <Search size={18} className="text-[var(--muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search articles, tags, tools…"
                className="w-full bg-transparent py-4 text-sm outline-none"
                aria-label="Search query"
                aria-controls="search-results"
              />
            </div>

            <ul id="search-results" className="max-h-80 overflow-y-auto p-2">
              {query && results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                  No matches for “{query}”.
                </li>
              )}
              {results.map((doc, i) => {
                const Icon = icons[doc.type];
                return (
                  <li key={doc.url}>
                    <button
                      onClick={() => go(doc)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        active === i ? 'bg-accent/10 text-accent' : 'hover:bg-[var(--card)]'
                      }`}
                    >
                      <Icon size={16} className="shrink-0 text-[var(--muted)]" />
                      <span className="flex-1">
                        <span className="block font-medium">{doc.title}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">{doc.description}</span>
                      </span>
                      {doc.meta && <span className="shrink-0 text-xs text-[var(--muted)]">{doc.meta}</span>}
                      {active === i && <CornerDownLeft size={14} className="shrink-0 text-accent" />}
                    </button>
                  </li>
                );
              })}
              {!query && (
                <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                  Type to search across articles, tags, and tools.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
