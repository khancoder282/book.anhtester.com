import type { TKey } from 'src/locales';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: TKey;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData: NavItem[] = [
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
    icon: icon('ic-blog'),
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
];
