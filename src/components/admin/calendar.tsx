'use client';
import { useEffect, useState } from 'react';
import type { AdminPostRow } from './article-list';

export function ContentCalendar({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<AdminPostRow[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/posts').then((r) => r.json()).then((d) => setPosts(d.posts || [])).catch(() => setPosts([]));
  }, [refreshKey]);

  if (!posts) return <p className="text-sm text-[var(--muted)]">Loading calendar…</p>;

  const grouped = new Map<string, { title: string; status: string }[]>();
  for (const p of posts) {
    const when = p.scheduledDate || p.date;
    if (!when) continue;
    const key = new Date(when).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const status = p.scheduledDate && new Date(p.scheduledDate) > new Date() ? 'Scheduled' : p.draft ? 'Draft' : 'Published';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({ title: p.title, status });
  }
  const days = [...grouped.entries()].sort((a, b) => +new Date(a[0]) - +new Date(b[0]));

  return (
    <div className="space-y-3">
      {days.length === 0 && <p className="text-sm text-[var(--muted)]">Nothing on the calendar yet.</p>}
      {days.map(([day, items]) => (
        <div key={day} className="flex gap-4 rounded-xl border border-[var(--border)] p-4">
          <div className="w-32 shrink-0 text-sm font-medium">{day}</div>
          <ul className="flex-1 space-y-1 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>{it.title}</span>
                <span className={`text-xs ${it.status === 'Published' ? 'text-green-500' : it.status === 'Scheduled' ? 'text-blue-500' : 'text-amber-500'}`}>{it.status}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
