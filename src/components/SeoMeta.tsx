import { useEffect } from 'react';

interface SeoMetaProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  robots?: string;
  isPrivateEmr?: boolean;
}

export default function SeoMeta({
  title = 'St. Jude Clinic — Premier Smart Hospital & Electronic Medical Center',
  description = 'St. Jude Clinic is an accredited tertiary medical center providing world-class cardiology, neurology, oncology, pediatrics, 24/7 Level 1 emergency trauma care, telehealth, and AI clinical diagnostics.',
  canonicalUrl = 'https://stjudeclinic.org/',
  robots,
  isPrivateEmr = false
}: SeoMetaProps) {
  useEffect(() => {
    // 1. Dynamic Page Title
    const finalTitle = isPrivateEmr 
      ? 'St. Jude Clinic — Secure Clinical EMR Operations' 
      : title;
    document.title = finalTitle;

    // 2. Meta Description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = isPrivateEmr
      ? 'Protected Health Information & Clinical Operations Console for Authorized St. Jude Hospital Staff.'
      : description;

    // 3. Robots Indexing Directives (Protect PHI in EMR mode)
    let metaRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    const finalRobots = isPrivateEmr
      ? 'noindex, nofollow, noarchive, nosnippet'
      : (robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    metaRobots.content = finalRobots;

    // 4. Canonical Link Tag
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = isPrivateEmr 
      ? 'https://stjudeclinic.org/emr' 
      : canonicalUrl;

    // 5. Open Graph Title & Description
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = finalTitle;

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = metaDesc.content;

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = linkCanonical.href;

  }, [title, description, canonicalUrl, robots, isPrivateEmr]);

  return null;
}
