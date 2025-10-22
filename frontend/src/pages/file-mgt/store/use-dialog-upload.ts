import { create } from 'zustand';

type State = {
  open: boolean;
  setOpen: (open: boolean) => void;
  path: string;
  setPath: (path: string) => void;
  rootPath: string;
  setRootPath: (path: string) => void;
};

export const useDialogUpload = create<State>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  path: '',
  setPath: (path: string) => set({ path }),
  rootPath: '',
  setRootPath: (path: string) => set({ rootPath: path }),
}));
