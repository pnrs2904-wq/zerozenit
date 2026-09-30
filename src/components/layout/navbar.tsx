import Link from 'next/link';
import { site } from '@/lib/site';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/search/command-palette';

const nav = [
  { href: '/blog', label: 'Blog' },
  { href: '/tools', label: 'AI Tools' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {site.name}
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-[var(--muted)] transition hover:text-[var(--fg)]">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <CommandPalette />
          <ThemeToggle />
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
