import type { Metadata } from "next";
import "./globals.css";
import { Besley } from "next/font/google";
import { CartProvider } from "@/contexts/cart";
import { FavoriteProvider } from "@/contexts/FavoriteContext";
import { AuthContextProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar/index";
import FooterGuard from "@/components/FooterGuard";
import { AuthRouteGuard } from "@/components/AuthRouteGuard";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Meet Local", // 👈 更改瀏覽器分頁標題
  description: "旅遊網站",
  icons: {
    icon: "/icon/oldlogo1.svg", // 👈 更改瀏覽器分頁圖示 (預設讀取 public 資料夾下的檔案)
  },
};

const besley = Besley({
  subsets: ["latin"],
  variable: "--font-besley", // 這就是關鍵名稱
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        suppressHydrationWarning
        className={`flex min-h-full flex-col ${besley.variable}`}
      >
        <Toaster />
        <AuthContextProvider>
          <FavoriteProvider>
            <CartProvider>
              <Navbar />
              <AuthRouteGuard>{children}</AuthRouteGuard>
              <FooterGuard />
            </CartProvider>
          </FavoriteProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
