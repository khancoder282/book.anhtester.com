import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { toPromotionBody, handlePromotionError } from './create-promotion';

import type { PromotionForm } from '../hooks/form-control';

/** PATCH: gửi đủ các trường của form; `books` thay thế toàn bộ danh sách sách áp dụng. */
export const updatePromotion = (id: string, promotion: PromotionForm) =>
  axios
    .patch(`/promotion-book/${id}`, toPromotionBody(promotion))
    .then((t) => {
      toast.success(t.data.msg);
      return t;
    })
    .catch(handlePromotionError);
