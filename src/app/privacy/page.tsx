import type { Metadata } from 'next';
import { site } from '@/lib/site';
export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };
export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {new Date().getFullYear()}</p>
      <div className="prose mt-6 space-y-4 text-[var(--muted)]">
        <p>{site.name} respects your privacy. This policy explains what we collect and why.</p>
        <p><strong>Information we collect.</strong> Email addresses you submit to the newsletter or contact form, and anonymous analytics via Google Analytics 4 (page views, general location, device type).</p>
        <p><strong>Cookies.</strong> We use essential cookies and, with consent, analytics cookies. You can manage these through the cookie banner.</p>
        <p><strong>Advertising.</strong> We may display ads through Google AdSense, which uses cookies to serve relevant ads. You can opt out via Google Ad Settings.</p>
        <p><strong>Your rights.</strong> You may request access to or deletion of your data by contacting us.</p>
      </div>
    </article>
  );
}
