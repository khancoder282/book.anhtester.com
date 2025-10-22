import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const uploadFile = (formData: FormData) =>
  axios
    .post('/file', formData)
    .then((res) => toast.success(res.data.msg))
    .catch((err) => {
      toast.error(err.response.data.msg);
      throw err;
    });
