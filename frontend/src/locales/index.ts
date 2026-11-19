import 'dayjs/locale/vi';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { create } from 'zustand';

import { db as enDb } from './en/db';
import { db as viDb } from './vi/db';
import { nav as enNav } from './en/nav';
import { nav as viNav } from './vi/nav';
import { auth as enAuth } from './en/auth';
import { book as enBook } from './en/book';
import { file as enFile } from './en/file';
import { home as enHome } from './en/home';
import { user as enUser } from './en/user';
import { auth as viAuth } from './vi/auth';
import { book as viBook } from './vi/book';
import { file as viFile } from './vi/file';
import { home as viHome } from './vi/home';
import { user as viUser } from './vi/user';
import { common as enCommon } from './en/common';
import { common as viCommon } from './vi/common';
import { category as enCategory } from './en/category';
import { category as viCategory } from './vi/category';
import { promotion as enPromotion } from './en/promotion';
import { promotion as viPromotion } from './vi/promotion';
import { components as enComponents } from './en/components';
import { components as viComponents } from './vi/components';

import type { Leaves, TParams, Translation } from './types';

// ----------------------------------------------------------------------

const en = {
  common: enCommon,
  nav: enNav,
  auth: enAuth,
  home: enHome,
  book: enBook,
  user: enUser,
  category: enCategory,
  promotion: enPromotion,
  file: enFile,
  db: enDb,
  components: enComponents,
};

const vi: Translation<typeof en> = {
  common: viCommon,
  nav: viNav,
  auth: viAuth,
  home: viHome,
  book: viBook,
  user: viUser,
  category: viCategory,
  promotion: viPromotion,
  file: viFile,
  db: viDb,
  components: viComponents,
};

export type Lang = 'en' | 'vi';

/** Khoá dịch, dạng 'book.title'. Sai khoá là lỗi TypeScript. */
export type TKey = Leaves<typeof en>;

export const LANGS: { value: Lang; label: string; short: string }[] = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'vi', label: 'Tiếng Việt', short: 'VI' },
];

const resources: Record<Lang, unknown> = { en, vi };

const STORAGE_KEY = 'lang';
const DATE_LOCALE: Record<Lang, string> = { en: 'en', vi: 'vi' };

const isLang = (value: unknown): value is Lang => value === 'en' || value === 'vi';

/** Thứ tự: ?lang= trên URL → localStorage → mặc định 'en' (giữ nguyên chữ mà test cũ đang bám) */
function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // localStorage có thể bị chặn, dùng mặc định
  }
  return 'en';
}

function applyLang(lang: Lang) {
  dayjs.locale(DATE_LOCALE[lang]);
  document.documentElement.lang = lang;
}

const lookup = (lang: Lang, key: string): string | undefined => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      resources[lang]
    );
  return typeof value === 'string' ? value : undefined;
};

function format(lang: Lang, key: TKey, params?: TParams): string {
  const text = lookup(lang, key) ?? lookup('en', key) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

// ----------------------------------------------------------------------

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const startLang = initialLang();
applyLang(startLang);

export const useLangStore = create<LangState>((set) => ({
  lang: startLang,
  setLang: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // bỏ qua, chỉ không nhớ được lựa chọn
    }
    applyLang(lang);
    set({ lang });
  },
}));

/**
 * Dịch ngoài component (file api, hàm tiện ích). Component thì dùng `useTranslate()`
 * để tự vẽ lại khi đổi ngôn ngữ.
 */
export const translate = (key: TKey, params?: TParams) =>
  format(useLangStore.getState().lang, key, params);

/** Hook dịch cho component. Đổi ngôn ngữ thì component vẽ lại. */
export function useTranslate() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return useMemo(
    () => ({
      lang,
      setLang,
      t: (key: TKey, params?: TParams) => format(lang, key, params),
    }),
    [lang, setLang]
  );
}
