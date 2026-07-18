import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/constants';

const SITE_URL = 'https://toolnode.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/tools',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...toolRoutes];
}
