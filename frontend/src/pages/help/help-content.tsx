import type { IconifyName } from 'src/components/iconify';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { type TKey, useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Thông tin lấy từ https://anhtester.com/contact

type ContactItem = {
  id: string;
  label: TKey;
  value: string;
  href: string;
  icon: IconifyName;
  color: string;
};

const CONTACTS: ContactItem[] = [
  {
    id: 'phone',
    label: 'help.contact.phone',
    value: '0939 206 009',
    href: 'tel:0939206009',
    icon: 'solar:phone-bold',
    color: '#42BC40',
  },
  {
    id: 'email',
    label: 'help.contact.email',
    value: 'thaian.it15@gmail.com',
    href: 'mailto:thaian.it15@gmail.com',
    icon: 'solar:letter-bold',
    color: '#EA4335',
  },
  {
    id: 'zalo',
    label: 'help.contact.zalo',
    value: 'zalo.me/0939206009',
    href: 'https://zalo.me/0939206009',
    icon: 'simple-icons:zalo',
    color: '#0068FF',
  },
  {
    id: 'website',
    label: 'help.contact.website',
    value: 'anhtester.com',
    href: 'https://anhtester.com',
    icon: 'solar:global-bold',
    color: '#E86A1A',
  },
];

type SocialItem = { id: string; name: string; href: string; icon: IconifyName; color: string };

const SOCIALS: SocialItem[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    href: 'https://facebook.com/anhtester',
    icon: 'ri:facebook-circle-fill',
    color: '#1877F2',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    href: 'https://youtube.com/@anhtester',
    icon: 'ri:youtube-fill',
    color: '#FF0000',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    href: 'https://t.me/anhtester',
    icon: 'ri:telegram-fill',
    color: '#26A5E4',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/anhtester',
    icon: 'ri:linkedin-box-fill',
    color: '#0A66C2',
  },
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/anhtester',
    icon: 'ri:github-fill',
    color: 'currentColor',
  },
  {
    id: 'discord',
    name: 'Discord',
    href: 'https://discord.gg/pzendtpJnt',
    icon: 'ri:discord-fill',
    color: '#5865F2',
  },
];

type CommunityItem = {
  id: string;
  platform: string;
  name: TKey;
  href: string;
  icon: IconifyName;
  color: string;
};

const COMMUNITIES: CommunityItem[] = [
  {
    id: 'zalo-automation',
    platform: 'Zalo',
    name: 'help.community.automation',
    href: 'https://zalo.me/g/lsxswc560',
    icon: 'simple-icons:zalo',
    color: '#0068FF',
  },
  {
    id: 'zalo-manual',
    platform: 'Zalo',
    name: 'help.community.manual',
    href: 'https://zalo.me/g/mmwgnt932',
    icon: 'simple-icons:zalo',
    color: '#0068FF',
  },
  {
    id: 'facebook-automation',
    platform: 'Facebook',
    name: 'help.community.automation',
    href: 'https://www.facebook.com/groups/automationtest',
    icon: 'ri:facebook-circle-fill',
    color: '#1877F2',
  },
  {
    id: 'facebook-manual',
    platform: 'Facebook',
    name: 'help.community.manual',
    href: 'https://www.facebook.com/groups/manualtest',
    icon: 'ri:facebook-circle-fill',
    color: '#1877F2',
  },
  {
    id: 'facebook-playwright',
    platform: 'Facebook',
    name: 'help.community.playwright',
    href: 'https://www.facebook.com/groups/playwrightvietnam',
    icon: 'ri:facebook-circle-fill',
    color: '#1877F2',
  },
  {
    id: 'facebook-jobs',
    platform: 'Facebook',
    name: 'help.community.jobs',
    href: 'https://www.facebook.com/groups/testerclub',
    icon: 'ri:facebook-circle-fill',
    color: '#1877F2',
  },
  {
    id: 'telegram-automation',
    platform: 'Telegram',
    name: 'help.community.automation',
    href: 'https://t.me/+kSUGJ3pVvxkyZWU1',
    icon: 'ri:telegram-fill',
    color: '#26A5E4',
  },
  {
    id: 'telegram-manual',
    platform: 'Telegram',
    name: 'help.community.manual',
    href: 'https://t.me/+8eChRz7OVqliZWRl',
    icon: 'ri:telegram-fill',
    color: '#26A5E4',
  },
];

/** Link ra ngoài: tel/mailto mở ứng dụng, còn lại mở tab mới */
const externalProps = (href: string) =>
  href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};

// ----------------------------------------------------------------------

/** Ba khối Liên hệ · Mạng xã hội · Cộng đồng. Dùng chung cho `/help` (chưa đăng nhập) và `/contact` (trong dashboard). */
export function HelpContent() {
  const { t } = useTranslate();

  const renderSectionTitle = (title: string) => (
    <Typography variant="overline" component="h2" sx={{ color: 'text.secondary', mb: 1.5 }}>
      {title}
    </Typography>
  );

  return (
    <>
      <Box component="section" aria-label={t('help.contact.title')}>
        {renderSectionTitle(t('help.contact.title'))}
        <Stack spacing={1.5}>
          {CONTACTS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              underline="none"
              color="inherit"
              data-testid={`help-contact-${item.id}`}
              {...externalProps(item.href)}
              sx={(theme) => ({
                gap: 2,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1.5,
                border: `1px solid ${theme.vars.palette.divider}`,
                transition: theme.transitions.create(['background-color', 'border-color']),
                '&:hover': {
                  bgcolor: theme.vars.palette.action.hover,
                  borderColor: theme.vars.palette.text.disabled,
                },
              })}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  bgcolor: `${item.color}1F`,
                }}
              >
                <Iconify icon={item.icon} width={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {t(item.label)}
                </Typography>
                <Typography variant="subtitle1" noWrap>
                  {item.value}
                </Typography>
              </Box>
            </Link>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Box component="section" aria-label={t('help.social.title')}>
        {renderSectionTitle(t('help.social.title'))}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SOCIALS.map((item) => (
            <Tooltip key={item.id} title={item.name}>
              <IconButton
                component="a"
                href={item.href}
                aria-label={item.name}
                data-testid={`help-social-${item.id}`}
                {...externalProps(item.href)}
                sx={{ color: item.color, border: 1, borderColor: 'divider' }}
              >
                <Iconify icon={item.icon} width={24} />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Box component="section" aria-label={t('help.community.title')}>
        {renderSectionTitle(t('help.community.title'))}
        <Box
          sx={{
            gap: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {COMMUNITIES.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              color="inherit"
              underline="hover"
              data-testid={`help-community-${item.id}`}
              {...externalProps(item.href)}
              sx={{ gap: 1, display: 'flex', alignItems: 'center', typography: 'body2', py: 0.5 }}
            >
              <Iconify icon={item.icon} width={20} sx={{ color: item.color, flexShrink: 0 }} />
              {`${item.platform} · ${t(item.name)}`}
            </Link>
          ))}
        </Box>
      </Box>
    </>
  );
}
