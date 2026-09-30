'use client';
import { useEffect, useState } from 'react';
import type { AdminPostRow } from './article-list';

export function Dashboard({ refreshKey, onQuickAction }: { refreshKey: number; onQuickAction: (tab: string) => void }) {
  const [posts, setPosts] = useState<AdminPostRow[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/posts').then((r) => r.json()).then((d) => setPosts(d.posts || [])).catch(() => setPosts([]));
  }, [refreshKey]);

  if (!posts) return <p className="text-sm text-[var(--muted)]">Loading dashboard…</p>;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const publishedToday = posts.filter((p) => !p.draft && p.date && new Date(p.date) >= startOfDay).length;
  const drafts = posts.filter((p) => p.draft && !p.scheduledDate).length;
  const scheduled = posts.filter((p) => p.scheduledDate && new Date(p.scheduledDate) > now).length;
  const publishedThisMonth = posts.filter((p) => !p.draft && p.date && new Date(p.date) >= startOfMonth).length;
  const wordsThisMonth = posts.filter((p) => !p.draft && p.date && new Date(p.date) >= startOfMonth).reduce((s, p) => s + p.words, 0);

  const upcoming = posts
    .filter((p) => p.scheduledDate && new Date(p.scheduledDate) > now)
    .sort((a, b) => +new Date(a.scheduledDate!) - +new Date(b.scheduledDate!))
    .slice(0, 6);

  const recent = [...posts].sort((a, b) => +new Date(b.updatedDate || b.date || 0) - +new Date(a.updatedDate || a.date || 0)).slice(0, 6);

  const stat = (label: string, value: number | string) => (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted)]">Today's publishing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {stat('Published today', publishedToday)}
          {stat('Drafts', drafts)}
          {stat('Scheduled', scheduled)}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted)]">This month</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {stat('Articles published', publishedThisMonth)}
          {stat('Words published', wordsThisMonth.toLocaleString())}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--muted)]">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[['editor', '+ New article'], ['bulk', '📦 Bulk upload'], ['articles', '📝 Manage articles'], ['calendar', '📅 Calendar']].map(([k, l]) => (
            <button key={k} onClick={() => onQuickAction(k)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card)]">{l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted)]">Upcoming (scheduled)</h3>
          <ul className="mt-2 space-y-2">
            {upcoming.length === 0 && <li className="text-sm text-[var(--muted)]">Nothing scheduled.</li>}
            {upcoming.map((p) => <li key={p.slug} className="rounded-xl border border-[var(--border)] p-3 text-sm">{p.title}<span className="ml-2 text-xs text-[var(--muted)]">{new Date(p.scheduledDate!).toLocaleString()}</span></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted)]">Recently updated</h3>
          <ul className="mt-2 space-y-2">
            {recent.map((p) => <li key={p.slug} className="rounded-xl border border-[var(--border)] p-3 text-sm">{p.title}<span className="ml-2 text-xs text-[var(--muted)]">{p.draft ? 'Draft' : 'Published'}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
