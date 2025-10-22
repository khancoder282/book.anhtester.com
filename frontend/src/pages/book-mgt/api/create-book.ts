import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { setError } from '../stores/form-add';

export function slugify(str: string) {
  return str
    .toString()
    .normalize('NFKD') // tách dấu (đối với Unicode)
    .replace(/[\u0300-\u036f]/g, '') // bỏ các dấu tách ra
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // giữ a-z, 0-9, space, dấu -
    .replace(/\s+/g, '-') // space -> -
    .replace(/-+/g, '-'); // gộp nhiều dấu - thành 1
}

export const handleCreateBook = async (book: BookForm) => {
  const id = 'create-book';
  try {
    toast.custom('Uploading image...', 'loading', { hiddenCloseButton: true, id });
    const form = new FormData();
    book.picture?.forEach((f) => form.append('files', f));
    form.append('path', `/$book-image/${book.slug}`);
    const paths = await axios.post('/file', form).then((res) => res.data.paths);
    // upload book
    toast.custom('Uploading book...', 'loading', { hiddenCloseButton: true, id });
    return axios
      .post('/book', {
        name: book.name,
        description: book.description,
        status: book.status,
        categories: book.categories,
        slug: book.slug,
        price: Number(book.price),
        pictures: paths,
      })
      .then((res) => {
        toast.success(res.data.msg, { id, duration: 3000 });
        return res;
      })
      .catch((err) => {
        toast.error(err.response.data.msg, { id, duration: 3000 });
        axios.delete('/file', { params: { path: `/$book-image/${book.slug}` } });
        throw err;
      });
  } catch (err: any) {
    if (err.response.status === 422) {
      for (const [key, value] of Object.entries(err.response.data.fields)) {
        setError(key as keyof BookForm, {
          type: 'manual',
          message: (value as string[])[0],
        });
      }
    }
    toast.error(err.response.data.msg, { id, duration: 3000 });
    throw err;
  }
};
