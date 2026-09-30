'use client';
import { useEffect, useState } from 'react';
import { Dashboard } from '@/components/admin/dashboard';
import { ArticleEditor, type PostFormState } from '@/components/admin/article-editor';
import { ArticleList } from '@/components/admin/article-list';
import { BulkUpload } from '@/components/admin/bulk-upload';
import { ContentCalendar } from '@/components/admin/calendar';
import type { PostSummary } from '@/lib/article-tools';

const input = 'w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none';

type Tab = 'dashboard' | 'editor' | 'articles' | 'bulk' | 'calendar' | 'product' | 'tool';

function toLocalInputValue(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editorInitial, setEditorInitial] = useState<Partial<PostFormState> | undefined>(undefined);
  const [editorKey, setEditorKey] = useState(0);
  const [existingPosts, setExistingPosts] = useState<PostSummary[]>([]);

  const [product, setProduct] = useState<any>({ name: '', slug: '', description: '', category: 'Digital Product', price: '', salePrice: '', currency: 'INR', image: '📘', purchaseUrl: '', downloadUrl: '', featured: false, active: true });
  const [tool, setTool] = useState<any>({ name: '', slug: '', logo: '🤖', description: '', category: 'AI', pricing: 'Freemium', url: '', rating: '4' });

  useEffect(() => { fetch('/api/admin/session').then((r) => r.json()).then((d) => setAuthed(Boolean(d.authenticated))).catch(() => setAuthed(false)); }, []);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/posts').then((r) => r.json()).then((d) => {
      const posts = (d.posts || []).map((p: any) => ({ slug: p.slug, title: p.title, category: p.category, tags: p.tags || [] }));
      setExistingPosts(posts);
    }).catch(() => {});
  }, [authed, refreshKey]);

  if (authed === null) return <div className="py-16 text-sm text-[var(--muted)]">Loading admin…</div>;
  if (!authed) return <div className="py-16"><a href="/admin/login" className="rounded-xl bg-[var(--fg)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">Open admin login</a></div>;

  async function submit(url: string, data: any, label: string) {
    setBusy(true); setMessage('');
    const payload = { ...data };
    if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((x: string) => x.trim()).filter(Boolean);
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    setBusy(false);
    setMessage(r.ok ? `${label} published. Vercel will redeploy from GitHub.` : (d.error || 'Something went wrong.'));
  }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); location.href = '/admin/login'; }

  function openNewArticle() { setEditorInitial(undefined); setEditorKey((k) => k + 1); setTab('editor'); }

  async function openEditArticle(slug: string) {
    const d = await (await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`)).json();
    setEditorInitial({
      title: d.title, slug: d.slug, excerpt: d.excerpt, category: d.category, tags: (d.tags || []).join(', '),
      author: d.author, date: d.date ? new Date(d.date).toISOString().slice(0, 10) : '', cover: d.cover || '🧠',
      ogImage: d.ogImage || '', featured: Boolean(d.featured), draft: Boolean(d.draft),
      scheduledDate: toLocalInputValue(d.scheduledDate), content: d.content,
    });
    setEditorKey((k) => k + 1);
    setTab('editor');
  }

  async function openDuplicateArticle(slug: string) {
    const d = await (await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`)).json();
    setEditorInitial({
      title: `${d.title} (Copy)`, slug: `${d.slug}-copy`, excerpt: d.excerpt, category: d.category, tags: (d.tags || []).join(', '),
      author: d.author, date: new Date().toISOString().slice(0, 10), cover: d.cover || '🧠', ogImage: d.ogImage || '',
      featured: false, draft: true, scheduledDate: '', content: d.content,
    });
    setEditorKey((k) => k + 1);
    setTab('editor');
  }

  const tabs: [Tab, string][] = [
    ['dashboard', '📊 Dashboard'], ['editor', '+ New article'], ['articles', '📝 Manage articles'],
    ['bulk', '📦 Bulk upload'], ['calendar', '📅 Calendar'], ['product', '🛍️ Digital product'], ['tool', '🤖 AI tool'],
  ];

  return (
    <main className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-accent">ZeroZenit CMS</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Content Studio</h1>
          <p className="mt-2 text-[var(--muted)]">Daily publishing, powered by your GitHub-backed site.</p>
        </div>
        <button onClick={logout} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Sign out</button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => (k === 'editor' ? openNewArticle() : setTab(k))} className={`rounded-xl px-4 py-2 text-sm ${tab === k ? 'bg-[var(--fg)] text-[var(--bg)]' : 'border border-[var(--border)]'}`}>{l}</button>
        ))}
      </div>

      {message && <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">{message}</div>}

      <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        {tab === 'dashboard' && <Dashboard refreshKey={refreshKey} onQuickAction={(t) => (t === 'editor' ? openNewArticle() : setTab(t as Tab))} />}

        {tab === 'editor' && (
          <div>
            <h2 className="font-display text-2xl font-semibold">{editorInitial ? 'Edit article' : 'Publish article'}</h2>
            <div className="mt-5">
              <ArticleEditor key={editorKey} initial={editorInitial} existingPosts={existingPosts} onPublished={() => { setRefreshKey((k) => k + 1); setTab('articles'); }} />
            </div>
          </div>
        )}

        {tab === 'articles' && (
          <div>
            <h2 className="font-display text-2xl font-semibold">Manage articles</h2>
            <div className="mt-5">
              <ArticleList refreshKey={refreshKey} onEdit={openEditArticle} onDuplicate={openDuplicateArticle} />
            </div>
          </div>
        )}

        {tab === 'bulk' && (
          <div>
            <h2 className="font-display text-2xl font-semibold">Bulk upload</h2>
            <div className="mt-5">
              <BulkUpload existingPosts={existingPosts} onPublished={() => setRefreshKey((k) => k + 1)} />
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <h2 className="font-display text-2xl font-semibold">Content calendar</h2>
            <div className="mt-5"><ContentCalendar refreshKey={refreshKey} /></div>
          </div>
        )}

        {tab === 'product' && (
          <form onSubmit={(e) => { e.preventDefault(); submit('/api/admin/products', product, 'Product'); }} className="space-y-5">
            <h2 className="font-display text-2xl font-semibold">Add digital product</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm">Product name<input className={input + ' mt-2'} value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required /></label>
              <label className="text-sm">Slug<input className={input + ' mt-2'} value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} required /></label>
              <label className="text-sm">Category<input className={input + ' mt-2'} value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} /></label>
              <label className="text-sm">Price<input type="number" className={input + ' mt-2'} value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} /></label>
              <label className="text-sm md:col-span-2">Description<textarea className={input + ' mt-2 min-h-32'} value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} required /></label>
              <label className="text-sm">Cover / emoji<input className={input + ' mt-2'} value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })} /></label>
              <label className="text-sm">Purchase URL<input className={input + ' mt-2'} value={product.purchaseUrl} onChange={(e) => setProduct({ ...product, purchaseUrl: e.target.value })} /></label>
              <label className="text-sm md:col-span-2">Download/access URL<input className={input + ' mt-2'} value={product.downloadUrl} onChange={(e) => setProduct({ ...product, downloadUrl: e.target.value })} /></label>
            </div>
            <div className="flex gap-5 text-sm">
              <label><input type="checkbox" checked={product.featured} onChange={(e) => setProduct({ ...product, featured: e.target.checked })} /> Featured</label>
              <label><input type="checkbox" checked={product.active} onChange={(e) => setProduct({ ...product, active: e.target.checked })} /> Active</label>
            </div>
            <button disabled={busy} className="rounded-xl bg-[var(--fg)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">{busy ? 'Saving…' : 'Save product'}</button>
          </form>
        )}

        {tab === 'tool' && (
          <form onSubmit={(e) => { e.preventDefault(); submit('/api/admin/tools', tool, 'AI tool'); }} className="space-y-5">
            <h2 className="font-display text-2xl font-semibold">Add AI tool</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm">Name<input className={input + ' mt-2'} value={tool.name} onChange={(e) => setTool({ ...tool, name: e.target.value })} required /></label>
              <label className="text-sm">Slug<input className={input + ' mt-2'} value={tool.slug} onChange={(e) => setTool({ ...tool, slug: e.target.value })} required /></label>
              <label className="text-sm">Category<input className={input + ' mt-2'} value={tool.category} onChange={(e) => setTool({ ...tool, category: e.target.value })} /></label>
              <label className="text-sm">Pricing
                <select className={input + ' mt-2'} value={tool.pricing} onChange={(e) => setTool({ ...tool, pricing: e.target.value })}>
                  <option>Free</option><option>Freemium</option><option>Paid</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">Official URL<input type="url" className={input + ' mt-2'} value={tool.url} onChange={(e) => setTool({ ...tool, url: e.target.value })} required /></label>
              <label className="text-sm md:col-span-2">Description<textarea className={input + ' mt-2 min-h-32'} value={tool.description} onChange={(e) => setTool({ ...tool, description: e.target.value })} /></label>
            </div>
            <button disabled={busy} className="rounded-xl bg-[var(--fg)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">{busy ? 'Saving…' : 'Save AI tool'}</button>
          </form>
        )}
      </section>
    </main>
  );
}
