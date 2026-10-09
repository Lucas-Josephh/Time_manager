import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: resolve(__dirname, '../..'),
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/auth/:path*',
            destination: 'http://localhost:3001/api/auth/:path*',
          },
        ]
      : [];
  },
};

export default nextConfig;
