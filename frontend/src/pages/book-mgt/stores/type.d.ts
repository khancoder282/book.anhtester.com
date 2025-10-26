type BookForm = {
  name: string;
  slug: string;
  description: string;
  picture: (FileItem | File)[];
  status: 'AVAILABLE' | 'UNAVAILABLE';
  price: number | '';
  categories: Categories['name'][];
  promotions: PromotionType[];
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
  auth: {
    name: string;
    avatarUrl: string;
    email: string;
  };
};
