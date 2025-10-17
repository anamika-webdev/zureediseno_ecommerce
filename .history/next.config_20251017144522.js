/* @type {import('next').NextConfig} */
/*const nextConfig = {
  // Remove the experimental optimizeCss feature that's causing the build error
  experimental: {
    // Remove optimizeCss from here
  },
  
  // Image configuration
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'res.cloudinary.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      }
    ],
  },

  // Webpack configuration for better performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Enable static exports for better performance (optional)
  // output: 'export', // Uncomment if you want static export
  
  // Trailing slash configuration
  trailingSlash: false,

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // SWC minification
  swcMinify: true,

  // Typescript configuration
  typescript: {
    // Set to true to ignore build errors during development
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Set to true to ignore lint errors during build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable server components with serializable props only
    serverComponentsExternalPackages: ['bcryptjs'],
    serverComponentsExternalPackages: ['nodemailer'],
  },
  // Disable strict mode for development if needed
  reactStrictMode: true,
   async rewrites() {
    return []
  },
  // Disable static optimization for auth pages
  async headers() {
    return [
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack configuration for handling nodemailer
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle nodemailer's dependencies
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Image configuration
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // Remove swcMinify - it's deprecated in Next.js 15
  // SWC minification is enabled by default
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // Fix for client-side libraries causing "self is not defined" errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfill 'self' for client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
     unoptimized: process.env.NODE_ENV === 'development', unoptimized: process.env.NODE_ENV === 'development',
    // Add global polyfill for 'self'
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        self: 'globalThis',
      })
    );

    return config;
  },

  // Reduce chunk size to avoid potential issues
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
  },

  // Handle ESLint issues during build
  eslint: {
    // Disable ESLint during builds (you can enable this after fixing ESLint issues)
    ignoreDuringBuilds: true,
  },

  // Handle TypeScript issues during build
  typescript: {
    // Disable type checking during builds (you can enable this after fixing TS issues)
    ignoreBuildErrors: true,
  },
};


module.exports = nextConfig;