import { create } from 'zustand';

type AuthCheckState = {
  /** true khi lần gọi `/me` đầu tiên đã xong (thành công hay thất bại). */
  checked: boolean;
  setChecked: (checked: boolean) => void;
};

export const useAuth = create<AuthState & AuthActions & AuthCheckState>((set) => ({
  auth: null,
  checked: false,
  setAuth: (auth) => set({ auth }),
  setChecked: (checked) => set({ checked }),
}));
