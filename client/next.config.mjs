/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'another-domain.com'],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;