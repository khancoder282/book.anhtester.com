import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

export const getBooks = (params: {
  sortBy: string;
  sort: string;
  page: number;
  limit: number;
  search: string;
}) =>
  axios
    .get(`/book`, { params })
    .then(
      (res) =>
        res.data as {
          list: BookView[];
          pagination: {
            currentPage: number;
            lengthData: number;
            total: number;
            totalPage: number;
          };
        }
    )
    .catch((err) => {
      // Mất mạng / timeout thì không có err.response (W22)
      toast.error(err?.response?.data?.msg ?? translate('book.toast.networkError'));
      throw err;
    });
