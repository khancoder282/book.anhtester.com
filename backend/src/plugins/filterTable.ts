/**
 * Dựng `where` của Prisma từ query `search`.
 *
 * - Chuỗi thường: tìm `contains` trên các cột `cols` (OR).
 * - Chuỗi JSON object: dùng làm `where` (frontend book/promotion/user gửi bộ lọc
 *   dạng này), nhưng bị kiểm tra trước: không được lọc theo cột/quan hệ nhạy cảm
 *   (mật khẩu, refresh token...) ở bất kỳ độ sâu nào, không quá sâu, không quá dài.
 *   Vi phạm thì ném `FilterError` (controller trả 400).
 */

/** Khoá bị cấm ở mọi cấp của bộ lọc JSON. */
const BLOCKED_KEYS = new Set([
  "password",
  "refreshTokens",
  "tokenHash",
  "deviceInfo",
  "ipAddress",
  "user",
]);

const MAX_SEARCH_LENGTH = 5000;
const MAX_DEPTH = 10;

export class FilterError extends Error {}

export function filterTable(search: string | undefined, cols: string[] = []) {
  if (!search) return undefined;
  if (search.length > MAX_SEARCH_LENGTH) {
    throw new FilterError(
      `Search must be at most ${MAX_SEARCH_LENGTH} characters.`
    );
  }
  const parsed = parseJSON(search);
  if (parsed === undefined || typeof parsed !== "object" || parsed === null) {
    return {
      OR: cols.map((col) => ({ [col]: { contains: search } })),
    };
  }
  if (Array.isArray(parsed)) {
    throw new FilterError("Search filter must be a JSON object.");
  }
  assertSafeFilter(parsed, 0);
  return parsed;
}

/** Thông báo lỗi an toàn để trả cho client (không lộ đường dẫn file, câu lệnh Prisma). */
export function filterErrorMessage(error: unknown) {
  return error instanceof FilterError
    ? error.message
    : "The search filter is not a valid query.";
}

function assertSafeFilter(value: unknown, depth: number) {
  if (depth > MAX_DEPTH) {
    throw new FilterError("Search filter is nested too deeply.");
  }
  if (Array.isArray(value)) {
    value.forEach((item) => assertSafeFilter(item, depth + 1));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key)) {
      throw new FilterError(`Filtering by "${key}" is not allowed.`);
    }
    assertSafeFilter(child, depth + 1);
  }
}

function parseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}
