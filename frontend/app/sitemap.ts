import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-03-17'),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date('2026-03-17'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}