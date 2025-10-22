import { CONFIG } from 'src/config-global';

import Title from 'src/components/title';

import { FilePageView } from './components/file-page';

export default function Page() {
  return (
    <>
      <Title>File Management - {CONFIG.appName}</Title>
      <FilePageView />
    </>
  );
}
