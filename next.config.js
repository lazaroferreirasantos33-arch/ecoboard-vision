/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      outputFileTracingIncludes: {
        '/api/analyze/reference-test': [
          './public/catalog-assets/37.webp',
        ],
      },
    },
  };
  
  module.exports = nextConfig;