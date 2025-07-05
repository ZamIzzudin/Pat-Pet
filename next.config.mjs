/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Terser error with HeartbeatWorker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  // Disable SWC minifier to avoid Terser issues
  swcMinify: false,
  // Use Terser with proper configuration
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      // Your specific Pinata gateway
      {
        protocol: 'https',
        hostname: 'emerald-quiet-bobcat-167.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      // General Pinata gateway
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      // All Pinata custom gateways (wildcard)
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      // Other common IPFS gateways (optional)
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
};

export default nextConfig;