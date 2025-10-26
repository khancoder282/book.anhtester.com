

import { AxiosError } from "axios";

import { axios } from "src/api/axios";

import { toast } from "src/components/toast";

import { setError, type PromotionForm } from "../hooks/form-control";

export const createPromotion = (promotion: PromotionForm) =>
    axios.post("/promotion-book", {
        name: promotion.name,
        code: promotion.code,
        description: promotion.description,
        type: promotion.type,
        value: Number(promotion.value ?? "0"),
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        isActive: Boolean(promotion.isActive),
        books: promotion.books.map(x => x.id)
    }).then((t) => {
        toast.success(t.data.msg)
        console.log(t);

        return t
    }).catch((err) => {
        if (err instanceof AxiosError) {
            toast.error(err.response?.data.msg)
            if (err.response?.status === 422) {
                for (const [key, value] of Object.entries(err.response.data.fields)) {
                    setError(key as keyof PromotionForm, {
                        type: 'manual',
                        message: (value as string[])[0],
                    });
                }
            }
        }
        throw err
    })