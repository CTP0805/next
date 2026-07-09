import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.daisyui.com", // 💡 告訴 Next.js 放行 daisyUI 的圖片網域
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
