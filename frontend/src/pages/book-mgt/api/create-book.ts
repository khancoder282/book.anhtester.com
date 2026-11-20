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

// Upload ảnh (tối đa 4MB / lần) trên mạng chậm có thể quá timeout 10s mặc định của axios (W23)
export const UPLOAD_TIMEOUT = 60000;

// Tên trường của API → tên ô trong form (API dùng `pictures`, form dùng `picture`)
const FIELD_MAP: Record<string, keyof BookForm> = {
  pictures: 'picture',
};

/** Gán lỗi 422 `{ fields }` của server vào từng ô form; khoá dạng `items/0/x` lấy phần đầu. */
export const setFieldErrors = (fields?: Record<string, string[]>) => {
  if (!fields || typeof fields !== 'object') return;
  for (const [key, value] of Object.entries(fields)) {
    const base = key.split('/')[0];
    const name = FIELD_MAP[base] ?? (base as keyof BookForm);
    const message = Array.isArray(value) ? value[0] : undefined;
    if (message) setError(name, { type: 'manual', message });
  }
};

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
    const paths: string[] = await axios
      .post('/file', form, { timeout: UPLOAD_TIMEOUT })
      .then((res) => res.data.paths ?? []);
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
        if (paths.length) axios.delete('/file', { params: { path: paths } });
        throw err;
      });
  } catch (err: any) {
    if (err?.response?.status === 422) setFieldErrors(err.response.data?.fields);
    toast.error(err?.response?.data?.msg ?? translate('book.toast.createError'), {
      id,
      duration: 3000,
    });
    throw err;
  }
};
