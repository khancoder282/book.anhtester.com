import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable } from "../plugins/filterTable";
import { auth } from "../plugins/auth";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import dayjs from "dayjs";

const promotionController = new Elysia({
  prefix: "promotion-book",
  tags: ["Promotion management"],
}) as unknown as AppMain;

export default promotionController;

// ***************************************************************************

const bodyPromotion = t.Object({
  code: t.String(),
  name: t.String(),
  description: t.String(),
  type: t.UnionEnum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"], {
    default: "PERCENTAGE",
  }),
  value: t.Number(),
  startDate: t.Date({
    default: new Date(),
  }),
  endDate: t.Date({
    default: dayjs().add(1, "week").toDate(),
  }),
  isActive: t.Boolean(),
  books: t.Array(t.String(), {
    default: [],
  }),
  configFe: t.Optional(t.Object({})),
});

promotionController
  .get(
    "",
    async ({ query, prisma, set }) => {
      const {
        limit = 10,
        page = 1,
        search,
        sort = "updatedAt",
        sortBy = "desc",
      } = query;
      try {
        return await prisma.$transaction(async () => {
          const where = filterTable(search, [
            "code",
            "name",
            "description",
            "type",
          ]);
          const list = await prisma.promotion.findMany({
            orderBy: {
              [sort]: sortBy,
            },
            skip: (page - 1) * limit,
            take: limit,
            where,
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              type: true,
              value: true,
              startDate: true,
              endDate: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              configFe: true,
              _count: {
                select: {
                  books: true,
                },
              },
            },
          });

          const total = await prisma.promotion.count({
            where,
          });

          return {
            list: list.map((item) => ({
              id: item.id,
              code: item.code,
              name: item.name,
              description: item.description,
              type: item.type,
              value: item.value,
              startDate: item.startDate,
              endDate: item.endDate,
              isActive: item.isActive,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              countBooks: item._count.books,
            })),
            pagination: {
              total,
              totalPage: Math.ceil(total / limit),
              currentPage: page,
              lengthData: limit,
            },
          };
        });
      } catch (error) {
        set.status = 400;
        return {
          msg: "Invalid filter or query syntax",
          error: error instanceof Error ? error.message : error,
        };
      }
    },
    {
      query: t.Partial(
        t.Object({
          limit: t.Number({
            default: 10,
            minimum: 1,
            maximum: 10_000,
          }),
          page: t.Number({
            default: 1,
            minimum: 1,
          }),
          search: t.String(),
          sort: t.UnionEnum(
            [
              "code",
              "name",
              "description",
              "type",
              "value",
              "startDate",
              "endDate",
              "isActive",
              "createdAt",
              "updatedAt",
            ],
            {
              default: "updatedAt",
            }
          ),
          sortBy: t.UnionEnum(["asc", "desc"], {
            default: "desc",
          }),
        })
      ),
      detail: {
        security: [],
      },
    }
  )
  .get("/:id", async ({ params, prisma, set }) => {
    try {
      const promotion = await prisma.promotion.findUnique({
        where: {
          id: params.id,
        },
        include: {
          books: true,
        }
      });
      if (!promotion) {
        set.status = 404;
        return { msg: "Promotion not found." };
      }
      return promotion;
    } catch {
      set.status = 400;
      return { msg: "Invalid data." };
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      security: [],
    },
  })
  .use(auth)
  .post(
    "",
    async ({ body, prisma, set }) => {
      try {
        await prisma.promotion.create({
          data: {
            ...body,
            configFe: JSON.stringify(body.configFe ?? {}),
            books: {
              connect: body.books.map((id) => ({ id })),
            },
          },
        });
        return {
          msg: "Created promotion successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          return {
            msg: "Promotion code already exists.",
          };
        }

        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "One or more books not found." };
        }

        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyPromotion,
    }
  )
  .patch(
    "/:id",
    async ({ params, body, prisma, set }) => {
      try {
        await prisma.promotion.update({
          where: {
            id: params.id,
          },
          data: {
            ...body,
            configFe: JSON.stringify(body.configFe ?? {}),
            books: body.books
              ? {
                connect: body.books.map((id) => ({ id })),
              }
              : undefined,
          },
        });
        return {
          msg: "Updated promotion successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "One or more books not found." };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: t.Partial(bodyPromotion),
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    ":id",
    async ({ params, prisma, set }) => {
      try {
        await prisma.promotion.delete({
          where: {
            id: params.id,
          },
        });
        return { msg: "Deleted promotion successfully." };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2025") {
          set.status = 404;
          return { msg: "Promotion not found." };
        }
        set.status = 400;
        return { msg: "Invalid data." };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
