import type { Metadata } from 'next';
import { site } from '@/lib/site';
export const metadata: Metadata = { title: 'Disclaimer', alternates: { canonical: '/disclaimer' } };
export default function Disclaimer() {
  return (
    <article className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-semibold">Disclaimer</h1>
      <div className="prose mt-6 space-y-4 text-[var(--muted)]">
        <p>The information on {site.name} is for general educational purposes only and is not professional, medical, financial, or legal advice.</p>
        <p><strong>Affiliate disclosure.</strong> Some links may be affiliate links, meaning we may earn a commission at no extra cost to you.</p>
        <p><strong>Tool reviews.</strong> Reviews reflect our opinions at the time of writing; features and pricing change.</p>
      </div>
    </article>
  );
}
