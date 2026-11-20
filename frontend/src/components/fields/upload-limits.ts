/**
 * Khớp giới hạn của API POST /api/file (`backend/src/routers/file-controller.ts`, MAX_UPLOAD_TOTAL):
 * tổng dung lượng các file trong MỘT lần upload ≤ 4MB (user chốt 2026-11-21).
 */
export const MAX_UPLOAD_TOTAL = 4 * 1024 * 1024;

/** Tổng dung lượng các File mới (bỏ qua ảnh đã có trên server) */
export const totalNewFileSize = (files: unknown[]) =>
  files.reduce<number>((sum, f) => (f instanceof File ? sum + f.size : sum), 0);
