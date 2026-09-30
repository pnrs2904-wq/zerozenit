'use client';
import { useEffect } from 'react';

/** Reusable AdSense slot. Renders nothing until a client id is configured. */
export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    if (!client) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [client]);
  if (!client) return null;
  return (
    <ins
      className="adsbygoogle block"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
