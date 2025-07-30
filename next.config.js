/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'via.placeholder.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig
