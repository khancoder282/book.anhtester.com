import { AxiosError } from 'axios';

import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { setError, type PromotionForm } from '../hooks/form-control';

export const toPromotionBody = (promotion: PromotionForm) => ({
  name: promotion.name,
  code: promotion.code,
  description: promotion.description,
  type: promotion.type,
  value: promotion.type === 'FREE_SHIPPING' ? 0 : Number(promotion.value ?? '0'),
  startDate: promotion.startDate,
  endDate: promotion.endDate,
  isActive: Boolean(promotion.isActive),
  books: promotion.books.map((x) => x.id),
});

export const handlePromotionError = (err: unknown) => {
  if (err instanceof AxiosError) {
    toast.error(err.response?.data?.msg);
    if (err.response?.status === 422 && err.response.data?.fields) {
      for (const [key, value] of Object.entries(err.response.data.fields)) {
        setError(key as keyof PromotionForm, {
          type: 'manual',
          message: (value as string[])[0],
        });
      }
    }
  }
  throw err;
};

export const createPromotion = (promotion: PromotionForm) =>
  axios
    .post('/promotion-book', toPromotionBody(promotion))
    .then((t) => {
      toast.success(t.data.msg);
      return t;
    })
    .catch(handlePromotionError);
