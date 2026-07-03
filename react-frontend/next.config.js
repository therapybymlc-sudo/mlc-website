/** @type {import('next').NextConfig} */

const isVercelProduction = process.env.VERCEL_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  env: {
    // Clerk SSR breaks if NEXT_PUBLIC_CLERK_PROXY_URL is set at build time.
    NEXT_PUBLIC_CLERK_PROXY_URL: '',
    // Satellite domain (accounts.mlchealth.in) only applies to production.
    // On Preview builds, these vars cause CORS failures and broken /__clerk proxy.
    ...(!isVercelProduction
      ? {
          NEXT_PUBLIC_CLERK_IS_SATELLITE: '',
          NEXT_PUBLIC_CLERK_DOMAIN: '',
          NEXT_PUBLIC_CLERK_SIGN_IN_URL: '',
          NEXT_PUBLIC_CLERK_SIGN_UP_URL: '',
        }
      : {}),
  },
  async rewrites() {
    return [
      {
        source: '/__clerk/:path*',
        destination: '/api/clerk/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mlchealth.in',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
