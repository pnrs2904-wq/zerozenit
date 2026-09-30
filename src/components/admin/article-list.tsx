'use client';
import { useEffect, useMemo, useState } from 'react';

export interface AdminPostRow {
  slug: string; title: string; category: string; tags: string[]; date: string | null;
  updatedDate: string | null; draft: boolean; scheduledDate: string | null; featured: boolean; cover: string; words: number;
}

export function ArticleList({ onEdit, onDuplicate, refreshKey }: {
  onEdit: (slug: string) => void;
  onDuplicate: (slug: string) => void;
  refreshKey: number;
}) {
  const [posts, setPosts] = useState<AdminPostRow[] | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function load() {
    const r = await fetch('/api/admin/posts');
    const d = await r.json();
    if (r.ok) setPosts(d.posts);
  }
  useEffect(() => { load(); }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      const status = p.scheduledDate && new Date(p.scheduledDate) > new Date() ? 'scheduled' : p.draft ? 'draft' : 'published';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (query && !`${p.title} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [posts, query, statusFilter]);

  async function toggleStatus(p: AdminPostRow) {
    setBusySlug(p.slug);
    const full = await (await fetch(`/api/admin/posts?slug=${encodeURIComponent(p.slug)}`)).json();
    await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...full, draft: !p.draft, scheduledDate: '' }) });
    setBusySlug(null);
    load();
  }

  async function remove(slug: string) {
    if (!confirm(`Delete "${slug}"? This can't be undone.`)) return;
    setBusySlug(slug);
    await fetch('/api/admin/posts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    setBusySlug(null);
    load();
  }

  if (!posts) return <p className="text-sm text-[var(--muted)]">Loading articles…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input className="min-w-52 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm" placeholder="Search title, category, tags…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <span className="text-xs text-[var(--muted)]">{filtered.length} of {posts.length} articles</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--card)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr><th className="px-4 py-3">Article</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Words</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = p.scheduledDate && new Date(p.scheduledDate) > new Date() ? 'Scheduled' : p.draft ? 'Draft' : 'Published';
              const statusColor = status === 'Published' ? 'text-green-500' : status === 'Scheduled' ? 'text-blue-500' : 'text-amber-500';
              return (
                <tr key={p.slug} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3"><span className="mr-2">{p.cover?.startsWith('/uploads') ? '🖼️' : p.cover}</span>{p.title}{p.featured && <span className="ml-2 text-xs text-accent">★ featured</span>}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{p.category}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor}`}>{status}{status === 'Scheduled' && p.scheduledDate ? ` · ${new Date(p.scheduledDate).toLocaleString()}` : ''}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{p.words}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => onEdit(p.slug)} className="rounded-lg border border-[var(--border)] px-2 py-1">Edit</button>
                      <button onClick={() => onDuplicate(p.slug)} className="rounded-lg border border-[var(--border)] px-2 py-1">Duplicate</button>
                      <button disabled={busySlug === p.slug} onClick={() => toggleStatus(p)} className="rounded-lg border border-[var(--border)] px-2 py-1">{p.draft ? 'Publish' : 'Unpublish'}</button>
                      <button disabled={busySlug === p.slug} onClick={() => remove(p.slug)} className="rounded-lg border border-[var(--border)] px-2 py-1 text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">No articles match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
