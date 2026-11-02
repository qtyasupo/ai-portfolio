import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The local collector owns these mutable files and may hold Windows file locks.
  // Cloud deployments only need the explicitly exported public snapshot.
  outputFileTracingExcludes: {
    "/*": ["./.radar/**/*", "./tests/**/*", "./scripts/**/*", "./docs/**/*"],
  },
};

export default nextConfig;
