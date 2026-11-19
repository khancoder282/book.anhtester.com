import { $Enums, Prisma } from "../prisma";

/**
 * Quy tắc giá bán (`currentPrice`) dùng chung cho Book và Promotion.
 *
 * - Chỉ tính khuyến mãi **đang hiệu lực**: `isActive = true` và `startDate <= now <= endDate`.
 * - PERCENTAGE giảm `price * value / 100`, FIXED_AMOUNT giảm `value`, FREE_SHIPPING không đổi giá.
 * - Nhiều khuyến mãi thì cộng dồn mức giảm (đều tính trên giá gốc).
 * - Kết quả làm tròn về số nguyên và luôn nằm trong `[0, price]`.
 */

type PricingPromotion = {
  type: $Enums.PromotionType;
  value: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
};

type Db = Prisma.TransactionClient;

export function isPromotionEffective(p: PricingPromotion, now = new Date()) {
  return p.isActive && p.startDate <= now && p.endDate >= now;
}

export function calcCurrentPrice(price: number, promotions: PricingPromotion[], now = new Date()) {
  let discount = 0;
  for (const p of promotions) {
    if (!isPromotionEffective(p, now)) continue;
    if (p.type === $Enums.PromotionType.PERCENTAGE) discount += (price * p.value) / 100;
    if (p.type === $Enums.PromotionType.FIXED_AMOUNT) discount += p.value;
  }
  const result = Math.round(price - discount);
  return Math.min(Math.max(result, 0), Math.max(price, 0));
}

const pricingSelect = {
  type: true,
  value: true,
  isActive: true,
  startDate: true,
  endDate: true,
} as const;

/**
 * Tính lại và lưu `currentPrice` cho các sách. Trả về map id → giá bán mới.
 * Giữ nguyên `updatedAt`: giá bán đổi theo khuyến mãi không phải là sửa sách (danh sách sort theo `updatedAt`).
 */
export async function recalcBookPrices(db: Db, bookIds: Iterable<string>) {
  const ids = [...new Set(bookIds)];
  const result = new Map<string, number>();
  if (ids.length === 0) return result;

  const books = await db.book.findMany({
    where: { id: { in: ids } },
    select: { id: true, price: true, currentPrice: true, updatedAt: true, promotions: { select: pricingSelect } },
  });
  const now = new Date();
  for (const book of books) {
    const currentPrice = calcCurrentPrice(book.price, book.promotions, now);
    result.set(book.id, currentPrice);
    if (currentPrice !== book.currentPrice) {
      await db.book.update({ where: { id: book.id }, data: { currentPrice, updatedAt: book.updatedAt } });
    }
  }
  return result;
}

/**
 * Khuyến mãi tới ngày bắt đầu / hết hạn mà không ai sửa gì thì `currentPrice` đã lưu bị cũ.
 * Gọi trước khi đọc danh sách / chi tiết sách để giá trả về (và sort/lọc theo giá) luôn đúng.
 * Chỉ ghi những sách có giá lệch.
 */
export async function syncStaleBookPrices(db: Db, where?: Prisma.BookWhereInput) {
  const books = await db.book.findMany({
    where,
    select: { id: true, price: true, currentPrice: true, updatedAt: true, promotions: { select: pricingSelect } },
  });
  const now = new Date();
  for (const b of books) {
    const currentPrice = calcCurrentPrice(b.price, b.promotions, now);
    if (currentPrice !== b.currentPrice) {
      await db.book.update({ where: { id: b.id }, data: { currentPrice, updatedAt: b.updatedAt } });
    }
  }
}
