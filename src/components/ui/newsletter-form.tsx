'use client';
import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('error');
      return;
    }
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'ok' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <input
        id="nl-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-5 py-3 text-sm outline-none focus:border-accent"
        required
      />
      <button className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
        Subscribe
      </button>
      {status === 'ok' && <p role="status" className="text-sm text-secondary">Check your inbox to confirm.</p>}
      {status === 'error' && <p role="alert" className="text-sm text-red-500">Enter a valid email.</p>}
    </form>
  );
}
