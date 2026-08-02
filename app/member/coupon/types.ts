/**
 * =============================================================================
 * 【新手導讀】Coupon／M 幣 TypeScript 型別
 * =============================================================================
 * PointWallet        = 餘額卡片
 * PointTransaction   = M 幣流水一筆（從訂單與訂單明細推導）
 * Coupon             = 券目錄（coupons 表）
 * MemberCouponView   = 我持有的券 + 狀態 available/used/...
 * MemberBenefitsPayload = benefits API 整包 data
 * SELECTED_COUPON_STORAGE_KEY = 結帳前暫存選中的券（localStorage）
 * =============================================================================
 */

/** M幣帳戶（一使用者一筆；餘額來自 member.current_points） */
export interface PointWallet {
  user_id: number;
  /** 目前可用餘額 */
  balance: number;
  /** 提示用：累積達此數量可折抵（文案用） */
  redeem_threshold: number;
  updated_at: string;
}

/**
 * M幣流水（由 order_main 回饋／折抵與 order_items 取消退款推導）
 * DB 無獨立流水表
 */
export interface PointTransaction {
  id: number;
  user_id: number;
  title: string;
  /** 異動數量：正數＝獲得，負數＝使用 */
  amount: number;
  type: "earn" | "spend" | "refund" | "expire";
  status: "earned" | "used" | "expired";
  order_id: string | null;
  created_at: string;
  expires_at: string | null;
}

/**
 * 優惠券主檔 — 對齊 coupons
 * id, coupon_name, min_spent, discount_amount, start_date, end_date
 * code 為後端合成 C{id}（DB 無 code 欄）
 */
export interface Coupon {
  id: number;
  coupon_name: string;
  code: string;
  min_spent: number;
  discount_amount: number;
  start_date: string;
  end_date: string;
  /** 固定金額折抵（DB 僅有 discount_amount） */
  discount_type: "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  title: string;
  description: string;
  starts_at: string;
  expires_at: string;
}

/**
 * 會員優惠券關聯 — 對齊 member_coupons
 */
export interface MemberCoupon {
  id: number;
  member_id: number;
  coupon_id: number;
  is_used: boolean;
  received_at: string;
  used_at: string | null;
}

/**
 * 列表用：member_coupons JOIN coupons
 * status 由 is_used + start_date + end_date 推導
 */
export type MemberCouponStatus = "available" | "scheduled" | "used" | "expired";

export interface MemberCouponView extends Coupon {
  member_coupon_id: number;
  member_id: number;
  coupon_id: number;
  is_used: boolean;
  received_at: string;
  used_at: string | null;
  status: MemberCouponStatus;
  order_id: string | null;
}

/** 結帳時暫存選中的券（localStorage） */
export interface SelectedCouponPayload {
  member_coupon_id: number;
  coupon_id: number;
  code: string;
  title: string;
  discount_type: "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number | null;
  selected_at: string;
}

export type PointFilter = "all" | "earned" | "used" | "expired";
export type CouponFilter =
  | "all"
  | "available"
  | "scheduled"
  | "used"
  | "expired";
export type CouponPageTab = "points" | "coupons";

export interface MemberBenefitsPayload {
  wallet: PointWallet;
  transactions: PointTransaction[];
  coupons: MemberCouponView[];
  redeemable_codes: Coupon[];
}

export const SELECTED_COUPON_STORAGE_KEY = "maoday-selected-coupon";
