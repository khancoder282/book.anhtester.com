// Gắn `data-testid` cho TextField của MUI (Playwright: `page.getByTestId(id)`).
// `data-testid` nằm trên chính thẻ <input> để `.fill()` được ngay, dòng lỗi / gợi ý có `<id>-error`.
// Ép kiểu `object` vì thuộc tính có dấu gạch ngang không có trong kiểu props của MUI.
export function textFieldTestId(id: string) {
  return {
    htmlInput: { 'data-testid': id },
    formHelperText: { 'data-testid': `${id}-error` } as object,
  };
}
