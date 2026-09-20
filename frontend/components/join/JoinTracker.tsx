'use client';

import { useEffect } from 'react';
import { captureCampaign } from '@/lib/tracking/campaign';
import { trackOnce } from '@/lib/tracking/analytics';

/** Capture la campagne (utm_*, ref) puis trace la vue de page. Ne rend rien. */
export default function JoinTracker() {
  useEffect(() => {
    captureCampaign();
    trackOnce('landing_page_view');
  }, []);
  return null;
}
