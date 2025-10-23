import { useMemo, useState } from "react";

import { useDebounce } from "src/hooks/use-debound";

export const mappingSort = {
    Feature: {
        orderBy: 'desc',
        order: 'viewCount',
    },
    Newest: {
        orderBy: 'desc',
        order: 'createdAt',
    },
    'Price: Low to High': {
        orderBy: 'asc',
        order: 'currentPrice',
    },
    'Price: High to Low': {
        orderBy: 'desc',
        order: 'currentPrice',
    },
};





export function useFilterBook() {
    const [sort, setSort] = useState<keyof typeof mappingSort>('Feature');
    const [isFilter, setIsFilter] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState<{ from: number | null; to: number | null }>({
        from: null,
        to: null,
    });
    const _price = useDebounce(price, 500);

    const filter = useMemo(
        () => ({
            search: JSON.stringify({
                ...(category && {
                    categories: {
                        some: {
                            name: {
                                in: [category],
                            },
                        },
                    },
                }),
                ...(searchName && {
                    OR: ['name', 'description', 'slug'].map((field) => ({
                        [field]: {
                            contains: searchName,
                        },
                    })),
                }),
                ...(_price.from && {
                    currentPrice: {
                        gte: _price.from,
                    },
                }),
                ...(_price.to && {
                    currentPrice: {
                        lte: _price.to,
                    },
                }),
            }),
        }),
        [category, _price.from, _price.to, searchName]
    );

    return useMemo(
        () => ({
            sort,
            filter,
            isFilter,
            setSort,
            setIsFilter,
            setSearchName,
            setCategory,
            setPrice,
            searchName,
            price,
            category,
            sortObj: mappingSort[sort],
        }),
        [sort, filter, isFilter, searchName, price, category]
    );
}

export type ReturnUseFileterBook = ReturnType<typeof useFilterBook>;