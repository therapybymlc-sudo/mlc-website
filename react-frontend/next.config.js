/** @type {import('next').NextConfig} */

function normalizeClerkDomain(value) {
  return (value || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

const clerkDomain = normalizeClerkDomain(process.env.NEXT_PUBLIC_CLERK_DOMAIN);

const nextConfig = {
  reactStrictMode: true,
  env: {
    // Clerk expects hostname only — https:// prefix causes clerk.https//... URLs
    ...(clerkDomain ? { NEXT_PUBLIC_CLERK_DOMAIN: clerkDomain } : {}),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mlchealth.in',
      },
      {
        protocol: 'https',
        hostname: 'www.mlchealth.in',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'kommodo.ai',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  trailingSlash: true,
};

module.exports = nextConfig;
