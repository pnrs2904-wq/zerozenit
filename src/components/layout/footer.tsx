import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-[var(--fg)]">{site.name}</p>
          <p>{site.tagline}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><Link href="/privacy" className="hover:text-[var(--fg)]">Privacy</Link></li>
          <li><Link href="/terms" className="hover:text-[var(--fg)]">Terms</Link></li>
          <li><Link href="/disclaimer" className="hover:text-[var(--fg)]">Disclaimer</Link></li>
          <li><Link href="/contact" className="hover:text-[var(--fg)]">Contact</Link></li>
        </ul>
        <p>© {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  );
}
