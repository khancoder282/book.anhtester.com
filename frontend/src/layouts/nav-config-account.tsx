import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'nav.account.home',
    href: '/',
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'nav.account.profile',
    href: '/user-management/my-profile',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    label: 'nav.account.settings',
    href: '/user-management/setting-account',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  },
];
