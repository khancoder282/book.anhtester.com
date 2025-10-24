

import { axios } from "src/api/axios";

import { toast } from "src/components/toast";

export const deleteBook = (id: string) =>
    axios.delete(`/book/${id}`).then((res) => toast.error(res.data.msg)).catch((err) => toast.error(err.response.data.msg));
