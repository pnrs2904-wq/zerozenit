import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-32 text-center">
      <p className="font-display text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-[var(--muted)]">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">Back home</Link>
    </div>
  );
}
