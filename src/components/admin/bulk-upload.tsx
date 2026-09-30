'use client';
import { useState } from 'react';
import type { PostSummary } from '@/lib/article-tools';

interface Row {
  filename: string; title: string; slug: string; excerpt: string; category: string; tags: string; content: string;
  include: boolean; status: 'pending' | 'parsed' | 'error' | 'published' | 'failed'; error?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function BulkUpload({ existingPosts, onPublished }: { existingPosts: PostSummary[]; onPublished?: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState('');

  async function handleFiles(files: FileList) {
    const list = Array.from(files).slice(0, 100);
    const initial: Row[] = list.map((f) => ({ filename: f.name, title: '', slug: '', excerpt: '', category: '', tags: '', content: '', include: true, status: 'pending' }));
    setRows(initial);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        let text = '';
        if (/\.docx$/i.test(file.name)) {
          const base64 = await fileToBase64(file);
          const r = await fetch('/api/admin/docx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64 }) });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || 'DOCX conversion failed');
          text = d.markdown;
        } else {
          text = await file.text();
        }
        const r2 = await fetch('/api/admin/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text, filename: file.name, existingPosts }) });
        const parsed = await r2.json();
        if (!r2.ok) throw new Error(parsed.error || 'Parse failed');
        setRows((prev) => prev.map((row, idx) => idx === i ? {
          ...row, title: parsed.title, slug: parsed.slug, excerpt: parsed.excerpt, category: parsed.category,
          tags: parsed.tags.join(', '), content: parsed.content, status: 'parsed',
        } : row));
      } catch (err) {
        setRows((prev) => prev.map((row, idx) => idx === i ? { ...row, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : row));
      }
    }
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  async function publishAll() {
    setBusy(true); setSummary('');
    const toPublish = rows.filter((r) => r.include && r.status === 'parsed');
    const articles = toPublish.map((r) => ({
      title: r.title, slug: r.slug, excerpt: r.excerpt, category: r.category,
      tags: r.tags.split(',').map((t) => t.trim()).filter(Boolean), content: r.content, draft: false,
    }));
    const res = await fetch('/api/admin/posts/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articles }) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setSummary(d.error || 'Bulk publish failed.'); return; }
    setSummary(`Published ${d.succeeded} of ${articles.length}. ${d.failed ? `${d.failed} failed — see rows below.` : ''}`);
    setRows((prev) => {
      let pi = 0;
      return prev.map((row) => {
        if (!(row.include && row.status === 'parsed')) return row;
        const result = d.results[pi++];
        return { ...row, status: result.ok ? 'published' : 'failed', error: result.error };
      });
    });
    onPublished?.();
  }

  const parsedCount = rows.filter((r) => r.status === 'parsed' && r.include).length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-6 text-center">
        <p className="text-sm font-medium">Select up to 100 .md / .mdx / .docx files</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Each file is auto-parsed into title, slug, excerpt, category, and tags — review below before publishing.</p>
        <input type="file" multiple accept=".md,.mdx,.docx,text/markdown" className="mt-3 block w-full text-sm" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
      </div>

      {summary && <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm">{summary}</div>}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">{rows.filter((r) => r.status === 'parsed').length} detected · {parsedCount} selected to publish</p>
            <button disabled={busy || parsedCount === 0} onClick={publishAll} className="rounded-xl bg-[var(--fg)] px-5 py-2.5 text-sm font-semibold text-[var(--bg)]">
              {busy ? 'Publishing…' : `🚀 Publish all (${parsedCount})`}
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--card)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr><th className="px-3 py-2"></th><th className="px-3 py-2">File</th><th className="px-3 py-2">Title</th><th className="px-3 py-2">Slug</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.filename} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2"><input type="checkbox" checked={r.include} onChange={(e) => updateRow(i, { include: e.target.checked })} disabled={r.status !== 'parsed'} /></td>
                    <td className="px-3 py-2 text-xs text-[var(--muted)]">{r.filename}</td>
                    <td className="px-3 py-2"><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm" value={r.title} onChange={(e) => updateRow(i, { title: e.target.value })} disabled={r.status !== 'parsed'} /></td>
                    <td className="px-3 py-2"><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm" value={r.slug} onChange={(e) => updateRow(i, { slug: e.target.value })} disabled={r.status !== 'parsed'} /></td>
                    <td className="px-3 py-2"><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm" value={r.category} onChange={(e) => updateRow(i, { category: e.target.value })} disabled={r.status !== 'parsed'} /></td>
                    <td className="px-3 py-2 text-xs">
                      {r.status === 'pending' && <span className="text-[var(--muted)]">Parsing…</span>}
                      {r.status === 'parsed' && <span className="text-amber-500">Ready</span>}
                      {r.status === 'published' && <span className="text-green-500">Published</span>}
                      {(r.status === 'error' || r.status === 'failed') && <span className="text-red-500" title={r.error}>Failed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
