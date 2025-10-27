import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user-management',
    icon: icon('ic-user'),
  },
  {
    title: 'Books',
    path: '/book-management',
    icon: icon('ic-book'),
  },
  {
    title: 'Promotion',
    path: '/promotion-book-management',
    icon: icon('ic-sale'),
  },
  {
    title: 'File management',
    path: '/file-management',
    icon: icon('ic-dir'),
  },
];
