'use client';
import { useEffect, useState } from 'react';
import { Link2, Printer, Twitter, Check } from 'lucide-react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
      <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress}%` }} />
    </div>
  );
}

export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function shareTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener');
  }

  const btn =
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] transition hover:bg-[var(--card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <div className="flex gap-2" role="group" aria-label="Share this article">
      <button onClick={shareTwitter} className={btn} aria-label="Share on Twitter"><Twitter size={16} /></button>
      <button onClick={copyLink} className={btn} aria-label="Copy link">
        {copied ? <Check size={16} className="text-secondary" /> : <Link2 size={16} />}
      </button>
      <button onClick={() => window.print()} className={btn} aria-label="Print article"><Printer size={16} /></button>
    </div>
  );
}
