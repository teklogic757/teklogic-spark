import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental devtools to fix "SegmentViewNode" error
  devIndicators: false,
};

export default nextConfig;
