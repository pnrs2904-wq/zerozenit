import type { Metadata } from 'next';
import { NewsletterForm } from '@/components/ui/newsletter-form';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'One thoughtful email a week on focus, AI, and clear thinking.',
  alternates: { canonical: '/newsletter' },
};

export default function Newsletter() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="font-display text-4xl font-semibold">The weekly signal</h1>
      <p className="mt-3 text-[var(--muted)]">
        One thoughtful email each week. No noise. Double opt-in, unsubscribe anytime.
      </p>
      <div className="mt-8"><NewsletterForm /></div>
    </div>
  );
}
