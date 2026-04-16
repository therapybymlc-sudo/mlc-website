/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mlchealth.in'],
  },
  // Since we are migrating, we might want to handle trailing slashes
  trailingSlash: true,
};

module.exports = nextConfig;
