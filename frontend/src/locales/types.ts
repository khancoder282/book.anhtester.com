/** Cùng cây khoá với bản tiếng Anh, mọi lá đều là chuỗi. Dùng để bắt bản dịch thiếu / thừa khoá. */
export type Translation<T> = {
  [K in keyof T]: T[K] extends string ? string : Translation<T[K]>;
};

/** Mọi đường dẫn tới lá chuỗi, dạng 'book.title' */
export type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TParams = Record<string, string | number>;
