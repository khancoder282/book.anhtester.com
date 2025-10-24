import { toast } from 'src/components/toast';

import { axios } from './axios';

export const hanldeLogout = () =>
  axios.delete('/logout').then((res) => {
    localStorage.removeItem('accessToken');
    toast.success(res.data.msg, { id: "msg" });
  }).catch((err) => toast.error(err.response.data.msg, { id: "msg" }));
