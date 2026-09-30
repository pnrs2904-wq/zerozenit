import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { site } from '@/lib/site';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Analytics } from '@/components/analytics/analytics';
import { CookieConsent } from '@/components/consent/cookie-consent';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    type: 'website',
    url: site.url,
    title: site.name,
    description: site.description,
    siteName: site.name,
    images: [site.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    creator: site.twitter,
  },
  alternates: { canonical: site.url },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.description,
  };
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme'in localStorage)&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body className="font-sans">
        <Analytics />
        <a href="#main" className="skip-link">Skip to content</a>
        <Navbar />
        <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-5 pt-24">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
