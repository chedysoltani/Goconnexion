'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { PLAUSIBLE_DOMAIN, META_PIXEL_ID } from '@/lib/tracking/providers';
import { CONSENT_CHANGE_EVENT, getConsent } from '@/lib/tracking/consent';

/**
 * Charge les scripts de mesure :
 * - Plausible : toujours, dès le chargement — ne pose aucun cookie, rien à consentir.
 * - Meta Pixel : seulement si l'utilisateur a accepté le bandeau de cookies (il pose un cookie
 *   publicitaire). Se charge aussi rétroactivement si le consentement est donné après coup, sans
 *   recharger la page.
 *
 * Une fois le Pixel chargé, trackEvent() (lib/tracking/analytics.ts) lui relaie déjà automatiquement
 * tous les événements du tunnel (fbq('trackCustom', …)) — rien à changer côté appelants.
 */
export default function AnalyticsScripts() {
  const [pixelAllowed, setPixelAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setPixelAllowed(getConsent() === 'accepted');
    sync();
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);

  return (
    <>
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      {pixelAllowed && (
        <Script
          id="meta-pixel-base"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      {pixelAllowed && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
      <SpaPageviewTracker />
    </>
  );
}

/**
 * Next.js (App Router) ne recharge pas la page en navigant : les scripts ci-dessus ne voient que
 * la toute première vue. On redéclenche un "pageview" à chaque changement de route côté client.
 */
function SpaPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams?.toString() ?? ''}`;
  // Le tout premier rendu est déjà compté par les scripts de base ci-dessus (fbq('track','PageView')
  // et le pageview automatique de Plausible) : on ne retrace qu'à partir du changement suivant.
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (typeof window.plausible === 'function') window.plausible('pageview');
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  }, [url]);

  return null;
}
