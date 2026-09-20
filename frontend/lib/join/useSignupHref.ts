'use client';

import { useEffect, useState } from 'react';
import { CAMPAIGN_CHANGE_EVENT, getCampaign, type CampaignData } from '@/lib/tracking/campaign';
import { buildSignupHref, SELECT_ROLE_PATH } from './funnel';

/**
 * Campagne courante (utm_*, ref, profil choisi). Vide au rendu serveur puis synchronisée côté
 * client ; se met à jour quand un profil est choisi ailleurs sur la page.
 */
export function useCampaign(): CampaignData {
  const [campaign, setCampaign] = useState<CampaignData>({});

  useEffect(() => {
    const sync = () => setCampaign(getCampaign());
    sync();
    window.addEventListener(CAMPAIGN_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CAMPAIGN_CHANGE_EVENT, sync);
  }, []);

  return campaign;
}

/**
 * Lien d'inscription à jour : `SELECT_ROLE_PATH` au rendu serveur (fonctionne sans JS),
 * puis enrichi avec la campagne capturée et le profil éventuellement choisi.
 */
export function useSignupHref(): string {
  const campaign = useCampaign();
  return Object.keys(campaign).length ? buildSignupHref(campaign) : SELECT_ROLE_PATH;
}
