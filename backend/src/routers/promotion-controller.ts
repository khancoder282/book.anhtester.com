import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable } from "../plugins/filterTable";
import { auth } from "../plugins/auth";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import dayjs from "dayjs";
import { $Enums } from "../prisma";
import { handlePrice } from "./book-controller";

const promotionController = new Elysia({
  prefix: "promotion-book",
  tags: ["Quản lý giảm giá sản"],
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
        search = "",
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
      query: (
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
          search: t.Optional(t.String()),
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
      response: {
        200: t.Object({
          list: t.Array(
            t.Object({
              id: t.String(),
              code: t.String(),
              name: t.String(),
              description: t.String(),
              type: t.Enum($Enums.PromotionType), // hoặc t.Enum($Enums.PromotionType) nếu có import enum
              value: t.Number(),
              startDate: t.Date(),
              endDate: t.Date(),
              isActive: t.Boolean(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              countBooks: t.Number(),
            })
          ),
          pagination: t.Object({
            total: t.Number(),
            totalPage: t.Number(),
            currentPage: t.Number(),
            lengthData: t.Number(),
          }),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        500: t.Object({
          msg: t.String(),
          error: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()))
        })
      },

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
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          type: true,
          value: true,
          isActive: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          configFe: true,
          books: {
            select: {
              id: true,
              name: true,
              slug: true,
              picture: true,
              viewCount: true,
              description: true,
              auth: {
                select: {
                  email: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
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
    response: {
      200: t.Object({
        id: t.String(),
        code: t.String(),
        name: t.String(),
        description: t.String(),
        type: t.Enum($Enums.PromotionType),
        value: t.Number(),
        startDate: t.Date(),
        endDate: t.Date(),
        isActive: t.Boolean(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        books: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            slug: t.String(),
            description: t.String(),
            viewCount: t.Number(),
            picture: t.String(),
            auth: t.Nullable(
              t.Object({
                email: t.String(),
                name: t.String(),
                avatarUrl: t.String(),
              })
            ),
          })
        ),
      }),
      404: t.Object({
        msg: t.String(),
      }),
      400: t.Object({
        msg: t.String(),
      }),
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
        // update book 
        await prisma.$transaction(async (ctx) => {
          for (const bookId of body.books) {
            const book = await ctx.book.findUnique({
              where: {
                id: bookId,
              },
              select: {
                price: true,
                promotions: {
                  where: {
                    isActive: true,
                    endDate: {
                      gte: new Date()
                    },
                    startDate: {
                      lte: new Date()
                    }
                  }
                }
              }
            })
            await ctx.book.update({
              where: {
                id: bookId,
              },
              data: {
                currentPrice: handlePrice(book?.price ?? 0, book?.promotions ?? [])
              },
            });
          }
        })

        set.status = 201;
        return {
          msg: "Created promotion successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          set.status = 422;
          return {
            msg: "Promotion code already exists.",
            fields: {
              code: ["Promotion code already exists."],
            }
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
      response: {
        201: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        500: t.Object({
          msg: t.String(),
          error: t.String(),
        }),
      }
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
        if (body.books !== undefined && body.books.length > 0) {
          await prisma.$transaction(async (ctx) => {
            for (const bookId of body.books ?? []) {
              const book = await ctx.book.findUnique({
                where: {
                  id: bookId,
                },
                select: {
                  price: true,
                  promotions: true
                }
              })
              await ctx.book.update({
                where: {
                  id: bookId,
                },
                data: {
                  currentPrice: handlePrice(book?.price ?? 0, await ctx.promotion.findMany({
                    where: {
                      isActive: true,
                      books: {
                        some: {
                          id: bookId
                        }
                      },
                      endDate: {
                        gte: new Date()
                      },
                      startDate: {
                        lte: new Date()
                      }
                    }
                  }))
                },
              });
            }
          })
        }
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
      response: {
        200: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        500: t.Object({
          msg: t.String(),
          error: t.String(),
        }),
      },
    }
  )
  .delete(
    ":id",
    async ({ params, prisma, set }) => {
      try {
        const book = await prisma.promotion.delete({
          where: {
            id: params.id,
          },
          select: {
            books: {
              select: {
                id: true,
                price: true
              }
            }
          }
        });

        await prisma.$transaction(async (ctx) => {
          for (let i = 0; i < book.books.length; i++) {
            const { id: bookId, price } = book.books[i];


            await ctx.book.update({
              where: {
                id: bookId,
              },
              data: {
                currentPrice: handlePrice(price, await ctx.promotion.findMany({
                  where: {
                    isActive: true,
                    books: {
                      some: {
                        id: bookId
                      }
                    },
                    endDate: {
                      gte: new Date()
                    },
                    startDate: {
                      lte: new Date()
                    }
                  }
                }))
              },
            });

          }
        })

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
      response: {
        200: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        500: t.Object({
          msg: t.String(),
          error: t.String(),
        }),
      },
    }
  );
