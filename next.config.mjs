/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that should not be bundled by webpack
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Webpack configuration to fix "self is not defined" error
  webpack: (config, { isServer, dev }) => {
    // For client-side builds
    if (!isServer) {
      // Provide fallbacks for Node.js modules that don't exist in browsers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Define global variables for browser environment
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'typeof self': JSON.stringify('object'),
          'typeof window': JSON.stringify('object'),
          'typeof document': JSON.stringify('object'),
        })
      );
    }

    // Handle specific modules that might cause issues
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Ignore certain warnings that might appear during build
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { file: /node_modules/ },
    ];

    return config;
  },

  // Image configuration
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'images.unsplash.com',
      'unsplash.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Experimental features (adjust as needed)
  experimental: {
    // Only include if you need these experimental features
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  // Environment variables (if needed)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript configuration
  typescript: {
    // Set to true if you want production builds to continue even with TypeScript errors
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Set to true if you want production builds to continue even with ESLint errors
    ignoreDuringBuilds: false,
  },
}

export default nextConfig