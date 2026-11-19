import { AxiosError } from 'axios';

import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

import { formControl } from '../store/form';

import type { UserForm } from '../store/form';

export const handleUpdateProfileUser = async (user: Partial<UserForm>) => {
  try {
    // upload Avatar
    if (user.avatar && user.avatar instanceof File) {
      toast.custom(translate('user.toast.uploadAvatar'), 'loading', {
        id: 'msg',
        duration: Infinity,
      });
      const form = new FormData();
      const f = user.avatar;
      const randomId = Math.random().toString(36).substring(2, 6);
      const newFileName = `${f.name.split('.').slice(0, -1).join('.')}_${randomId}.${f.name.split('.').pop()}`;
      const newFile = new File([f], newFileName, { type: f.type });
      form.append('files', newFile);
      form.append('path', `/$avatar-image/${user.email}`);

      await axios.post('/file', form).then((res) => {
        user.avatarUrl = res.data.paths[0];
      });
    }
    toast.custom(translate('user.toast.uploadProfile'), 'loading', {
      id: 'msg',
      duration: Infinity,
    });
    await axios
      .patch(`/profile`, {
        name: user.name,
        email: user.email,
        password_old: user.oldPassword,
        password: user.password,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
      })
      .then((res) => {
        toast.success(res.data.msg, { id: 'msg' });
        return res;
      });
  } catch (err) {
    if (user.avatar instanceof File && user.avatarUrl) {
      await axios.delete('/file', { params: { path: user.avatarUrl } }).catch(() => undefined);
    }
    if (err instanceof AxiosError) {
      toast.error(err.response?.data?.msg ?? translate('user.toast.networkError'), {
        id: 'msg',
      });
      if (err.response?.status === 422 && err.response.data?.fields) {
        for (const [key, value] of Object.entries(err.response.data.fields)) {
          formControl.setError(key as keyof SignInForm, {
            type: 'manual',
            message: (value as string[])[0],
          });
        }
      }
      throw err;
    }
  }
};
