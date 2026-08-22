import fs from 'fs';
import path from 'path';

export interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

export const PUBLIC_HOSPITAL_ROUTES: SitemapRoute[] = [
  {
    path: '',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    path: '#departments',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '#doctors',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '#booking',
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    path: '#patient-portal',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '#telehealth',
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    path: '#health-articles',
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    path: '#visitor-guide',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    path: '#emergency-guide',
    changefreq: 'monthly',
    priority: 0.8,
  }
];

export function generateSitemapXml(baseUrl: string = 'https://stjude-clinic.vercel.app'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const urls = PUBLIC_HOSPITAL_ROUTES.map(route => {
    const loc = route.path ? `${cleanBase}/${route.path}` : cleanBase;
    const lastmod = route.lastmod || today;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

// Write static sitemap.xml to public folder
export function writeStaticSitemap() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapXml = generateSitemapXml();
  const filePath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(filePath, sitemapXml, 'utf-8');
  console.log(`[Sitemap Generator] Successfully generated ${filePath}`);
}

// Execute if called directly from CLI
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/') || '')) {
  writeStaticSitemap();
}
