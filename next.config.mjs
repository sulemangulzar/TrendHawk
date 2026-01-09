/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore build errors for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable compression for better performance
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Optimize CSS
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: [
      'playwright-extra',
      'puppeteer-extra-plugin-stealth',
      'playwright',
      '2captcha-api'
    ],
  },

  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    // Ignore crypto module warnings in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Suppress specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch/ },
      { module: /node_modules\/@lemonsqueezy/ },
    ];

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

