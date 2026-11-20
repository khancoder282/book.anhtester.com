import type { CSSObject } from '@mui/material/styles';

// ----------------------------------------------------------------------
// Bộ tone màu theo AT UI kit (repo anhtester_lms, public/build/css/at-ui.css).
// Mỗi tone có: 2 điểm gradient (c1 sáng → c2 đậm), nền nhạt (bg) + chữ đậm (ink) cho chip/pill,
// và giá trị dark mode. Dùng qua CSS variable để tự đổi theo chế độ sáng/tối:
//   background: atGrad('sky')      → nút / điểm nhấn đang chọn
//   bgcolor: atBg('sky'), color: atInk('sky')   → chip, nhãn thể loại, ô thông tin
// Quy ước của kit: CAM = hành động chính (1 nút/màn), XANH LÁ = phụ/đang chọn,
// XANH DƯƠNG = thông tin/xem trước, ĐỎ = xoá. Tone bổ sung (sky, indigo, purple, pink,
// teal, mint, cyan) dùng cho nhãn phân loại, bìa mặc định, biểu đồ — không thay quy ước trên.
// ----------------------------------------------------------------------

type ToneDef = {
  c1: string;
  c2: string;
  bg: string;
  ink: string;
  bgDark: string;
  inkDark: string;
};

export const AT_TONES = {
  orange: {
    c1: '#FB8A2E',
    c2: '#E06004',
    bg: '#FFEDD5',
    ink: '#C2410C',
    bgDark: 'rgba(251,138,46,.16)',
    inkDark: '#FDBA74',
  },
  green: {
    c1: '#42BC40',
    c2: '#268A24',
    bg: '#DCFCE7',
    ink: '#15803D',
    bgDark: 'rgba(34,197,94,.16)',
    inkDark: '#86EFAC',
  },
  blue: {
    c1: '#3B8FE8',
    c2: '#1570CD',
    bg: '#DBEAFE',
    ink: '#1D4ED8',
    bgDark: 'rgba(59,130,246,.16)',
    inkDark: '#93C5FD',
  },
  // Xanh dương nhạt (bổ sung 2026-11-21 theo yêu cầu)
  sky: {
    c1: '#7DD3FC',
    c2: '#0EA5E9',
    bg: '#E0F2FE',
    ink: '#0369A1',
    bgDark: 'rgba(14,165,233,.16)',
    inkDark: '#7DD3FC',
  },
  indigo: {
    c1: '#818CF8',
    c2: '#4F46E5',
    bg: '#E0E7FF',
    ink: '#4338CA',
    bgDark: 'rgba(99,102,241,.18)',
    inkDark: '#A5B4FC',
  },
  cyan: {
    c1: '#67E8F9',
    c2: '#0891B2',
    bg: '#CFFAFE',
    ink: '#0E7490',
    bgDark: 'rgba(6,182,212,.16)',
    inkDark: '#67E8F9',
  },
  red: {
    c1: '#F0605D',
    c2: '#C9302C',
    bg: '#FEE2E2',
    ink: '#B91C1C',
    bgDark: 'rgba(239,68,68,.16)',
    inkDark: '#FCA5A5',
  },
  amber: {
    c1: '#FBBF24',
    c2: '#D97706',
    bg: '#FEF3C7',
    ink: '#B45309',
    bgDark: 'rgba(245,158,11,.16)',
    inkDark: '#FBBF24',
  },
  pink: {
    c1: '#F472B6',
    c2: '#DB2777',
    bg: '#FCE7F3',
    ink: '#BE185D',
    bgDark: 'rgba(236,72,153,.16)',
    inkDark: '#F9A8D4',
  },
  purple: {
    c1: '#A78BFA',
    c2: '#7C3AED',
    bg: '#EDE9FE',
    ink: '#6D28D9',
    bgDark: 'rgba(139,92,246,.18)',
    inkDark: '#C4B5FD',
  },
  teal: {
    c1: '#2DD4BF',
    c2: '#0D9488',
    bg: '#CCFBF1',
    ink: '#0F766E',
    bgDark: 'rgba(20,184,166,.16)',
    inkDark: '#5EEAD4',
  },
  mint: {
    c1: '#6EE7B7',
    c2: '#059669',
    bg: '#D1FAE5',
    ink: '#047857',
    bgDark: 'rgba(16,185,129,.16)',
    inkDark: '#6EE7B7',
  },
  slate: {
    c1: '#475569',
    c2: '#1E293B',
    bg: '#F1F5F9',
    ink: '#475569',
    bgDark: 'rgba(148,163,184,.14)',
    inkDark: '#CBD5E1',
  },
} satisfies Record<string, ToneDef>;

export type AtTone = keyof typeof AT_TONES;

export const atGrad = (tone: AtTone) => `var(--at-grad-${tone})`;
export const atGlow = (tone: AtTone) => `var(--at-glow-${tone})`;
export const atBg = (tone: AtTone) => `var(--at-${tone}-bg)`;
export const atInk = (tone: AtTone) => `var(--at-${tone}-ink)`;
export const atC1 = (tone: AtTone) => `var(--at-${tone}-1)`;
export const atC2 = (tone: AtTone) => `var(--at-${tone}-2)`;

/** Tone dùng để tô nhãn thể loại / bìa mặc định — luôn cùng một màu cho cùng một tên. */
const LABEL_TONES: AtTone[] = [
  'sky',
  'purple',
  'teal',
  'orange',
  'pink',
  'indigo',
  'mint',
  'amber',
  'cyan',
  'blue',
  'green',
  'red',
];

export function toneOf(name: string): AtTone {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  return LABEL_TONES[hash % LABEL_TONES.length];
}

const hexToRgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

function lightVars(): CSSObject {
  const vars: CSSObject = {
    '--at-gloss': 'inset 0 1px 0 rgba(255, 255, 255, .2)',
    '--at-line': '#E5E9F0',
    '--at-sunken': '#F3F5F8',
    '--at-shadow': '0 1px 2px rgba(15, 23, 42, .06), 0 4px 14px rgba(15, 23, 42, .06)',
    '--at-shadow-sm': '0 1px 2px rgba(15, 23, 42, .08), 0 2px 6px rgba(15, 23, 42, .08)',
    '--at-paper': '#FBF7EE',
    '--at-paper-ink': '#2B2118',
  };
  (Object.keys(AT_TONES) as AtTone[]).forEach((k) => {
    const t: ToneDef = AT_TONES[k];
    vars[`--at-${k}-1`] = t.c1;
    vars[`--at-${k}-2`] = t.c2;
    vars[`--at-grad-${k}`] = `linear-gradient(135deg, ${t.c1}, ${t.c2})`;
    vars[`--at-glow-${k}`] = `0 4px 12px rgba(${hexToRgb(t.c2)}, .28)`;
    vars[`--at-${k}-bg`] = t.bg;
    vars[`--at-${k}-ink`] = t.ink;
  });
  return vars;
}

function darkVars(): CSSObject {
  const vars: CSSObject = {
    '--at-line': '#273042',
    '--at-sunken': '#0F131B',
    '--at-shadow': '0 1px 2px rgba(0, 0, 0, .4), 0 6px 18px rgba(0, 0, 0, .35)',
    '--at-shadow-sm': '0 1px 2px rgba(0, 0, 0, .4), 0 2px 6px rgba(0, 0, 0, .3)',
    '--at-paper': '#1F1B16',
    '--at-paper-ink': '#E9E1D3',
  };
  (Object.keys(AT_TONES) as AtTone[]).forEach((k) => {
    const t: ToneDef = AT_TONES[k];
    vars[`--at-${k}-bg`] = t.bgDark;
    vars[`--at-${k}-ink`] = t.inkDark;
  });
  return vars;
}

/** Style toàn cục: khai báo biến ở :root, ghi đè khi `data-color-scheme="dark"`. */
export const atToneGlobalStyles: CSSObject = {
  ':root': lightVars(),
  '[data-color-scheme="dark"]': darkVars(),
};
