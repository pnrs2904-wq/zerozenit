'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const nav = [
  { href: '/blog', label: 'Blog' },
  { href: '/tools', label: 'AI Tools' },
  { href: '/about', label: 'About' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="rounded-full border border-[var(--border)] p-2"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="glass absolute inset-x-0 top-full border-t border-[var(--border)]">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
