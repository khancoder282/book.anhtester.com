import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

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
      // Mất mạng / timeout thì không có err.response (W22)
      toast.error(err?.response?.data?.msg ?? translate('book.toast.getError'));

      return {} as BookForm;
    });
