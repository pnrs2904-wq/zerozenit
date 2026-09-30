'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getConsent } from '@/components/consent/cookie-consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Loads GA4, Microsoft Clarity, and AdSense — but only after the visitor has
 * granted consent. Listens for the 'zz-consent' event from the cookie banner,
 * so scripts appear immediately when the user clicks Accept.
 */
export function Analytics() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (getConsent() === 'granted') setGranted(true);
    function onConsent(e: Event) {
      const detail = (e as CustomEvent).detail;
      setGranted(detail === 'granted');
    }
    window.addEventListener('zz-consent', onConsent);
    return () => window.removeEventListener('zz-consent', onConsent);
  }, []);

  if (!granted) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      )}

      {ADSENSE_CLIENT && (
        <Script
          id="adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
      )}
    </>
  );
}
