import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ??
      'mysql://build:placeholder@localhost:3306/placeholder',
  },
};

export default nextConfig;
