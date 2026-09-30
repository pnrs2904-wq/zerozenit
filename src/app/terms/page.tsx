import type { Metadata } from 'next';
import { site } from '@/lib/site';
export const metadata: Metadata = { title: 'Terms of Service', alternates: { canonical: '/terms' } };
export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {new Date().getFullYear()}</p>
      <div className="prose mt-6 space-y-4 text-[var(--muted)]">
        <p>By using {site.name}, you agree to these terms.</p>
        <p><strong>Use of content.</strong> Content is provided for personal, non-commercial use. You may share links freely but may not republish articles without permission.</p>
        <p><strong>No warranty.</strong> Content is provided "as is" without warranties of any kind.</p>
        <p><strong>Third-party links.</strong> We link to external tools and sites we do not control and are not responsible for.</p>
      </div>
    </article>
  );
}
