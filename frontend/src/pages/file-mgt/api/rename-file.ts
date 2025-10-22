import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const renameFile = (opt: { path: string; name: string }) =>
  axios
    .put('/file/rename', opt)
    .then((res) => {
      toast.success(res.data.msg);
      return res;
    })
    .catch((err) => {
      toast.error(err.response.data.msg);
      throw err;
    });
