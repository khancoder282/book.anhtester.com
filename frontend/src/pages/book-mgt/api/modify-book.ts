

import { AxiosError } from "axios";

import { axios } from "src/api/axios";

import { toast } from "src/components/toast";


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
            promotions: book.promotions.map(x => x.id),
        })
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

    const id = "update-book"
    toast.custom("Delete old image...", "loading", { hiddenCloseButton: true, id, duration: Infinity });

    let paths: string[] = []
    try {
        // upload new image
        const files = book.picture.filter(f => (f instanceof File))
        if (files.length > 0) {
            toast.custom("Update new image...", "loading", { hiddenCloseButton: true, id, duration: Infinity });
            paths = await UpdateNewImage(files);
        }
        // update book
        toast.custom("Update book...", "loading", { hiddenCloseButton: true, id, duration: Infinity });
        let count = 0;
        const pathImgs = book.picture.map(x => x instanceof File ? paths[count++] : x.path);
        return await UpdateBook(pathImgs).then(async res => {
            toast.success(res.data.msg ?? "", { id, duration: 3000 })
            // delete old image
            const pictureDel = book.pictureDel?.map(x => x.path).filter(x => x)
            if (pictureDel && pictureDel.length > 0) {
                toast.custom("Delete old image...", "loading", { hiddenCloseButton: true, id, duration: Infinity });
                await DelOldImage(pictureDel);
            }
            return res;
        }).catch(err => {
            toast.error(err.response?.data.msg ?? "", { id, duration: 3000 })
            throw err
        });
    } catch (err) {
        if (err instanceof AxiosError) {
            toast.error(err.response?.data.msg || "", { id, duration: 3000 });
        } else {
            toast.error("Error in update book", { id, duration: 3000 });
        }
        // delete if error
        if (paths.length > 0) {
            await DelOldImage(paths)
        }
        throw err
    }

};