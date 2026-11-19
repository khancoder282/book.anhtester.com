import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

export const renameFile = (opt: { path: string; name: string }) =>
  axios
    .put('/file/rename', opt)
    .then((res) => {
      toast.success(res.data.msg);
      return res;
    })
    .catch((err) => {
      toast.error(err.response?.data?.msg ?? translate('common.somethingWrong'));
      throw err;
    });
