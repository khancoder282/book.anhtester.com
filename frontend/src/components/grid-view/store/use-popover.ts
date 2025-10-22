import { create } from 'zustand';

type usePopupActionProps = {
  open: boolean;
  row: unknown;
  anchorEl: HTMLElement | null;
  setOpen: (open: boolean) => void;
  setRow: (row: unknown) => void;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
};

export const usePopupAction = create<usePopupActionProps>((set) => ({
  open: false,
  row: null,
  anchorEl: null,
  setOpen: (open) => set({ open }),
  setRow: (row) => set({ row }),
  setAnchorEl: (anchorEl) => set({ anchorEl }),
}));
