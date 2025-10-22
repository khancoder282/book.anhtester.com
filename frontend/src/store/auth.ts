import { create } from 'zustand'

export const useAuth = create<AuthState & AuthActions>(set=>({
    auth: null,
    setAuth: (auth) => set({ auth })
}))