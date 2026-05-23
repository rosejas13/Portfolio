import type { NextConfig } from 'next'
import { API_URL } from './lib/config'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: '.',
  rewrites: async () => [
    {
      source: '/api/slack/:path*',
      destination: '/api/slack/:path*',
    },
    {
      source: '/api/leads',
      destination: '/api/leads',
    },
    {
      source: '/api/leads/delete',
      destination: '/api/leads/delete',
    },
    {
      source: '/api/:path*',
      destination: `${API_URL}/:path*`,
    },
  ],
}

export default nextConfig
