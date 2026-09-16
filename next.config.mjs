/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/modules/career',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/modules/resume',
        destination: '/resume',
        permanent: false,
      },
      {
        source: '/modules/profile',
        destination: '/profile',
        permanent: false,
      },
      {
        source: '/modules/assessment',
        destination: '/assessment',
        permanent: false,
      },
      {
        source: '/modules/coding',
        destination: '/coding',
        permanent: false,
      },
      {
        source: '/modules/interview',
        destination: '/assessment',
        permanent: false,
      },
      {
        source: '/modules/readiness',
        destination: '/feedback',
        permanent: false,
      },
      {
        source: '/modules/tech-interview',
        destination: '/assessment',
        permanent: false,
      },
      {
        source: '/modules/hr-interview',
        destination: '/assessment',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
