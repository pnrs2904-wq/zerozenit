'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import type { SearchDoc } from '@/lib/search';

/** Loads the search index once and returns a query→results function. */
export function useSearch() {
  const [index, setIndex] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const fuseRef = useRef<Fuse<SearchDoc> | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/search')
      .then((r) => r.json())
      .then((docs: SearchDoc[]) => {
        if (!active) return;
        setIndex(docs);
        fuseRef.current = new Fuse(docs, {
          keys: [
            { name: 'title', weight: 2 },
            { name: 'description', weight: 1 },
            { name: 'meta', weight: 0.5 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
          minMatchCharLength: 2,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function search(query: string, limit = 8): SearchDoc[] {
    const q = query.trim();
    if (!q) return [];
    if (!fuseRef.current) return [];
    return fuseRef.current.search(q, { limit }).map((r) => r.item);
  }

  return { search, loading, count: index.length };
}
