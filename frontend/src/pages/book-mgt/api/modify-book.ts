import { AxiosError } from 'axios';

import { axios } from 'src/api/axios';
import { translate } from 'src/locales';

import { toast } from 'src/components/toast';

import { bookExtraPayload } from '../utils/book-extra';
import { setError, getFieldState } from '../stores/form-add';

export const handleUpdateBook = async (idBook: string, book: BookForm) => {
  async function UpdateBook(paths: string[]) {
    return await axios.patch(`/book/${idBook}`, {
      name: book.name,
      description: book.description,
      status: book.status,
      categories: book.categories,
      slug: book.slug,
      price: Number(book.price),
      pictures: paths,
      ...bookExtraPayload(book),
      // PATCH thay thế cả danh sách khuyến mãi. Form chỉ nạp khuyến mãi còn hiệu lực, nên chỉ gửi khi
      // người dùng có đổi — tránh gỡ mất khuyến mãi đang tắt / đã hết hạn mà form không hiển thị.
      ...(getFieldState('promotions').isDirty && {
        promotions: book.promotions?.map((x) => x.id) ?? [],
      }),
    });
  }

  async function UpdateNewImage(image: File[]) {
    const form = new FormData();
    image.forEach((f) => {
      if (f instanceof File) {
        const randomId = Math.random().toString(36).substring(2, 6);
        const newFileName = `${f.name.split('.').slice(0, -1).join('.')}_${randomId}.${f.name.split('.').pop()}`;
        const newFile = new File([f], newFileName, { type: f.type });
        form.append('files', newFile);
      }
    });
    form.append('path', `/$book-image/${book.slug}`);
    return await axios.post('/file', form).then((res) => res.data.paths);
  }

  async function DelOldImage(path: string[]) {
    return await axios.delete('/file', { params: { path } });
  }

  const id = 'update-book';
  toast.custom(translate('book.toast.deleteOldImage'), 'loading', {
    hiddenCloseButton: true,
    id,
    duration: Infinity,
  });

  let paths: string[] = [];
  try {
    // upload new image
    const files = book.picture.filter((f) => f instanceof File);
    if (files.length > 0) {
      toast.custom(translate('book.toast.updateNewImage'), 'loading', {
        hiddenCloseButton: true,
        id,
        duration: Infinity,
      });
      paths = await UpdateNewImage(files);
    }
    // update book
    toast.custom(translate('book.toast.updateBook'), 'loading', {
      hiddenCloseButton: true,
      id,
      duration: Infinity,
    });
    let count = 0;
    const pathImgs = book.picture.map((x) => (x instanceof File ? paths[count++] : x.path));
    return await UpdateBook(pathImgs)
      .then(async (res) => {
        toast.success(res.data.msg ?? '', { id, duration: 3000 });
        // delete old image
        const pictureDel = book.pictureDel?.map((x) => x.path).filter((x) => x);
        if (pictureDel && pictureDel.length > 0) {
          toast.custom(translate('book.toast.deleteOldImage'), 'loading', {
            hiddenCloseButton: true,
            id,
            duration: Infinity,
          });
          await DelOldImage(pictureDel);
        }
        return res;
      })
      .catch((err) => {
        toast.error(err.response?.data.msg ?? '', { id, duration: 3000 });
        throw err;
      });
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 422 && err.response.data?.fields) {
        for (const [key, value] of Object.entries(err.response.data.fields)) {
          setError(key as keyof BookForm, { type: 'manual', message: (value as string[])[0] });
        }
      }
      toast.error(err.response?.data?.msg || '', { id, duration: 3000 });
    } else {
      toast.error(translate('book.toast.updateError'), { id, duration: 3000 });
    }
    // delete if error
    if (paths.length > 0) {
      await DelOldImage(paths);
    }
    throw err;
  }
};
