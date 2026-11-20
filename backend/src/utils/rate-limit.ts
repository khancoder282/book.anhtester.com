/**
 * Giới hạn tần suất đơn giản trong bộ nhớ (cửa sổ trượt) — 2026-11-21, dùng cho upload file.
 * Mỗi `key` (VD "upload:<userId>") được tối đa `limit` lần trong `windowMs`.
 * Lưu ý: chỉ đúng khi backend chạy 1 tiến trình (như VPS hiện tại); khởi động lại là đếm lại từ đầu.
 */
const hits = new Map<string, number[]>();

/** Ghi nhận một lần gọi. Trả về 0 nếu được phép, hoặc số giây phải chờ nếu đã vượt giới hạn. */
export function hitRateLimit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
  }
  recent.push(now);
  hits.set(key, recent);
  // Dọn key cũ để Map không phình mãi
  if (hits.size > 5000) {
    for (const [k, list] of hits) {
      if (!list.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  return 0;
}
