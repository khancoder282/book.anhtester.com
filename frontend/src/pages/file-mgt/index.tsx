import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';

import Title from 'src/components/title';

import { FilePageView } from './components/file-page';

export default function Page() {
  const { t } = useTranslate();

  return (
    <>
      <Title>{`${t('file.pageTitle')} - ${CONFIG.appName}`}</Title>
      <FilePageView />
    </>
  );
}
