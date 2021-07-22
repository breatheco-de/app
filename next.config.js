// const nextRuntimeDotenv = require('next-runtime-dotenv');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// NOTE: nextRuntimeDotenv not have a good documentation
// const withConfig = nextRuntimeDotenv({
//   // path: '.env',
//   public: ['MY_API_URL', 'NEXT_PUBLIC_ID'],
//   server: ['GITHUB_TOKEN'],
// });

module.exports = withBundleAnalyzer({
  // rest of config here
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    GITHUB_TOKEN: process.env.GITHUB_TOKEN, // Pass through env variables
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    MY_API_URL: process.env.MY_API_URL,
    NEXT_PUBLIC_ID: process.env.NEXT_PUBLIC_ID,
  },
});
