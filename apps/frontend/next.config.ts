import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const nextConfig: NextConfig = {
  output: process.env.VERCEL === '1' ? undefined : 'standalone',
  outputFileTracingRoot: resolve(__dirname, '../..'),
};

export default nextConfig;
