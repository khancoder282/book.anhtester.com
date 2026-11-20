import type { TKey } from 'src/locales';

import { isHiddenPath } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: TKey;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  /** Ghim xuống đáy sidebar, tách khỏi nhóm menu chính */
  bottom?: boolean;
};

const allNavData: NavItem[] = [
  {
    title: 'nav.dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'nav.user',
    path: '/user-management',
    icon: icon('ic-user'),
  },
  {
    title: 'nav.book',
    path: '/book-management',
    icon: icon('ic-book'),
  },
  {
    title: 'nav.category',
    path: '/category-management',
    icon: icon('ic-category'),
  },
  {
    title: 'nav.promotion',
    path: '/promotion-book-management',
    icon: icon('ic-sale'),
  },
  {
    title: 'nav.file',
    path: '/file-management',
    icon: icon('ic-dir'),
  },
  {
    title: 'nav.database',
    path: '/db-management',
    icon: icon('ic-db'),
  },
  {
    title: 'nav.contact',
    path: '/contact',
    icon: icon('ic-contact'),
    bottom: true,
  },
];

// Màn trong CONFIG.hiddenPaths không hiện trên menu
export const navData: NavItem[] = allNavData.filter((item) => !isHiddenPath(item.path));
