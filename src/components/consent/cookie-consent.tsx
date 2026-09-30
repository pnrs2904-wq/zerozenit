'use client';
import { useEffect, useState } from 'react';

const KEY = 'zz-consent'; // 'granted' | 'denied'

/** Dispatched when the user makes a choice, so analytics scripts can react. */
function emitConsent(value: 'granted' | 'denied') {
  window.dispatchEvent(new CustomEvent('zz-consent', { detail: value }));
}

export function getConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  function choose(value: 'granted' | 'denied') {
    localStorage.setItem(KEY, value);
    emitConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="glass fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-[var(--border)] p-5 shadow-lg sm:flex sm:items-center sm:gap-4"
    >
      <p className="flex-1 text-sm text-[var(--muted)]">
        We use cookies for analytics and, if enabled, ads. You can accept or decline
        non-essential cookies. See our{' '}
        <a href="/privacy" className="text-accent underline underline-offset-2">Privacy Policy</a>.
      </p>
      <div className="mt-4 flex gap-2 sm:mt-0">
        <button
          onClick={() => choose('denied')}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--card)]"
        >
          Decline
        </button>
        <button
          onClick={() => choose('granted')}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
