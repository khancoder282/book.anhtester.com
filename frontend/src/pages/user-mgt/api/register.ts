import { AxiosError } from 'axios';

import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { formControl } from '../store/form';

import type { UserForm } from '../store/form';

export const handleRegisterUser = async (user: UserForm) => {
  try {
    toast.custom("Upload user...", "loading", { id: "upload-user", duration: Infinity });
    await axios
      .post('/register', {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
      })
      .then((res) => {
        toast.success(res.data.msg, { id: "upload-user" });
        return res;
      })
  } catch (err) {
    if (user.avatar instanceof File && user.avatarUrl) {
      await axios.delete('/file', { params: { path: user.avatarUrl } })
    }
    if (err instanceof AxiosError) {
      toast.error(err.response?.data.msg, { id: "upload-user" });
      if (err.response?.status === 422) {
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
}
