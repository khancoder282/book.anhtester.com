import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

/** Trả `true` khi xoá thành công, `false` khi lỗi (đã hiện toast). */
export const deleteBook = (id: string) =>
  axios
    .delete(`/book/${id}`)
    .then((res) => {
      toast.success(res.data.msg);
      return true;
    })
    .catch((err) => {
      toast.error(err?.response?.data?.msg ?? translate('book.toast.deleteError'));
      return false;
    });
