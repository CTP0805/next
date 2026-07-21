/**
 * 會員訂單 — 對齊 Express /api/member-order
 */

export type OrderStatus = "pending" | "paid" | "cancelled" | string;

export interface ItemReview {
  id: number;
  rating: number;
  comment: string;
  image_url: string | null;
  created_at: string | null;
}

export interface MemberOrderItem {
  id: number;
  experience_id: number;
  session_id: number;
  title: string;
  city: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  item_status: string;
  special_request: string | null;
  session_start: string | null;
  session_end: string | null;
  image_url: string | null;
  has_review: boolean;
  review: ItemReview | null;
}

export interface MemberOrder {
  id: string;
  member_id: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  payment_method: string;
  payment_label: string;
  order_status: OrderStatus;
  status_label: string;
  original_amount: number;
  coupon_id: number | null;
  coupon_discount: number;
  points_redeemed: number;
  final_amount: number;
  points_earned: number;
  created_at: string | null;
  updated_at: string | null;
  title: string;
  image_url: string | null;
  items: MemberOrderItem[];
  can_cancel: boolean;
  can_review: boolean;
  has_review: boolean;
  all_reviewed: boolean;
}
