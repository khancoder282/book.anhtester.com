import { getPromotionStatus } from 'src/pages/promotions-mgt/utils';

// Cùng quy tắc với backend (`backend/src/utils/pricing.ts`): chỉ khuyến mãi đang hiệu lực,
// cộng dồn mức giảm (tính trên giá gốc), làm tròn, giữ trong [0, price].

export const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

/**
 * Trạng thái khuyến mãi gắn với sách. API chi tiết sách không trả `isActive`
 * (chỉ trả khuyến mãi đang bật) nên thiếu trường này thì coi là đang bật.
 */
export const promotionStatus = (p: PromotionType) =>
  getPromotionStatus({ ...p, isActive: p.isActive !== false });

/** Mức giảm một khuyến mãi mang lại cho giá gốc, không xét ngày hiệu lực. FREE_SHIPPING không đổi giá. */
export function promotionDiscount(price: number, p: Pick<PromotionType, 'type' | 'value'>) {
  if (p.type === 'PERCENTAGE') return (price * p.value) / 100;
  if (p.type === 'FIXED_AMOUNT') return p.value;
  return 0;
}

function applyDiscounts(price: number, promotions: PromotionType[]) {
  const discount = promotions.reduce((sum, p) => sum + promotionDiscount(price, p), 0);
  return Math.min(Math.max(Math.round(price - discount), 0), Math.max(price, 0));
}

/** Giá bán hiện tại: chỉ trừ khuyến mãi đang chạy. */
export function calcCurrentPrice(price: number, promotions: PromotionType[]) {
  return applyDiscounts(
    price,
    promotions.filter((p) => promotionStatus(p) === 'running')
  );
}

/** Giá khi mọi khuyến mãi đang chạy + sắp chạy cùng có hiệu lực (bỏ khuyến mãi hết hạn / đã tắt). */
export function calcUpcomingPrice(price: number, promotions: PromotionType[]) {
  return applyDiscounts(
    price,
    promotions.filter((p) => ['running', 'scheduled'].includes(promotionStatus(p)))
  );
}
