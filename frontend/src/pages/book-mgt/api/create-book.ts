import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

import { setError } from '../stores/form-add';
import { bookExtraPayload } from '../utils/book-extra';

export const slugify = (s: string) =>
  s
    .replace(/[Đđ]/g, 'd')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const handleCreateBook = async (book: BookForm) => {
  const id = 'create-book';
  try {
    toast.custom(translate('book.toast.uploadingImage'), 'loading', {
      hiddenCloseButton: true,
      id,
    });
    const form = new FormData();
    book.picture?.forEach((f) => {
      if (f instanceof File) {
        const randomId = Math.random().toString(36).substring(2, 6);
        const newFileName = `${f.name.split('.').slice(0, -1).join('.')}_${randomId}.${f.name.split('.').pop()}`;
        const newFile = new File([f], newFileName, { type: f.type });
        form.append('files', newFile);
      }
    });
    form.append('path', `/$book-image/${book.slug}`);
    const paths = await axios.post('/file', form).then((res) => res.data.paths);
    // upload book
    toast.custom(translate('book.toast.uploadingBook'), 'loading', {
      hiddenCloseButton: true,
      id,
      duration: Infinity,
    });

    // `await` để lỗi rơi vào catch bên dưới (gán lỗi 422 vào từng ô của form)
    return await axios
      .post('/book', {
        name: book.name,
        description: book.description,
        status: book.status,
        categories: book.categories,
        slug: book.slug,
        price: Number(book.price),
        pictures: paths,
        promotions: book.promotions?.map((x) => x.id) ?? [],
        ...bookExtraPayload(book),
      })
      .then((res) => {
        toast.success(res.data.msg, { id, duration: 3000 });
        return res;
      })
      .catch((err) => {
        // Chỉ xoá ảnh vừa upload; không xoá cả thư mục (có thể là của sách khác trùng slug)
        if (paths?.length) axios.delete('/file', { params: { path: paths } });
        throw err;
      });
  } catch (err: any) {
    if (err.response?.status === 422 && err.response.data?.fields) {
      for (const [key, value] of Object.entries(err.response.data.fields)) {
        setError(key as keyof BookForm, {
          type: 'manual',
          message: (value as string[])[0],
        });
      }
    }
    toast.error(err.response?.data?.msg ?? translate('components.toast.errorDefault'), {
      id,
      duration: 3000,
    });
    throw err;
  }
};
