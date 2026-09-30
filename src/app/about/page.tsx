import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${site.name} — where ancient wisdom, AI, and deep focus meet.`,
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-semibold">About {site.name}</h1>
      <div className="prose mt-6 space-y-4 text-lg leading-relaxed text-[var(--muted)]">
        <p>
          {site.name} exists for people who want to think clearly in a distracted age. We draw on three
          sources: the durable insights of ancient philosophy, the leverage of modern AI, and the
          discipline of deep focus.
        </p>
        <p>
          Everything here is written to be useful, not merely interesting — practical systems you can
          apply this week, and honest reviews of the tools worth your attention.
        </p>
      </div>
    </div>
  );
}
