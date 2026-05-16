import type { NextConfig } from 'next'
import { API_URL } from './lib/config'

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${API_URL}/:path*`,
    },
  ],
}

export default nextConfig
