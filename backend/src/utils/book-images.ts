import fs from "fs";
import path from "path";
import type { Prisma, PrismaClient } from "../prisma/client";
import { UPLOAD_ROOT, isInsideOf, resolveUpload } from "./upload-security";

/**
 * Ảnh sách (2026-11-21).
 *
 * - Ảnh sách chỉ được nằm trong `upload/$book-image/` (form web upload vào `/$book-image/<slug>`).
 *   POST / PATCH sách gửi đường dẫn khác → 422 `fields.pictures`.
 * - Xoá sách / bỏ ảnh khỏi sách → xoá file ảnh (nếu không còn sách nào khác dùng) và xoá thư mục rỗng.
 *   Trước đây xoá bằng `rmSync(path.join(upload, p), { recursive: true })` không kiểm đường dẫn:
 *   sách có `pictures: ["/../src"]` thì xoá sách là xoá luôn thư mục code của server.
 * - Ảnh upload rồi bỏ dở (không gắn vào sách nào) được dọn định kỳ bởi `sweepOrphanBookImages`.
 */

export const BOOK_IMAGE_DIR = "$book-image";
const BOOK_IMAGE_ROOT = path.join(UPLOAD_ROOT, BOOK_IMAGE_DIR);

/** Ảnh mồ côi cũ hơn mức này mới bị dọn (để người đang điền form tạo sách không bị mất ảnh vừa upload). */
export const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type Db = PrismaClient | Prisma.TransactionClient;

/** Chuẩn hoá đường dẫn ảnh client gửi: `\` → `/`, có `/` đầu. */
export const normalizePicture = (p: string) => {
  const s = p.trim().replace(/\\/g, "/");
  return s.startsWith("/") ? s : `/${s}`;
};

/** Đường dẫn tuyệt đối của ảnh nếu hợp lệ (nằm trong `$book-image`, không phải chính thư mục đó), ngược lại null. */
export function bookImageAbs(p: string): string | null {
  if (!p || p.includes(",")) return null;
  const abs = resolveUpload(normalizePicture(p));
  if (!abs || abs === BOOK_IMAGE_ROOT || !isInsideOf(abs, BOOK_IMAGE_ROOT)) return null;
  return abs;
}

/** Kiểm danh sách ảnh gửi lên. Trả về danh sách đã chuẩn hoá, hoặc thông báo lỗi cho `fields.pictures`. */
export function checkPictures(pictures: string[]): { pictures: string[] } | { error: string } {
  const out: string[] = [];
  for (const raw of pictures) {
    if (!raw || !raw.trim()) continue;
    if (!bookImageAbs(raw)) {
      return { error: `Invalid picture path "${raw}". Pictures must be uploaded files inside /${BOOK_IMAGE_DIR}/.` };
    }
    const p = normalizePicture(raw);
    if (!out.includes(p)) out.push(p);
  }
  return { pictures: out };
}

/** Xoá các thư mục rỗng từ `dir` đi lên, dừng ở `$book-image`. */
function removeEmptyDirs(dir: string) {
  let cur = dir;
  while (cur !== BOOK_IMAGE_ROOT && isInsideOf(cur, BOOK_IMAGE_ROOT)) {
    try {
      if (fs.readdirSync(cur).length > 0) return;
      fs.rmdirSync(cur);
    } catch {
      return;
    }
    cur = path.dirname(cur);
  }
}

/** Tập đường dẫn tuyệt đối của mọi ảnh đang được sách dùng (bỏ qua sách `excludeBookId`). */
async function referencedImages(db: Db, excludeBookId?: string) {
  const books = await db.book.findMany({
    where: excludeBookId ? { NOT: { id: excludeBookId } } : undefined,
    select: { picture: true },
  });
  const set = new Set<string>();
  for (const b of books) {
    for (const p of (b.picture || "").split(",")) {
      const abs = bookImageAbs(p);
      if (abs) set.add(abs);
    }
  }
  return set;
}

/**
 * Xoá file ảnh của sách (chỉ file hợp lệ trong `$book-image`, không xoá thư mục, không xoá ảnh sách khác còn dùng),
 * rồi xoá thư mục rỗng còn lại. Gọi SAU khi đã xoá / cập nhật sách trong DB.
 */
export async function removeBookImages(db: Db, pictures: string[], excludeBookId?: string) {
  const targets = pictures.map(bookImageAbs).filter((p): p is string => !!p);
  if (targets.length === 0) return 0;
  const inUse = await referencedImages(db, excludeBookId);
  let removed = 0;
  for (const abs of targets) {
    if (inUse.has(abs)) continue;
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        fs.unlinkSync(abs);
        removed += 1;
      }
    } catch (e) {
      console.error("[book-images] remove failed", e instanceof Error ? e.message : e);
    }
    removeEmptyDirs(path.dirname(abs));
  }
  return removed;
}

/**
 * Dọn ảnh mồ côi trong `$book-image`: file không sách nào dùng và cũ hơn `maxAgeMs`
 * (VD upload ảnh rồi bỏ dở form, sách bị sửa ảnh qua API). Xoá luôn thư mục rỗng.
 */
export async function sweepOrphanBookImages(db: Db, maxAgeMs = ORPHAN_MAX_AGE_MS) {
  if (!fs.existsSync(BOOK_IMAGE_ROOT)) return 0;
  const inUse = await referencedImages(db);
  const now = Date.now();
  let removed = 0;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        removeEmptyDirs(abs);
      } else if (entry.isFile() && !inUse.has(abs)) {
        try {
          if (now - fs.statSync(abs).mtimeMs >= maxAgeMs) {
            fs.unlinkSync(abs);
            removed += 1;
          }
        } catch {
          // file vừa bị xoá ở nơi khác thì bỏ qua
        }
      }
    }
  };
  walk(BOOK_IMAGE_ROOT);
  return removed;
}
