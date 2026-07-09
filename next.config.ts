/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: "https",
        hostname: "img.daisyui.com", // 💡 告訴 Next.js 放行 daisyUI 的圖片網域
        port: "",
        pathname: "/**",
      },
    ],
  },
    // 允許 SVG（placehold.co 預設回傳 SVG）
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }

export default nextConfig;