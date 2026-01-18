import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['http://10.*', 'http://192.168.*', 'http://172.16.*'],
};

export default nextConfig;
