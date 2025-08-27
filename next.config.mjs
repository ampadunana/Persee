/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: false },
  // No custom headers for favicons; let the default caching apply
};

export default nextConfig;
