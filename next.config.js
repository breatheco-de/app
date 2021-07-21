const nextRuntimeDotenv = require('next-runtime-dotenv');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withConfig = nextRuntimeDotenv({
  // path: '.env',
  public: ['MY_API_URL'],
  server: ['GITHUB_TOKEN'],
});

module.exports = withBundleAnalyzer(
  withConfig({
    // rest of config here
    reactStrictMode: true,
  }),
);
