import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Authorization codes must not appear in development request logs.
  ...((process.env.HUB_SSO_LOCAL === 'true'||process.env.HUB_SSO_MODE) ? {logging:{incomingRequests:false}} : {}),
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
