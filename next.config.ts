import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Lets a phone use the dev server through an ngrok tunnel.
  allowedDevOrigins: ["oil-sterility-cyclic.ngrok-free.dev"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
