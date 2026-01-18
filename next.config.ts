import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['10.*', '192.168.*', '172.16.*', '10.117.17.232'],
};

export default nextConfig;
