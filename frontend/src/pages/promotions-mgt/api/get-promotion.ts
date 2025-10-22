import { axios } from 'src/api/axios';

export const getPromotion = (
  params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    sortBy?: string;
  } = {}
) =>
  axios
    .get('/promotion-book', { params })
    .then((t) => t.data as { list: PromotionType[]; pagination: { total: number } });
