/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    // Ensure sharp is used in production
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig