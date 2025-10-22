import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { formControl } from '../store/store-fields-login';

export async function loginHanle(prop: { email: string; password: string }) {
  return axios
    .post('/login', prop, {
      withCredentials: true,
    })
    .then((res) => {
      localStorage.setItem('accessToken', res.data.accessToken);
      toast.success(res.data.msg);
    })
    .catch((err) => {
      toast.error(err.response.data.msg);
      if (err.response.status === 422) {
        for (const [key, value] of Object.entries(err.response.data.fields)) {
          formControl.setError(key as keyof SignInForm, {
            type: 'manual',
            message: (value as string[])[0],
          });
        }
      }
      throw err;
    });
}
