import { Elysia, t } from 'elysia';
import { AppMain } from '../regis';

export const addressController = (new Elysia({
    prefix: '/address',
    tags: ['Address management'],
}) as unknown as AppMain).get('', async ({ prisma }) => {
    try {
        const addresses = await prisma.address.groupBy({
            by: ['div']
        });

        return addresses.map((group) => group.div)
    } catch (error) {
        // Xử lý lỗi
        console.error('Error fetching addresses:', error);
        throw new Error('Failed to fetch address divisions');
    }
}, {
    detail: {
        security: []
    }
}).get('/:divname', async ({ prisma, params }) => {
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
        // Xử lý lỗi
        console.error('Error fetching addresses:', error);
        throw new Error('Failed to fetch address divisions');
    }
}, {
    params: t.Object({
        divname: t.String(),
    }),
    detail: {
        security: []
    }
})