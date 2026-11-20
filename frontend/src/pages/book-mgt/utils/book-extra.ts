const textOrNull = (v: string | null | undefined) => (v == null ? null : v.trim() || null);
const numberOrNull = (v: number | '' | null | undefined) =>
  v === '' || v == null ? null : Number(v);

/** Thông tin thêm gửi lên API. Ô trống gửi `null` để xoá giá trị cũ (PATCH). */
export const bookExtraPayload = (book: BookForm) => ({
  author: textOrNull(book.author),
  publisher: textOrNull(book.publisher),
  publishYear: numberOrNull(book.publishYear),
  pageCount: numberOrNull(book.pageCount),
  isbn: textOrNull(book.isbn),
  language: textOrNull(book.language),
  previewTitle: textOrNull(book.previewTitle),
  previewContent: textOrNull(book.previewContent),
});
