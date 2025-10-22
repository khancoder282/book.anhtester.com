import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const getBook = (id: string) =>
  axios
    .get(`/book/${id}`)
    .then(
      (res) =>
        ({
          ...res.data,
        }) as BookForm
    )
    .catch((err) => {
      toast.error(err.response.data.msg);

      return {} as BookForm;
    });
