import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⭕️ 補上這段：徹底關閉左下角煩人的「N」開發工具貼片
  devIndicators: false,
  images: {
    // 1. 安全設定（原本的設定）
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.daisyui.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
