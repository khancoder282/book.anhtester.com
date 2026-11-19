import dayjs from 'dayjs';

import { axios } from 'src/api/axios';
import { getBooks } from 'src/pages/book-mgt/api/get-books';

import { toast } from 'src/components/toast';

import type { PromotionForm } from '../hooks/form-control';

type PromotionDetail = Omit<PromotionType, 'countBooks'> & {
  books: { id: string }[];
};

/** Lấy khuyến mãi để sửa, chuyển sang dạng dữ liệu của form. */
export const getPromotionDetail = async (id: string): Promise<PromotionForm> => {
  try {
    const promotion = await axios
      .get(`/promotion-book/${id}`)
      .then((res) => res.data as PromotionDetail);

    const ids = promotion.books.map((b) => b.id);
    // Lấy sách cùng dạng với bảng chọn sách để tick/bỏ tick khớp đúng dòng
    const books = ids.length
      ? await getBooks({
          search: JSON.stringify({ id: { in: ids } }),
          page: 1,
          limit: ids.length,
          sort: 'createdAt',
          sortBy: 'desc',
        }).then((res) => res.list)
      : [];

    return {
      name: promotion.name,
      code: promotion.code,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: dayjs(promotion.startDate),
      endDate: dayjs(promotion.endDate),
      isActive: promotion.isActive,
      books,
    };
  } catch (err: any) {
    toast.error(err?.response?.data?.msg);
    throw err;
  }
};
