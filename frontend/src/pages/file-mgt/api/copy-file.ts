import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const copyFile = (opt: { oldPath: string; newPath: string }) =>
  axios
    .post('/file/copy', opt)
    .then((res) => {
      toast.success(res.data.msg);
      return res;
    })
    .catch((err) => {
      toast.error(err.response.data.msg);
      throw err;
    });
