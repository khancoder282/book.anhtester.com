interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
