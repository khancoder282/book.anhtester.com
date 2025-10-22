import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const handleDelete = (id: string) =>
  axios
    .delete(`/user/${id}`)
    .then((res) => toast.success(res.data.msg))
    .catch((err) => toast.error(err.response.data.msg));
