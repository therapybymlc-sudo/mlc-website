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
    formats: ['image/avif', 'image/webp'],
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
      {
        protocol: 'https',
        hostname: 'pub-44fb3c70deda4bc5957a44e78b993b98.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      '@chakra-ui/icons',
      'react-icons',
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
    ],
  },
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
