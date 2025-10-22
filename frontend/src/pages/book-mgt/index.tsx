import { CONFIG } from 'src/config-global';

import Title from 'src/components/title';

import { BookView } from './page';

export default function page() {
  return (
    <>
      <Title>Book Management - {CONFIG.appName}</Title>
      <BookView />
    </>
  );
}
