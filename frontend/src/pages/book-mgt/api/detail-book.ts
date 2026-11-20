import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

export const getDetailBook = (id: string) =>
  axios
    .get(`/book/${id}`, { params: { view: 'true' } })
    .then((res) => res.data as BookForm)
    .catch((err) => {
      // Mất mạng / timeout thì không có err.response (W22)
      toast.error(err?.response?.data?.msg ?? translate('book.toast.networkError'));
      throw err;
    });
