import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const deleteFile = (path: string) =>
  axios
    .delete(`/file`, { params: { path } })
    .then((res) => {
      toast.success(res.data.msg);
      return res;
    })
    .catch((err) => {
      toast.error(err.response.data.msg);
      throw err;
    });
