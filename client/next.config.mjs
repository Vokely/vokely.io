const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'storage.googleapis.com' },
      { hostname: 'vokely.io' },
    ],
  },
  reactStrictMode: false,

  generateBuildId: async () => {
      // This makes every build unique to avoid caching issues
      return `build-${Date.now()}`;
  },
  // Force sitemap to regenerate on build
  productionBrowserSourceMaps: true,

  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Add rewrites to handle roadmap page
  async rewrites() {
    return [
      {
        source: '/learning-roadmap',
        destination: '/roadmap',
      },
    ];
  },
};

export default nextConfig;
