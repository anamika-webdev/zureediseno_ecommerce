/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'images.unsplash.com',
      'unsplash.com'
    ]
  }
}

export default nextConfig