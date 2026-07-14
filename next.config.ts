import type { NextConfig } from "next";

/**
 * 允許以區網 IP 連入 dev server（否則 _next 靜態資源／HMR 會被擋，
 * 造成外部裝置版面錯亂、按鈕與抽屜無法點）。
 *
 * 可用環境變數覆寫，逗號分隔，例如：
 *   ALLOWED_DEV_ORIGINS=192.168.33.85,192.168.1.20
 */
const envOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  // 綁定 0.0.0.0 時，仍需明確允許來源 hostname
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.33.85", ...envOrigins],

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
