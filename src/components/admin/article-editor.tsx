'use client';
import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { computeSeoScore, suggestInternalLinks, type PostSummary } from '@/lib/article-tools';
import { categories } from '@/lib/site';
import { SeoChecklist } from './seo-checklist';

const input = 'w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none';

export interface PostFormState {
  title: string; slug: string; excerpt: string; category: string; tags: string; author: string;
  date: string; cover: string; ogImage: string; featured: boolean; draft: boolean; scheduledDate: string; content: string;
}

const empty: PostFormState = {
  title: '', slug: '', excerpt: '', category: categories[0], tags: '', author: 'ZeroZenit',
  date: new Date().toISOString().slice(0, 10), cover: '🧠', ogImage: '', featured: false, draft: false, scheduledDate: '', content: '',
};

export function ArticleEditor({ initial, existingPosts, onPublished }: { initial?: Partial<PostFormState>; existingPosts: PostSummary[]; onPublished?: () => void }) {
  const [post, setPost] = useState<PostFormState>({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(() => { setPost({ ...empty, ...initial }); }, [initial]);

  const tagList = useMemo(() => post.tags.split(',').map((t) => t.trim()).filter(Boolean), [post.tags]);

  const seo = useMemo(
    () => computeSeoScore({
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      coverImage: post.cover && post.cover.startsWith('/uploads') ? post.cover : undefined,
      internalLinks: (post.content.match(/\]\(/g) || []).length,
    }),
    [post.title, post.slug, post.excerpt, post.content, post.cover]
  );

  const related = useMemo(
    () => suggestInternalLinks({ category: post.category, tags: tagList, slug: post.slug }, existingPosts),
    [post.category, tagList, post.slug, existingPosts]
  );

  const previewHtml = useMemo(() => {
    try { return marked.parse(post.content || '*Nothing to preview yet.*', { async: false }) as string; }
    catch { return '<p>Preview error.</p>'; }
  }, [post.content]);

  async function handleFile(file: File) {
    setMessage('Reading file…');
    let text = '';
    if (/\.docx$/i.test(file.name)) {
      const base64 = await fileToBase64(file);
      const r = await fetch('/api/admin/docx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64 }) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error || 'DOCX conversion failed.'); return; }
      text = d.markdown;
    } else {
      text = await file.text();
    }
    setMessage('Extracting metadata…');
    const r2 = await fetch('/api/admin/parse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, filename: file.name, existingPosts }),
    });
    const parsed = await r2.json();
    if (!r2.ok) { setMessage(parsed.error || 'Could not parse file.'); return; }
    setPost((p) => ({
      ...p,
      title: parsed.title, slug: parsed.slug, excerpt: parsed.excerpt, category: parsed.category,
      tags: parsed.tags.join(', '), content: parsed.content,
    }));
    setMessage(`Metadata auto-filled from ${file.name}. Review before publishing.`);
  }

  async function handleImage(file: File) {
    setUploadingImage(true);
    const base64 = await fileToBase64(file);
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64, filename: file.name }) });
    const d = await r.json();
    setUploadingImage(false);
    if (!r.ok) { setMessage(d.error || 'Image upload failed.'); return; }
    setPost((p) => ({ ...p, cover: d.path, ogImage: d.path }));
  }

  async function submit(mode: 'publish' | 'draft') {
    setBusy(true); setMessage('');
    const payload = { ...post, tags: tagList, draft: mode === 'draft' };
    const r = await fetch('/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    setBusy(false);
    if (r.ok) {
      setMessage(post.scheduledDate && new Date(post.scheduledDate) > new Date()
        ? `Scheduled for ${new Date(post.scheduledDate).toLocaleString()}. It will auto-publish then.`
        : 'Published. Vercel will redeploy from GitHub.');
      onPublished?.();
    } else {
      setMessage(d.error || 'Something went wrong.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-6 text-center">
        <p className="text-sm font-medium">Upload article.md, article.mdx, or article.docx</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Title, slug, excerpt, category, tags &amp; reading time are auto-generated. Edit anything before publishing.</p>
        <input type="file" accept=".md,.mdx,.docx,text/markdown" className="mt-3 block w-full text-sm"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {message && <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm">{message}</div>}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm">Title<input className={input + ' mt-2'} value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} required /></label>
        <label className="text-sm">Slug<input className={input + ' mt-2'} value={post.slug} onChange={(e) => setPost({ ...post, slug: e.target.value })} required /></label>
        <label className="text-sm">Category
          <select className={input + ' mt-2'} value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm">Tags (comma-separated)<input className={input + ' mt-2'} value={post.tags} onChange={(e) => setPost({ ...post, tags: e.target.value })} /></label>
        <label className="text-sm md:col-span-2">Excerpt / meta description<input className={input + ' mt-2'} value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} required /></label>
        <label className="text-sm">Publish date<input type="date" className={input + ' mt-2'} value={post.date} onChange={(e) => setPost({ ...post, date: e.target.value })} /></label>
        <label className="text-sm">Schedule for later (optional)<input type="datetime-local" className={input + ' mt-2'} value={post.scheduledDate} onChange={(e) => setPost({ ...post, scheduledDate: e.target.value })} /></label>
      </div>

      <label className="block text-sm">Featured image
        <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
        <span className="mt-1 block text-xs text-[var(--muted)]">{uploadingImage ? 'Uploading…' : post.cover.startsWith('/uploads') ? `Using ${post.cover}` : 'Or leave as an emoji cover: '}</span>
        {!post.cover.startsWith('/uploads') && <input className={input + ' mt-1 max-w-[8rem]'} value={post.cover} onChange={(e) => setPost({ ...post, cover: e.target.value })} />}
      </label>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Content</h2>
        <button type="button" onClick={() => setPreview((p) => !p)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">{preview ? 'Hide preview' : 'Show preview'}</button>
      </div>
      <div className={`grid gap-3 ${preview ? 'md:grid-cols-2' : ''}`}>
        <textarea className={input + ' min-h-96 font-mono text-sm'} value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} placeholder="Write Markdown/MDX here…" required />
        {preview && (
          <div className="min-h-96 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}
      </div>

      <SeoChecklist seo={seo} />

      {related.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold">Related ZeroZenit articles — consider linking to these</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            {related.map((r) => <li key={r.slug}>• {r.title}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label><input type="checkbox" checked={post.featured} onChange={(e) => setPost({ ...post, featured: e.target.checked })} /> Featured</label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => submit('publish')} className="rounded-xl bg-[var(--fg)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">
          {busy ? 'Publishing…' : post.scheduledDate ? '🚀 Schedule article' : '🚀 Publish article'}
        </button>
        <button type="button" disabled={busy} onClick={() => submit('draft')} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold">Save draft</button>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
