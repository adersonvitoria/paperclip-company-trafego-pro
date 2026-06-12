/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Os agentes leem os .md do pacote (agents/, skills/) em runtime — incluir no bundle serverless
    outputFileTracingIncludes: {
      '/**': ['./agents/**/*', './skills/**/*', './projects/**/*'],
    },
  },
};

export default nextConfig;
