import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base domain for St. Jude Clinic portal
const BASE_URL = process.env.SITE_URL || 'https://stjudeclinic.org';

// Public routes and specialties definition
const PUBLIC_PAGES = [
  { path: '', changefreq: 'daily', priority: 1.0, title: 'Home - St. Jude Medical Center' },
  { path: '#doctors', changefreq: 'weekly', priority: 0.9, title: 'Find Doctors & Medical Specialists' },
  { path: '#departments', changefreq: 'weekly', priority: 0.9, title: 'Clinical Departments & Centers of Excellence' },
  { path: '#patient-portal', changefreq: 'daily', priority: 0.8, title: 'MyChart Patient Portal & Secure Records' },
  { path: '#telehealth', changefreq: 'weekly', priority: 0.8, title: 'Virtual Consultations & Telehealth Care' },
  { path: '#emergency', changefreq: 'monthly', priority: 0.9, title: 'Level 1 Trauma & Emergency Services' },
  { path: '#health-library', changefreq: 'daily', priority: 0.8, title: 'Health Education Library & Clinical Articles' },
  { path: '#visitor-guide', changefreq: 'monthly', priority: 0.7, title: 'Visitor Guide, Parking & Hospital Policies' },
  { path: '#symptom-checker', changefreq: 'weekly', priority: 0.8, title: 'AI-Guided Clinical Triage & Symptom Checker' },
  { path: '#contact', changefreq: 'monthly', priority: 0.8, title: 'Contact, Location & Emergency Numbers' }
];

const CLINICAL_DEPARTMENTS = [
  'dept-cardio',
  'dept-neuro',
  'dept-onco',
  'dept-ortho',
  'dept-peds',
  'dept-er'
];

const CLINICAL_ARTICLES = [
  'art-1',
  'art-2',
  'art-3',
  'art-4'
];

const DOCTOR_SPECIALISTS = [
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6'
];

export function generateSitemapXml(baseUrl = BASE_URL) {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // 1. Primary Public Pages
  for (const page of PUBLIC_PAGES) {
    const loc = page.path ? `${baseUrl}/${page.path}` : `${baseUrl}/`;
    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>
`;
  }

  // 2. Department Specific Pages
  for (const dept of CLINICAL_DEPARTMENTS) {
    xml += `  <url>
    <loc>${baseUrl}/#department-${dept}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // 3. Health Education Articles
  for (const art of CLINICAL_ARTICLES) {
    xml += `  <url>
    <loc>${baseUrl}/#article-${art}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  // 4. Doctor Profiles
  for (const doc of DOCTOR_SPECIALISTS) {
    xml += `  <url>
    <loc>${baseUrl}/#doctor-${doc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// Generate file in /public/sitemap.xml
try {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapContent = generateSitemapXml();
  const targetFile = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(targetFile, sitemapContent, 'utf8');
  console.log(`[SEO] Sitemap successfully generated at: ${targetFile}`);
} catch (err) {
  console.error('[SEO] Error generating sitemap.xml:', err);
}
