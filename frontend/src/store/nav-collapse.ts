import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Trạng thái thu gọn sidebar (desktop). Lưu localStorage → chỉ áp dụng cho trình duyệt đang dùng,
// không đồng bộ qua tài khoản. localStorage bị chặn (chế độ riêng tư) thì vẫn chạy, chỉ không nhớ.

type NavCollapseState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const NAV_COLLAPSE_STORAGE_KEY = 'book-anhtester:nav-collapsed';

export const useNavCollapse = create<NavCollapseState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: NAV_COLLAPSE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ collapsed: s.collapsed }),
    }
  )
);
