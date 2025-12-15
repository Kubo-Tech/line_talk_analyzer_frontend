import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Modeを有効化
  reactStrictMode: true,
  
  // 画像最適化の設定
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
