/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 's3.amazonaws.com', 'storage.googleapis.com'],
  },
}

module.exports = nextConfig
