import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the ZeroZenit team.',
  alternates: { canonical: '/contact' },
};

export default function Contact() {
  return (
    <div className="mx-auto max-w-xl py-12">
      <h1 className="font-display text-4xl font-semibold">Contact</h1>
      <p className="mt-2 text-[var(--muted)]">Questions, feedback, or partnership ideas — send a note.</p>
      <ContactForm />
    </div>
  );
}
