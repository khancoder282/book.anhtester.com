import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { atGrad, atGlow } from 'src/theme/at-tones';
import { useNavCollapse } from 'src/store/nav-collapse';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { NavItem } from '../nav-config-dashboard';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  /** Sidebar thu gọn: chỉ hiện icon, tên mục hiện ở tooltip */
  mini?: boolean;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();
  const { t } = useTranslate();
  const { collapsed, toggle } = useNavCollapse();

  return (
    <Box
      data-testid="nav-desktop"
      data-collapsed={collapsed}
      sx={{
        pt: 2.5,
        px: collapsed ? 1.25 : 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        transition: theme.transitions.create(['width', 'padding'], {
          easing: 'var(--layout-transition-easing)',
          duration: 'var(--layout-transition-duration)',
        }),
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <Tooltip title={collapsed ? t('nav.expand') : t('nav.collapse')} placement="right">
        <IconButton
          size="small"
          onClick={toggle}
          data-testid="nav-toggle"
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          aria-expanded={!collapsed}
          sx={{
            p: 0.5,
            top: 28,
            right: -14,
            zIndex: 1,
            position: 'absolute',
            color: 'common.white',
            backgroundImage: atGrad('green'),
            boxShadow: `${atGlow('green')}, 0 0 0 3px ${theme.vars.palette.background.paper}`,
            '&:hover': { filter: 'brightness(1.08)' },
          }}
        >
          <Iconify
            width={18}
            icon="eva:arrow-ios-back-fill"
            sx={{ transition: 'transform .2s', transform: collapsed ? 'rotate(180deg)' : 'none' }}
          />
        </IconButton>
      </Tooltip>

      <NavContent data={data} slots={slots} mini={collapsed} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx, mini }: NavContentProps) {
  const pathname = usePathname();
  const { t } = useTranslate();

  return (
    <>
      {mini ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Logo
            src="/assets/anhtester_logo_80.png"
            height={44}
            sx={{ width: 44, objectFit: 'cover', objectPosition: 'left', borderRadius: 1.5 }}
          />
        </Box>
      ) : (
        <Logo />
      )}

      {slots?.topArea}

      <Scrollbar fillContent sx={{ mt: 4 }}>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => {
              const isActived =
                item.path !== '/' ? pathname.startsWith(item.path) : item.path === pathname;

              const button = (
                <ListItemButton
                  disableGutters
                  component={RouterLink}
                  href={item.path}
                  aria-label={mini ? t(item.title) : undefined}
                  data-active={isActived}
                  sx={[
                    (theme) => ({
                      pl: mini ? 0 : 2,
                      py: 1,
                      gap: 2,
                      pr: mini ? 0 : 1.5,
                      borderRadius: 1.25,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      color: theme.vars.palette.text.secondary,
                      minHeight: 46,
                      justifyContent: mini ? 'center' : 'flex-start',
                      '&:hover': { color: theme.vars.palette.text.primary },
                      ...(isActived && {
                        fontWeight: 'fontWeightSemiBold',
                        color: theme.vars.palette.primary.main,
                        bgcolor: varAlpha(theme.vars.palette.primary.lightChannel, 0.12),
                        boxShadow: `inset 3px 0 0 ${theme.vars.palette.primary.light}`,
                        '&:hover': {
                          color: theme.vars.palette.primary.main,
                          bgcolor: varAlpha(theme.vars.palette.primary.lightChannel, 0.18),
                        },
                      }),
                    }),
                  ]}
                >
                  <Box component="span" sx={{ width: 24, height: 24, flexShrink: 0 }}>
                    {item.icon}
                  </Box>

                  {!mini && (
                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {t(item.title)}
                    </Box>
                  )}

                  {!mini && item.info && item.info}
                </ListItemButton>
              );

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  {mini ? (
                    <Tooltip title={t(item.title)} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  )}
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
