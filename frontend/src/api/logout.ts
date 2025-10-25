import { toast } from 'src/components/toast';

import { axios } from './axios';

export const hanldeLogout = () =>
  axios.delete('/logout', { withCredentials: true }).then((res) => {
    localStorage.removeItem('accessToken');
    toast.success(res.data.msg, { id: "msg" });
    return res;
  }).catch((err) => toast.error(err.response.data.msg, { id: "msg" }));
