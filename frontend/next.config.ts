import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${process.env.API_URL || 'http://localhost:3001'}/:path*`,
    },
  ],
}

export default nextConfig
