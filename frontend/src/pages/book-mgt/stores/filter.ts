import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { useDebounce } from "src/hooks/use-debound";

import { useAuth } from "src/store/auth";

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
    const { auth } = useAuth();
    const [sParams, setSParams] = useSearchParams();
    // const [sort, setSort] = useState<keyof typeof mappingSort>('Feature');
    const sort = (sParams.get('sort') || 'Feature') as keyof typeof mappingSort;
    const setSort = useCallback((v: keyof typeof mappingSort) => {
        if (v === 'Feature') sParams.delete('sort');
        sParams.set('sort', v);
        setSParams(sParams);
    }, [sParams, setSParams]);
    // const [isFilter, setIsFilter] = useState(false);
    const isFilter = sParams.get('isFilter') === 'true';
    const setIsFilter = useCallback((v: boolean) => {
        if (v) sParams.set('isFilter', 'true');
        else sParams.delete('isFilter');
        setSParams(sParams);
    }, [sParams, setSParams])
    // const [searchName, setSearchName] = useState('');
    const searchName = sParams.get('searchName') || '';
    const setSearchName = useCallback((v: string) => {
        if (v) sParams.set('searchName', v);
        else sParams.delete('searchName');
        setSParams(sParams);
    }, [sParams, setSParams]);
    // const [category, setCategory] = useState('');
    const category = sParams.get('category') || '';
    const setCategory = useCallback((v: string) => {
        if (v) sParams.set('category', v);
        else sParams.delete('category');
        setSParams(sParams);
    }, [sParams, setSParams]);
    // const [price, setPrice] = useState<{ from: number | null; to: number | null }>({
    //     from: null,
    //     to: null,
    // });

    const price = useMemo(() => {
        const from = sParams.get('from');
        const to = sParams.get('to');
        return {
            from: from ? Number(from) : null,
            to: to ? Number(to) : null,
        };
    }, [sParams]);

    const setPrice = useCallback((v: { from: number | null; to: number | null }) => {
        if (v.from) sParams.set('from', v.from.toString());
        else sParams.delete('from');
        if (v.to) sParams.set('to', v.to.toString());
        else sParams.delete('to');
        setSParams(sParams);
    }, [sParams, setSParams]);

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
                ...(!auth && {
                    status: 'AVAILABLE',
                })
            }),
        }),
        [category, searchName, _price.from, _price.to, auth]
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
            searchParams: sParams,
            sortObj: mappingSort[sort],
        }),
        [category, filter, isFilter, price, sParams, searchName, setCategory, setIsFilter, setPrice, setSearchName, setSort, sort]
    );
}

export type ReturnUseFileterBook = ReturnType<typeof useFilterBook>;