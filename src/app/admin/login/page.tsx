'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); const r = await fetch('/api/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({password}) }); const d = await r.json(); setBusy(false); if (!r.ok) return setError(d.error || 'Login failed'); router.push('/admin'); }
  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center py-16"><form onSubmit={submit} className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm"><p className="text-sm text-accent">ZeroZenit</p><h1 className="mt-2 font-display text-3xl font-semibold">Admin login</h1><p className="mt-2 text-sm text-[var(--muted)]">Manage articles, digital products and AI tools.</p><label className="mt-8 block text-sm font-medium">Admin password<input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none" /></label>{error && <p className="mt-3 text-sm text-red-500">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-[var(--fg)] px-4 py-3 text-sm font-semibold text-[var(--bg)] disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button></form></main>;
}
