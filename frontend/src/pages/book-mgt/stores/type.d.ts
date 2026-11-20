type BookForm = {
  name: string;
  slug: string;
  description: string;
  picture: (FileItem | File)[];
  status: 'AVAILABLE' | 'UNAVAILABLE';
  price: number | '';
  categories: Categories['name'][];
  promotions: PromotionType[];
  // Thông tin thêm, không bắt buộc. API trả null khi chưa có; form dùng '' cho ô trống.
  author?: string | null;
  publisher?: string | null;
  publishYear?: number | '' | null;
  pageCount?: number | '' | null;
  isbn?: string | null;
  language?: string | null;
  // Đọc thử (2026-11-21), không bắt buộc. Chỉ API chi tiết trả previewContent.
  previewTitle?: string | null;
  previewContent?: string | null;
  // for edit
  pictureDel?: FileItem[];
  id?: string;
  // for view;;
  createdAt?: string;
  updatedAt?: string;
  currentPrice?: number | '';
  viewCount?: number;
  auth: {
    name: string;
    avatarUrl: string;
    email: string;
  };
};

type Categories = {
  name: string;
  /** Category tắt thì ẩn khỏi tab lọc trang Book và gợi ý trong form sách */
  isActive: boolean;
  bookCount: number;
};

type BookView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  picture: string[];
  status: 'AVAILABLE' | 'UNAVAILABLE';
  price: number;
  categories: string[];
  promotions: PromotionType[];
  createdAt: string;
  updatedAt: string;
  currentPrice: number;
  viewCount: number;
  author: string | null;
  publisher: string | null;
  publishYear: number | null;
  pageCount: number | null;
  isbn: string | null;
  language: string | null;
  previewTitle: string | null;
  /** true khi sách có chương đọc thử (nội dung lấy ở API chi tiết) */
  hasPreview: boolean;
  auth: {
    name: string;
    avatarUrl: string;
    email: string;
  };
};
