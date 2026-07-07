import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],
  async rewrites() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/dashboard',
      },
      {
        source: '/student/dashboard',
        destination: '/dashboard',
      },
    ];
  },
};

export default nextConfig;
