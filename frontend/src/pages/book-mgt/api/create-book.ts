import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

import { setError } from '../stores/form-add';

export const slugify = (s: string) =>
  s
    .replace(/[Đđ]/g, 'd')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const handleCreateBook = async (book: BookForm) => {
  const id = 'create-book';
  try {
    toast.custom('Uploading image...', 'loading', { hiddenCloseButton: true, id });
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
        promotions: book.promotions.map(x => x.id),
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
