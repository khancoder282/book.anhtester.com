import Card from '@mui/material/Card';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { PageHeader } from 'src/components/page-header/page-header';

import { HelpContent } from './help-content';

// ----------------------------------------------------------------------

/** `/contact`: thông tin liên hệ trong dashboard, mở từ mục "Contact" ở cuối sidebar. */
export default function ContactPage() {
  const { t } = useTranslate();

  return (
    <>
      <Title>{`${t('nav.contact')} - ${CONFIG.appName}`}</Title>
      <DashboardContent maxWidth="md">
        <PageHeader
          icon="solar:chat-round-dots-bold"
          tone="sky"
          title={t('nav.contact')}
          subtitle={t('help.description')}
        />
        <Card data-testid="contact-card" sx={{ p: { xs: 2.5, md: 4 } }}>
          <HelpContent />
        </Card>
      </DashboardContent>
    </>
  );
}
