import {
  API_BASE,
  STATIC_PUBLIC_ROUTES,
  parseApiDate,
  toAbsoluteUrl,
} from '../lib/sitemapConfig';

const SITEMAP_REVALIDATE_SECONDS = 60 * 60; // 1 hour

async function fetchPublicTherapistEntries() {
  try {
    const response = await fetch(`${API_BASE}/therapists/public/`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

    return rows
      .filter((row) => row?.id)
      .map((row) => ({
        url: toAbsoluteUrl(`/therapists/${row.id}`),
        lastModified: parseApiDate(row.updated_at || row.created_at) || new Date(),
        changeFrequency: 'weekly',
        priority: 0.65,
      }));
  } catch (_error) {
    return [];
  }
}

async function fetchPublicBlogEntries() {
  try {
    const response = await fetch(`${API_BASE}/blog/public/posts/`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

    return rows
      .filter((post) => post?.slug && post?.status !== 'draft')
      .map((post) => ({
        url: toAbsoluteUrl(`/blog/${post.slug}`),
        lastModified:
          parseApiDate(post.published_at || post.updated_at || post.created_at) || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch (_error) {
    return [];
  }
}

export default async function sitemap() {
  const staticEntries = STATIC_PUBLIC_ROUTES.map((route) => ({
    url: toAbsoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [therapistEntries, blogEntries] = await Promise.all([
    fetchPublicTherapistEntries(),
    fetchPublicBlogEntries(),
  ]);

  const seen = new Set();
  const merged = [];

  for (const entry of [...staticEntries, ...therapistEntries, ...blogEntries]) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    merged.push(entry);
  }

  return merged.sort((a, b) => b.priority - a.priority);
}
