/**
 * 【新手】頂部藍色 M 幣餘額橫幅（純展示 wallet.balance）
 */
import Link from "next/link";
import type { PointWallet } from "../types";

interface WalletBannerProps {
  wallet: PointWallet;
}

export default function WalletBanner({ wallet }: WalletBannerProps) {
  return (
    <div className="relative h-[188px] w-full overflow-hidden rounded-t-[12px] bg-[url('/coupon-banner.png')] bg-cover bg-[position:90%_89%] bg-no-repeat">
      <Link
        href="/points"
        className="absolute top-4 right-6 text-sm font-medium text-black/90 transition-colors hover:text-black/50"
      >
        M幣詳情
      </Link>
      <div className="flex h-full flex-col items-center justify-center text-white">
        <p className="text-[68px] leading-none font-bold tracking-[-1.5px]">
          {wallet.balance}
        </p>
        <p className="mt-1 text-sm font-medium text-white/90">M幣餘額</p>
        <p className="mt-2 max-w-[300px] text-center text-sm text-white/95">
          累積 {wallet.redeem_threshold} M幣，即可折抵下次消費金額
          <span className="mt-1 block text-xs text-white/80">1 M幣 = NT$1</span>
        </p>
      </div>
    </div>
  );
}
