import type { Dayjs } from "dayjs";

import { createFormControl } from "react-hook-form";

export const formControl = createFormControl<PromotionForm>();
export const {
    control,
    getValues,
    reset,
    setValue,
    handleSubmit,
    setFocus,
    setError
} = formControl

export type PromotionForm = {
    name: string;
    code: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    startDate: Dayjs;
    endDate: Dayjs;
    isActive: boolean;
    books: BookView[]
}

export const TypePromotion = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']