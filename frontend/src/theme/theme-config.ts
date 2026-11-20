import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'Inter Variable',
    secondary: 'Merriweather Variable',
  },
  /** **************************************
   * Palette — theo AT UI kit (repo anhtester_lms, public/build/css/at-ui.css, 2026-11-21)
   * primary = xanh lá logo (#42BC40 → #268A24): hành động phụ, đang chọn, liên kết
   * secondary = cam (#FB8A2E → #E06004): HÀNH ĐỘNG CHÍNH, mỗi màn 1 nút
   * info = xanh dương, error = đỏ, warning = vàng hổ phách, grey = slate
   * Tone bổ sung (xanh dương nhạt, tím, hồng, teal, mint, chàm): src/theme/at-tones.ts
   *************************************** */
  palette: {
    primary: {
      lighter: '#EBF7EA',
      light: '#42BC40',
      main: '#268A24',
      dark: '#1E6E1C',
      darker: '#124712',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#FFEDD5',
      light: '#FB8A2E',
      main: '#E06004',
      dark: '#C2410C',
      darker: '#7C2D12',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#DBEAFE',
      light: '#3B8FE8',
      main: '#1570CD',
      dark: '#1D4ED8',
      darker: '#1E3A8A',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#DCFCE7',
      light: '#4ADE80',
      main: '#16A34A',
      dark: '#15803D',
      darker: '#14532D',
      contrastText: '#FFFFFF',
    },
    warning: {
      lighter: '#FEF3C7',
      light: '#FBBF24',
      main: '#F59E0B',
      dark: '#B45309',
      darker: '#78350F',
      contrastText: '#0F172A',
    },
    error: {
      lighter: '#FEE2E2',
      light: '#F0605D',
      main: '#C9302C',
      dark: '#B91C1C',
      darker: '#7F1D1D',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#F8FAFC',
      '100': '#F3F5F8',
      '200': '#E5E9F0',
      '300': '#CBD5E1',
      '400': '#94A3B8',
      '500': '#64748B',
      '600': '#475569',
      '700': '#334155',
      '800': '#1E293B',
      '900': '#0F172A',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
