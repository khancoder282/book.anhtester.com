import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

/** Trả `true` khi xoá thành công. */
export const handleDelete = (id: string): Promise<boolean> =>
  axios
    .delete(`/user/${id}`)
    .then((res) => {
      toast.success(res.data.msg);
      return true;
    })
    .catch((err) => {
      toast.error(err.response?.data?.msg ?? translate('user.toast.networkError'));
      return false;
    });
