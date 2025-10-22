import { CONFIG } from 'src/config-global';

import Title from 'src/components/title';

import { ContentFieldsRegister } from './components/content-fields-register';

export default function SignInPage() {
  return (
    <>
      <Title>{`Sign up - ${CONFIG.appName}`}</Title>
      <ContentFieldsRegister />
    </>
  );
}
