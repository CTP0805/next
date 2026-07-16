/**
 * 會員優惠／M幣 資料模型
 * 欄位命名對齊未來 DB／API，前端 mock 與正式匯入可共用。
 *
 * 之後若後端欄位名不同，只改 mapFromApi() 即可。
 */

/** M幣帳戶（一使用者一筆） */
export interface PointWallet {
  user_id: number;
  /** 目前可用餘額 */
  balance: number;
  /** 提示用：累積達此數量可折抵（文案用） */
  redeem_threshold: number;
  updated_at: string;
}

/**
 * M幣流水
 * DB 建議表名：point_transactions
 */
export interface PointTransaction {
  id: number;
  user_id: number;
  /** 顯示標題，例如「購買活動消費」 */
  title: string;
  /** 異動數量：正數＝獲得，負數＝使用／過期 */
  amount: number;
  /** 異動類型 */
  type: "earn" | "spend" | "refund" | "expire";
  /**
   * 列表篩選用狀態
   * earned = 已獲得, used = 已使用, expired = 已過期
   */
  status: "earned" | "used" | "expired";
  /** 關聯訂單編號，可為 null */
  order_id: string | null;
  created_at: string;
  /** 過期時間（earn 類型可選） */
  expires_at: string | null;
}

/** 優惠券種類（UI 標籤／篩選用，非 DB ENUM 也可） */
export type CouponCategory =
  "member" | "welcome" | "seasonal" | "flash" | "experience" | "shipping";

/**
 * 優惠券主檔
 * DB 表名：coupons
 */
export interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string;
  /** fixed = 固定金額折抵, percent = 百分比折扣 */
  discount_type: "fixed" | "percent";
  discount_value: number;
  /** 百分比券最高折抵上限，null 表示無上限；fixed 通常為 null */
  max_discount: number | null;
  /** 最低消費門檻，null 表示無門檻 */
  min_order_amount: number | null;
  category: CouponCategory;
  /** 適用範圍說明，例如：全站、僅巴黎體驗 */
  scope_label: string;
  starts_at: string;
  expires_at: string;
}

/**
 * 會員優惠券關聯
 * DB 表名：member_coupons
 * 記錄「誰擁有了什麼券、什麼時候領的、用了沒」
 *
 * used_at：先儲存欄位；結帳完成時再寫入
 */
export interface MemberCoupon {
  id: number;
  /** 關聯 Users 表 */
  member_id: number;
  /** 關聯 Coupons 表 */
  coupon_id: number;
  /** 0: 未使用, 1: 已使用 */
  is_used: boolean;
  /** 領取時間（例如：升級當天） */
  received_at: string;
  /** 使用時間（結帳完成時寫入，可為 NULL） */
  used_at: string | null;
}

/**
 * 訂單
 * DB 表名：orders
 *
 * final_amount = original_amount - coupon_discount - points_redeemed
 */
export type OrderStatus = 1 | 2 | 3;
/** 1.未付款 2.已付款 3.退款中 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  1: "未付款",
  2: "已付款",
  3: "退款中",
};

export interface Order {
  order_id: string;
  member_id: number;
  /** 聯絡人姓名（原：訂購人姓名） */
  contact_name: string;
  /** 聯絡人電話（原：訂購人電話） */
  contact_phone: string;
  /** 聯絡人電子郵件（原：訂購人 Email） */
  contact_email: string;
  /** 付款方式（如：信用卡、LINE Pay） */
  payment_method: string;
  order_status: OrderStatus;
  /** 訂單原始總金額（商品未打折前總價） */
  original_amount: number;
  /** 使用的優惠券 ID（關聯 Coupons，可為 NULL） */
  coupon_id: number | null;
  /** 優惠券折抵金額 */
  coupon_discount: number;
  /** 本次訂單折抵M幣數量 */
  points_redeemed: number;
  /** 最終實付總額 */
  final_amount: number;
  /** 本筆訂單新賺取的M幣 */
  points_earned: number;
  created_at: string;
  updated_at: string;
}

/**
 * 列表用：member_coupons JOIN coupons
 * status 由 is_used + starts_at + expires_at 推導，非 DB 欄位
 */
export type MemberCouponStatus = "available" | "scheduled" | "used" | "expired";

export interface MemberCouponView extends Coupon {
  /** member_coupons.id */
  member_coupon_id: number;
  member_id: number;
  coupon_id: number;
  is_used: boolean;
  received_at: string;
  used_at: string | null;
  status: MemberCouponStatus;
  /**
   * 若有對應已使用訂單可帶入；member_coupons 本身無此欄位
   * （可由 orders.coupon_id 反查）
   */
  order_id: string | null;
}

/** 結帳時暫存選中的券（localStorage） */
export interface SelectedCouponPayload {
  member_coupon_id: number;
  coupon_id: number;
  code: string;
  title: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number | null;
  selected_at: string;
}

export type PointFilter = "all" | "earned" | "used" | "expired";
export type CouponFilter =
  "all" | "available" | "scheduled" | "used" | "expired";
export type CouponPageTab = "points" | "coupons";

/** 會員優惠頁一次載入的資料包（之後可對應單一 API） */
export interface MemberBenefitsPayload {
  wallet: PointWallet;
  transactions: PointTransaction[];
  coupons: MemberCouponView[];
  /** 可兌換進錢包、尚未擁有的券碼主檔（模擬可領券池） */
  redeemable_codes: Coupon[];
}

export const SELECTED_COUPON_STORAGE_KEY = "maoday-selected-coupon";
