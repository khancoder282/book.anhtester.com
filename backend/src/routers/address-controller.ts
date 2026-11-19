import { Elysia, t } from 'elysia';
import { AppMain } from '../regis';

export const addressController = (new Elysia({
    prefix: '/address',
    tags: ['Address Management'],
}) as unknown as AppMain).get('', async ({ prisma, set }) => {
    try {
        // distinct + orderBy id: giữ thứ tự theo mã đơn vị hành chính (Hà Nội → Cà Mau)
        const addresses = await prisma.address.findMany({
            distinct: ['div'],
            select: { div: true },
            orderBy: { id: 'asc' }
        });

        return addresses.map((group) => group.div)
    } catch (error) {
        set.status = 400
        if (error instanceof Error) {
            return {
                msg: error.message
            }
        }
        return {
            msg: 'Failed to fetch address divisions data'
        }
    }
}, {
    response: {
        200: t.Array(t.String()),
        400: t.Object({
            msg: t.String()
        })
    },
    detail: {
        security: [],
        summary: 'List provinces / centrally-run cities',
        description: 'Get all provincial-level divisions of Vietnam under the current 2-tier administrative system (effective 2025-07-01): 34 provinces / centrally-run cities, ordered by administrative code (Thành phố Hà Nội → Tỉnh Cà Mau). There is no district level any more.'
    }
}).get('/:divname', async ({ prisma, params, set }) => {
    try {
        const addresses = await prisma.address.findMany({
            where: {
                div: params.divname
            },
            select: {
                wards: true
            },
            orderBy: { id: 'asc' }
        });

        return addresses.map((group) => group.wards)
    } catch (error) {
        set.status = 400
        if (error instanceof Error) {
            return {
                msg: error.message
            }
        }
        return {
            msg: 'Failed to fetch wards for the selected division'
        }
    }
}, {
    params: t.Object({
        divname: t.String(),
    }),
    response: {
        200: t.Array(t.String()),
        422: t.Object({
            msg: t.String(),
            fields: t.Record(t.String(), t.Array(t.String()))
        }),
        400: t.Object({
            msg: t.String()
        })
    },
    detail: {
        security: [],
        summary: 'List wards / communes of a province',
        description: 'Get all commune-level divisions (phường, xã, đặc khu) of the given province, ordered by administrative code. `divname` must be the full name returned by `GET /api/address`, e.g. `Thành phố Hồ Chí Minh` (URL-encoded). Unknown name returns `[]`.'
    }
})