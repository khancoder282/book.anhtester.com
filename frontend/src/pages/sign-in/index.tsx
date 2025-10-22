import { CONFIG } from 'src/config-global';

import Title from 'src/components/title';

import { ContentFieldsLogin } from './components/content-fields-login';

export default function SignInPage() {
  return (
    <>
      <Title>{`Sign in - ${CONFIG.appName}`}</Title>
      <ContentFieldsLogin />
    </>
  );
}
