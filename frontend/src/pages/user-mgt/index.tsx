import { CONFIG } from 'src/config-global';

import Title from 'src/components/title';

import { ViewUser } from './components/view-user';

export default function UserMgt() {
  return (
    <>
      <Title>User Management - {CONFIG.appName}</Title>
      <ViewUser />
    </>
  );
}
