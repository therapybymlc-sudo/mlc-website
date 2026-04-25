const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mlchealth.in').replace(/\/+$/, '');

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/login',
          '/signup',
          '/conference',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
