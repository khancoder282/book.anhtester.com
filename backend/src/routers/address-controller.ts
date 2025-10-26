import { Elysia, t } from 'elysia';
import { AppMain } from '../regis';

export const addressController = (new Elysia({
    prefix: '/address',
    tags: ['Quản lý Địa chỉ'],
}) as unknown as AppMain).get('', async ({ prisma, set }) => {
    try {
        const addresses = await prisma.address.groupBy({
            by: ['div']
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
            msg: 'Failed to fetch address divisions'
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
        security: []
    }
}).get('/:divname', async ({ prisma, params, set }) => {
    try {
        const addresses = await prisma.address.findMany({
            where: {
                div: params.divname
            },
            select: {
                wards: true
            }
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
            msg: 'Failed to fetch address divisions'
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
        security: []
    }
})