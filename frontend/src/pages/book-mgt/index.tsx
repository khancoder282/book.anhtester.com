import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';

import Title from 'src/components/title';

import { BookView } from './page';

export default function BookPage() {
  const { t } = useTranslate();

  return (
    <>
      <Title>
        {t('book.title')} - {CONFIG.appName}
      </Title>
      <BookView />
    </>
  );
}
