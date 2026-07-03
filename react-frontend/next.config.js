/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Clerk SSR breaks if NEXT_PUBLIC_CLERK_PROXY_URL is set at build time.
  // Preview proxy is handled by src/proxy.js + ClerkProviderWrapper instead.
  env: {
    NEXT_PUBLIC_CLERK_PROXY_URL: '',
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
  // Since we are migrating, we might want to handle trailing slashes
  trailingSlash: true,
};

module.exports = nextConfig;
