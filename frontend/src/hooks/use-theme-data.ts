import Color from 'color';
import { create } from "zustand";

export const useThemeData = create<{ primary: string, setPrimary: (primary: string) => void }>(set => ({
    primary: '#42BC40',
    setPrimary: (primary: string) => set({ primary })
}))

export const generateColorPalette = (mainColor: string) => {
    const baseColor = Color(mainColor);

    return {
        lighter: baseColor.lighten(0.3).hex(),
        light: baseColor.lighten(0.15).hex(),
        main: baseColor.hex(),
        dark: baseColor.darken(0.15).hex(),
        darker: baseColor.darken(0.3).hex(),
        contrastText: baseColor.isLight() ? '#000000' : '#ffffff',
    };
};