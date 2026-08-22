/**
 * Canonical public routes for MLC Health sitemap generation.
 * Only include pages that should be indexed by search engines.
 * Auth, dashboard, admin, and checkout flows are excluded intentionally.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mlchealth.in'
).replace(/\/+$/, '');

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.mlchealth.in/api'
).replace(/\/+$/, '');

/** @typedef {{ path: string; changeFrequency: string; priority: number; lastModified?: Date }} SitemapRoute */

/** @type {SitemapRoute[]} */
export const STATIC_PUBLIC_ROUTES = [
  // Core
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/services', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/ecosystem', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/meettheteam', changeFrequency: 'monthly', priority: 0.75 },

  // Booking & intake
  { path: '/book', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/contactus', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/therapists/discovery', changeFrequency: 'weekly', priority: 0.9 },

  // Therapist discovery & recruitment
  { path: '/therapists', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/therapists/directory', changeFrequency: 'daily', priority: 0.85 },
  { path: '/therapists/supervisors', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/therapists/supervisors/directory', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/therapists/supervision-discovery', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/therapist-apply', changeFrequency: 'monthly', priority: 0.85 },

  // Clinical service pages
  { path: '/individual-therapy', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/couples-therapy', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/adolescent-therapy', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/supervision', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/workshops', changeFrequency: 'monthly', priority: 0.75 },

  // Resources & content
  { path: '/blog', changeFrequency: 'daily', priority: 0.85 },
  { path: '/feelings-wheel', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/careers', changeFrequency: 'monthly', priority: 0.7 },

  // Legal
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.5 },
];

export function toAbsoluteUrl(path) {
  const normalized = path === '/' ? '/' : path.endsWith('/') ? path : `${path}/`;
  return `${SITE_URL}${normalized}`;
}

export function parseApiDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
