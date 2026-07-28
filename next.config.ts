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

  // ⭕️ 徹底關閉左下角煩人的「N」開發工具貼片
  devIndicators: false,

  images: {
    // 1. 允許 Next.js 圖片最佳化器讀取本機／私人 IP 圖片
    // 僅建議用於可信任的本機開發環境。
    dangerouslyAllowLocalIP: true,

    // 2. 安全設定（原本的設定）
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      // 3. 允許讀取本機 Express 後端的圖片
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },

      // 4. 允許區網裝置讀取 Express 後端圖片
      // 手機或其他裝置無法使用 localhost，
      // 因為 localhost 會指向該裝置本身，而不是你的電腦。
      {
        protocol: "http",
        hostname: "192.168.33.85",
        port: "3001",
        pathname: "/**",
      },

      // 5. 外部圖片來源
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
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
