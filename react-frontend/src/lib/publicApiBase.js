/**
 * Base URL for public Django API routes (includes trailing /api segment).
 * Matches sitemap + avoids localhost during production/CI builds when env is unset.
 */
export function getPublicApiBase() {
  const fromBase = process.env.NEXT_PUBLIC_API_BASE;
  if (fromBase) return fromBase.replace(/\/+$/, '');
  const fromUrl = process.env.NEXT_PUBLIC_API_URL;
  if (fromUrl) {
    const base = fromUrl.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return 'https://api.mlchealth.in/api';
}
