const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mlchealth.in').replace(/\/+$/, '');
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://api.mlchealth.in/api').replace(/\/+$/, '');

const STATIC_PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/book',
  '/book/checkout',
  '/contactus',
  '/careers',
  '/individual-therapy',
  '/couples-therapy',
  '/adolescent-therapy',
  '/supervision',
  '/workshops',
  '/meettheteam',
  '/therapists',
  '/therapists/discovery',
  '/therapists/directory',
  '/therapists/supervisors',
  '/therapists/supervisors/directory',
  '/therapists/supervision-discovery',
  '/therapist-apply',
  '/privacy',
  '/terms',
];

async function fetchPublicTherapistRoutes() {
  try {
    const response = await fetch(`${API_BASE}/therapists/public/`, {
      // Keep sitemap generation reasonably fresh.
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
    return rows
      .map((row) => row?.id)
      .filter(Boolean)
      .map((id) => `/therapists/${id}`);
  } catch (_error) {
    // Never fail sitemap generation if API is temporarily unavailable.
    return [];
  }
}

export default async function sitemap() {
  const therapistRoutes = await fetchPublicTherapistRoutes();
  const allRoutes = Array.from(new Set([...STATIC_PUBLIC_ROUTES, ...therapistRoutes]));

  return allRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route.startsWith('/therapists') ? 0.8 : 0.7,
  }));
}
