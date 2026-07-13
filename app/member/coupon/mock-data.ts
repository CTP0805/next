import type {
  Coupon,
  MemberBenefitsPayload,
  MemberCoupon,
  MemberCouponView,
  Order,
  PointTransaction,
  PointWallet,
} from "./types";
import { deriveCouponStatus } from "./utils";

export { deriveCouponStatus } from "./utils";

/** 之後改成 API 時，mock member 可換成 auth.id */
export const MOCK_MEMBER_ID = 10085;

const wallet: PointWallet = {
  user_id: MOCK_MEMBER_ID,
  balance: 0,
  redeem_threshold: 10,
  updated_at: "2026-07-13T08:00:00Z",
};

/**
 * 酷幣流水（示範 earn / spend / refund / expire）
 * balance 以加總為準
 */
const transactions: PointTransaction[] = [
  {
    id: 1,
    user_id: MOCK_MEMBER_ID,
    title: "完成巴黎鐵塔體驗 · 簽到獎勵",
    amount: 120,
    type: "earn",
    status: "earned",
    order_id: "TRV2026060101",
    created_at: "2026-06-01T18:20:00Z",
    expires_at: "2027-06-01T23:59:59Z",
  },
  {
    id: 2,
    user_id: MOCK_MEMBER_ID,
    title: "撰寫真實評價回饋",
    amount: 30,
    type: "earn",
    status: "earned",
    order_id: "TRV2026060101",
    created_at: "2026-06-02T09:10:00Z",
    expires_at: "2027-06-02T23:59:59Z",
  },
  {
    id: 3,
    user_id: MOCK_MEMBER_ID,
    title: "結帳折抵酷幣",
    amount: -35,
    type: "spend",
    status: "used",
    order_id: "TRV2026062101",
    created_at: "2026-06-21T17:55:00Z",
    expires_at: null,
  },
  {
    id: 4,
    user_id: MOCK_MEMBER_ID,
    title: "釜山膠囊列車消費回饋",
    amount: 84,
    type: "earn",
    status: "earned",
    order_id: "TRV2026062101",
    created_at: "2026-06-21T17:56:12Z",
    expires_at: "2027-06-21T23:59:59Z",
  },
  {
    id: 5,
    user_id: MOCK_MEMBER_ID,
    title: "No-show 退款返還酷幣",
    amount: 14,
    type: "refund",
    status: "earned",
    order_id: "540051526",
    created_at: "2026-05-16T14:20:00Z",
    expires_at: null,
  },
  {
    id: 6,
    user_id: MOCK_MEMBER_ID,
    title: "活動簽到獎勵",
    amount: 50,
    type: "earn",
    status: "earned",
    order_id: null,
    created_at: "2026-04-10T08:00:00Z",
    expires_at: "2027-04-10T23:59:59Z",
  },
  {
    id: 7,
    user_id: MOCK_MEMBER_ID,
    title: "春季旅遊券結帳折抵",
    amount: -20,
    type: "spend",
    status: "used",
    order_id: "540060001",
    created_at: "2026-04-12T11:30:00Z",
    expires_at: null,
  },
  {
    id: 8,
    user_id: MOCK_MEMBER_ID,
    title: "酷幣到期失效",
    amount: -25,
    type: "expire",
    status: "expired",
    order_id: null,
    created_at: "2025-12-31T23:59:00Z",
    expires_at: "2025-12-31T23:59:00Z",
  },
  {
    id: 9,
    user_id: MOCK_MEMBER_ID,
    title: "黃金會員生日酷幣",
    amount: 100,
    type: "earn",
    status: "earned",
    order_id: null,
    created_at: "2026-03-01T00:00:00Z",
    expires_at: "2027-03-01T23:59:59Z",
  },
];

/** coupons 主檔（多樣券種） */
export const couponCatalog: Coupon[] = [
  {
    id: 1,
    code: "GOLD200",
    title: "黃金會員升等禮",
    description: "升等黃金會員專屬，全站體驗折抵 NT$200",
    discount_type: "fixed",
    discount_value: 200,
    max_discount: null,
    min_order_amount: 1000,
    category: "member",
    scope_label: "全站體驗",
    starts_at: "2026-01-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
  },
  {
    id: 2,
    code: "WELCOME10",
    title: "新會員 9 折券",
    description: "首次預訂享 9 折，最高折抵 NT$500",
    discount_type: "percent",
    discount_value: 10,
    max_discount: 500,
    min_order_amount: 500,
    category: "welcome",
    scope_label: "全站（限首次）",
    starts_at: "2026-06-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
  },
  {
    id: 3,
    code: "SPRING100",
    title: "春季旅遊券",
    description: "滿 NT$2,000 折 NT$100（已使用示範）",
    discount_type: "fixed",
    discount_value: 100,
    max_discount: null,
    min_order_amount: 2000,
    category: "seasonal",
    scope_label: "全站體驗",
    starts_at: "2026-03-01T00:00:00Z",
    expires_at: "2026-05-31T23:59:59Z",
  },
  {
    id: 4,
    code: "OLD50",
    title: "舊客回饋券",
    description: "已過期優惠示範",
    discount_type: "fixed",
    discount_value: 50,
    max_discount: null,
    min_order_amount: null,
    category: "seasonal",
    scope_label: "全站",
    starts_at: "2025-01-01T00:00:00Z",
    expires_at: "2025-12-31T23:59:59Z",
  },
  {
    id: 5,
    code: "FLASH15",
    title: "週末限時 85 折",
    description: "週末閃購，最高折抵 NT$800",
    discount_type: "percent",
    discount_value: 15,
    max_discount: 800,
    min_order_amount: 1500,
    category: "flash",
    scope_label: "全站限時",
    starts_at: "2026-07-01T00:00:00Z",
    expires_at: "2026-08-31T23:59:59Z",
  },
  {
    id: 6,
    code: "PARIS300",
    title: "巴黎體驗限定折抵",
    description: "僅適用巴黎系列體驗，滿 NT$3,000 折 NT$300",
    discount_type: "fixed",
    discount_value: 300,
    max_discount: null,
    min_order_amount: 3000,
    category: "experience",
    scope_label: "僅巴黎體驗",
    starts_at: "2026-05-01T00:00:00Z",
    expires_at: "2026-11-30T23:59:59Z",
  },
  {
    id: 7,
    code: "SHIPFREE",
    title: "雜費／服務費折抵券",
    description: "折抵訂單服務費或相關雜費 NT$60（無低消）",
    discount_type: "fixed",
    discount_value: 60,
    max_discount: null,
    min_order_amount: null,
    category: "shipping",
    scope_label: "服務費／雜費",
    starts_at: "2026-06-01T00:00:00Z",
    expires_at: "2026-10-31T23:59:59Z",
  },
  {
    id: 8,
    code: "AUTUMN20",
    title: "秋季預熱 8 折",
    description: "尚未開跑的季節券（scheduled 示範），最高折抵 NT$1,000",
    discount_type: "percent",
    discount_value: 20,
    max_discount: 1000,
    min_order_amount: 2000,
    category: "seasonal",
    scope_label: "全站體驗",
    starts_at: "2026-09-01T00:00:00Z",
    expires_at: "2026-11-30T23:59:59Z",
  },
  {
    id: 9,
    code: "PLAT500",
    title: "白金升等禮",
    description: "白金會員升等禮 NT$500",
    discount_type: "fixed",
    discount_value: 500,
    max_discount: null,
    min_order_amount: 2000,
    category: "member",
    scope_label: "全站體驗",
    starts_at: "2026-01-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
  },
  {
    id: 10,
    code: "SUMMER80",
    title: "盛夏旅遊折 80 元",
    description: "滿千折八十",
    discount_type: "fixed",
    discount_value: 80,
    max_discount: null,
    min_order_amount: 1000,
    category: "seasonal",
    scope_label: "全站",
    starts_at: "2026-06-15T00:00:00Z",
    expires_at: "2026-09-15T23:59:59Z",
  },
  {
    id: 11,
    code: "LONDON150",
    title: "倫敦體驗折抵",
    description: "僅適用倫敦系列體驗，滿 NT$2,500 折 NT$150",
    discount_type: "fixed",
    discount_value: 150,
    max_discount: null,
    min_order_amount: 2500,
    category: "experience",
    scope_label: "僅倫敦體驗",
    starts_at: "2026-04-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
  },
  {
    id: 12,
    code: "BDAY100",
    title: "生日慶折抵",
    description: "生日月專屬折抵 NT$100",
    discount_type: "fixed",
    discount_value: 100,
    max_discount: null,
    min_order_amount: 800,
    category: "member",
    scope_label: "全站",
    starts_at: "2026-07-01T00:00:00Z",
    expires_at: "2026-07-31T23:59:59Z",
  },
  {
    id: 13,
    code: "FOOD12",
    title: "美饌饗宴 88 折",
    description: "餐飲體驗 12% off，最高折抵 NT$400",
    discount_type: "percent",
    discount_value: 12,
    max_discount: 400,
    min_order_amount: 1200,
    category: "experience",
    scope_label: "僅美饌饗宴",
    starts_at: "2026-05-01T00:00:00Z",
    expires_at: "2026-10-31T23:59:59Z",
  },
  {
    id: 14,
    code: "REVIEW50",
    title: "評價回饋券",
    description: "完成評價回饋已使用示範",
    discount_type: "fixed",
    discount_value: 50,
    max_discount: null,
    min_order_amount: 500,
    category: "welcome",
    scope_label: "全站",
    starts_at: "2026-02-01T00:00:00Z",
    expires_at: "2026-08-31T23:59:59Z",
  },
  {
    id: 15,
    code: "NIGHT25",
    title: "夜間導覽限時券",
    description: "夜間活動滿額折 25 元（已過期示範）",
    discount_type: "fixed",
    discount_value: 25,
    max_discount: null,
    min_order_amount: 600,
    category: "flash",
    scope_label: "夜間導覽",
    starts_at: "2025-11-01T00:00:00Z",
    expires_at: "2026-01-31T23:59:59Z",
  },
  /** 可兌換進錢包（不在預設 15 張擁有清單內） */
  {
    id: 16,
    code: "BONUS99",
    title: "加碼折 99 元",
    description: "輸入券碼領取，滿 NT$999 折 NT$99",
    discount_type: "fixed",
    discount_value: 99,
    max_discount: null,
    min_order_amount: 999,
    category: "flash",
    scope_label: "全站",
    starts_at: "2026-06-01T00:00:00Z",
    expires_at: "2026-12-31T23:59:59Z",
  },
  {
    id: 17,
    code: "OUTDOOR5",
    title: "戶外探索 95 折",
    description: "戶外類體驗 5% off，最高折抵 NT$300",
    discount_type: "percent",
    discount_value: 5,
    max_discount: 300,
    min_order_amount: 1000,
    category: "experience",
    scope_label: "僅戶外探索",
    starts_at: "2026-07-01T00:00:00Z",
    expires_at: "2026-11-30T23:59:59Z",
  },
];

/**
 * member_coupons：模擬已擁有 15 張
 * used_at 在已使用時寫入
 */
let memberCoupons: MemberCoupon[] = [
  {
    id: 1,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 1,
    is_used: false,
    received_at: "2026-01-01T12:00:00Z",
    used_at: null,
  },
  {
    id: 2,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 2,
    is_used: false,
    received_at: "2026-06-21T12:00:00Z",
    used_at: null,
  },
  {
    id: 3,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 3,
    is_used: true,
    received_at: "2026-03-01T09:00:00Z",
    used_at: "2026-04-12T11:30:00Z",
  },
  {
    id: 4,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 4,
    is_used: false,
    received_at: "2025-01-05T10:00:00Z",
    used_at: null,
  },
  {
    id: 5,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 5,
    is_used: false,
    received_at: "2026-07-01T08:00:00Z",
    used_at: null,
  },
  {
    id: 6,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 6,
    is_used: false,
    received_at: "2026-05-10T11:00:00Z",
    used_at: null,
  },
  {
    id: 7,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 7,
    is_used: false,
    received_at: "2026-06-05T15:30:00Z",
    used_at: null,
  },
  {
    id: 8,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 8,
    is_used: false,
    received_at: "2026-07-10T09:00:00Z",
    used_at: null,
  },
  {
    id: 9,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 9,
    is_used: false,
    received_at: "2026-02-14T10:00:00Z",
    used_at: null,
  },
  {
    id: 10,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 10,
    is_used: false,
    received_at: "2026-06-20T16:00:00Z",
    used_at: null,
  },
  {
    id: 11,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 11,
    is_used: false,
    received_at: "2026-04-08T13:00:00Z",
    used_at: null,
  },
  {
    id: 12,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 12,
    is_used: false,
    received_at: "2026-07-01T00:30:00Z",
    used_at: null,
  },
  {
    id: 13,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 13,
    is_used: false,
    received_at: "2026-05-18T11:20:00Z",
    used_at: null,
  },
  {
    id: 14,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 14,
    is_used: true,
    received_at: "2026-02-10T09:00:00Z",
    used_at: "2026-03-22T14:15:00Z",
  },
  {
    id: 15,
    member_id: MOCK_MEMBER_ID,
    coupon_id: 15,
    is_used: false,
    received_at: "2025-11-05T08:00:00Z",
    used_at: null,
  },
];

let nextMemberCouponId = 16;

/**
 * orders（對齊 DB）
 * final_amount = original_amount - coupon_discount - points_redeemed
 */
export const mockOrders: Order[] = [
  {
    order_id: "TRV2026062101",
    member_id: MOCK_MEMBER_ID,
    contact_name: "王小明",
    contact_phone: "912345678",
    contact_email: "member@email.com",
    payment_method: "信用卡",
    order_status: 2,
    original_amount: 3000,
    coupon_id: 2,
    coupon_discount: 150,
    points_redeemed: 35,
    final_amount: 2815,
    points_earned: 84,
    created_at: "2026-06-21T17:55:00Z",
    updated_at: "2026-06-21T17:56:12Z",
  },
  {
    order_id: "540060001",
    member_id: MOCK_MEMBER_ID,
    contact_name: "王小明",
    contact_phone: "912345678",
    contact_email: "member@email.com",
    payment_method: "信用卡",
    order_status: 2,
    original_amount: 2200,
    coupon_id: 3,
    coupon_discount: 100,
    points_redeemed: 20,
    final_amount: 2080,
    points_earned: 63,
    created_at: "2026-04-12T11:30:00Z",
    updated_at: "2026-04-12T11:31:00Z",
  },
];

/** member_coupons JOIN coupons（+ 可選 order 反查） */
export function buildMemberCouponViews(
  rows: MemberCoupon[] = memberCoupons,
  catalog: Coupon[] = couponCatalog,
  orders: Order[] = mockOrders,
  now: Date = new Date(),
): MemberCouponView[] {
  const couponById = new Map(catalog.map((c) => [c.id, c]));
  const orderIdByCouponId = new Map<number, string>();
  for (const order of orders) {
    if (order.coupon_id != null && order.order_status === 2) {
      orderIdByCouponId.set(order.coupon_id, order.order_id);
    }
  }

  const views: MemberCouponView[] = [];
  for (const row of rows) {
    const coupon = couponById.get(row.coupon_id);
    if (!coupon) continue;

    views.push({
      ...coupon,
      id: coupon.id,
      member_coupon_id: row.id,
      member_id: row.member_id,
      coupon_id: row.coupon_id,
      is_used: row.is_used,
      received_at: row.received_at,
      used_at: row.used_at,
      status: deriveCouponStatus(row, coupon, now),
      order_id: row.is_used
        ? (orderIdByCouponId.get(row.coupon_id) ?? null)
        : null,
    });
  }
  return views;
}

/** 尚未擁有、可輸入券碼兌換的主檔 */
export function getRedeemableCatalog(
  ownedCouponIds: number[] = memberCoupons.map((r) => r.coupon_id),
): Coupon[] {
  const owned = new Set(ownedCouponIds);
  return couponCatalog.filter((c) => !owned.has(c.id));
}

export type RedeemResult =
  | { ok: true; coupon: MemberCouponView }
  | { ok: false; message: string };

/**
 * 模擬兌換券碼 → 寫入 member_coupons
 * 前端 client 也可本地複製邏輯；此函式供 mock 層共用
 */
export function redeemCouponCode(
  rawCode: string,
  memberId: number = MOCK_MEMBER_ID,
  now: Date = new Date(),
): RedeemResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { ok: false, message: "請輸入優惠券代碼" };
  }

  const catalogItem = couponCatalog.find(
    (c) => c.code.toUpperCase() === code,
  );
  if (!catalogItem) {
    return { ok: false, message: "查無此優惠券代碼" };
  }

  if (new Date(catalogItem.expires_at).getTime() < now.getTime()) {
    return { ok: false, message: "此優惠券已過期，無法領取" };
  }

  const alreadyOwned = memberCoupons.some(
    (r) => r.member_id === memberId && r.coupon_id === catalogItem.id,
  );
  if (alreadyOwned) {
    return { ok: false, message: "您已擁有此優惠券" };
  }

  const row: MemberCoupon = {
    id: nextMemberCouponId++,
    member_id: memberId,
    coupon_id: catalogItem.id,
    is_used: false,
    received_at: now.toISOString(),
    used_at: null,
  };
  memberCoupons = [...memberCoupons, row];

  const views = buildMemberCouponViews([row], couponCatalog, mockOrders, now);
  const coupon = views[0];
  if (!coupon) {
    return { ok: false, message: "領取失敗，請稍後再試" };
  }
  return { ok: true, coupon };
}

/**
 * 模擬從 DB／API 取得會員優惠資料。
 * 之後替換為：fetch(`${API_SERVER}/api/member/benefits`, { headers })
 */
export async function getMemberBenefits(
  _memberId: number = MOCK_MEMBER_ID,
): Promise<MemberBenefitsPayload> {
  const computedBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const coupons = buildMemberCouponViews();

  return {
    wallet: {
      ...wallet,
      balance: Math.max(0, computedBalance),
      updated_at: new Date().toISOString(),
    },
    transactions: [...transactions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
    coupons: coupons.sort(
      (a, b) =>
        new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime(),
    ),
    redeemable_codes: getRedeemableCatalog(),
  };
}
