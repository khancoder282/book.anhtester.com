import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

/** Trả `true` khi xoá thành công, `false` khi lỗi (đã hiện toast). */
export const deletePromotion = (id: string) =>
  axios
    .delete(`/promotion-book/${id}`)
    .then((res) => {
      toast.success(res.data.msg);
      return true;
    })
    .catch((err) => {
      toast.error(err.response?.data?.msg);
      return false;
    });
