import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable } from "../plugins/filterTable";
import { auth } from "../plugins/auth";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { $Enums, Promotion } from "../prisma";
import path from "path";
import fs from "fs";
import { file_path } from "./file-controller";


function slugify(str: string) {
  return str
    .toString()
    .normalize('NFKD')              // normalize Unicode accents
    .replace(/[\u0300-\u036f]/g, '')// remove separated diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // keep a-z, 0-9, spaces, and hyphens
    .replace(/\s+/g, '-')           // replace spaces with hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens into one
}

const bookController = new Elysia({
  tags: ["Book Management"],
  prefix: "book",
}) as unknown as AppMain;

export default bookController;

// **************************************************************************

const bodyBook = t.Object({
  name: t.String(),
  slug: t.Optional(t.String()),
  description: t.Optional(t.String()),
  status: t.UnionEnum(["AVAILABLE", "UNAVAILABLE"], {
    default: "AVAILABLE",
  }),
  pictures: t.Optional(t.Array(t.String())),
  categories: t.Array(t.String(), {
    minItems: 1,
  }),
  price: t.Number({
    default: 50_000,
    maximum: 9_000_000_000_000,
  }),
  promotions: t.Optional(t.Array(t.String()))
});

export function handlePrice(price: number, promotions: Promotion[]) {
  let pricePromotion = 0;
  promotions.forEach((p) => {
    if (p.type === $Enums.PromotionType.PERCENTAGE) {
      pricePromotion += (price * p.value) / 100;
    }
    if (p.type === $Enums.PromotionType.FIXED_AMOUNT) {
      pricePromotion += p.value;
    }
  });
  return price - pricePromotion;
}

bookController
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
        const where = filterTable(search, ["name", "description", "slug"]);

        const [list, total] = await prisma.$transaction([
          prisma.book.findMany({
            orderBy: [
              { [sort]: sortBy },
              { createdAt: "desc" }
            ],
            skip: (page - 1) * limit,
            take: limit,
            where,
            select: {
              id: true,
              name: true,
              description: true,
              slug: true,
              categories: { select: { name: true } },
              auth: {
                select: {
                  name: true,
                  avatarUrl: true,
                  email: true,
                },
              },
              price: true,
              currentPrice: true,
              status: true,
              picture: true,
              viewCount: true,
              createdAt: true,
              updatedAt: true,
              promotions: {
                orderBy: { startDate: "desc" },
                where: {
                  isActive: true,
                  endDate: { gte: new Date() },
                },
                select: {
                  type: true,
                  value: true,
                  startDate: true,
                  endDate: true,
                  name: true,
                  description: true,
                  code: true,
                },
              },
            },
          }),
          prisma.book.count({ where }),
        ]);

        const mappedList = list.map((item) => {
          const pictures = (item.picture || "")
            .split(",")
            .map((x) => x.trim())
            .filter((x) => {
              try {
                const pathname = path.join(file_path, x);
                return fs.existsSync(pathname) && fs.statSync(pathname).isFile();
              } catch {
                return false;
              }
            });

          return {
            ...item,
            categories: item.categories.map((c) => c.name),
            picture: pictures,
          };
        });

        return {
          list: mappedList,
          pagination: {
            total,
            totalPage: Math.ceil(total / limit),
            currentPage: page,
            lengthData: mappedList.length,
          },
        };
      } catch (error) {
        console.error("Error fetching books:", error);
        set.status = 400;
        return {
          msg: "Invalid filter or query syntax",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      query: t.Partial(
        t.Object({
          limit: t.Number({ default: 10, minimum: 1, maximum: 10_000 }),
          page: t.Number({ default: 1, minimum: 1 }),
          search: t.String({ default: "" }),
          sort: t.UnionEnum(
            [
              "name",
              "description",
              "status",
              "createdAt",
              "updatedAt",
              "slug",
              "price",
              "currentPrice",
              "viewCount",
            ],
            { default: "updatedAt" }
          ),
          sortBy: t.UnionEnum(["asc", "desc"], { default: "desc" }),
        })
      ),
      response: {
        200: t.Object({
          list: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              description: t.String(),
              slug: t.String(),
              categories: t.Array(t.String()),
              picture: t.Array(t.String()),
              auth: t.Nullable(
                t.Object({
                  name: t.String(),
                  email: t.String(),
                  avatarUrl: t.String(),
                })
              ),

              status: t.UnionEnum(["AVAILABLE", "UNAVAILABLE"]),
              createdAt: t.Date({ format: "date-time" }),
              updatedAt: t.Date({ format: "date-time" }),
              price: t.Number(),
              currentPrice: t.Number(),
              viewCount: t.Number(),
              promotions: t.Array(
                t.Object({
                  name: t.String(),
                  description: t.String(),
                  type: t.UnionEnum([
                    "PERCENTAGE",
                    "FIXED_AMOUNT",
                    "FREE_SHIPPING",
                  ]),
                  startDate: t.Date({ format: "date-time" }),
                  endDate: t.Date({ format: "date-time" }),
                  code: t.String(),
                  value: t.Number(),
                })
              ),
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
          error: t.Optional(t.String()),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        description: "Query list of books (pagination, filtering, sorting)",
        tags: ["Book Management"],
        security: [],
      },
    }
  )

  .get(
    ":id",
    async ({ params, prisma, set, query: { view } }) => {
      const book = await prisma.book.findFirst({
        where: {
          OR: [{ id: params.id }, { slug: params.id }],
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          picture: true,
          price: true,
          currentPrice: true,
          createdAt: true,
          updatedAt: true,
          viewCount: true,
          auth: {
            select: {
              name: true,
              avatarUrl: true,
              email: true,
            },
          },
          categories: {
            select: {
              name: true
            },
          },
          promotions: {
            orderBy: {
              startDate: "desc",
            },
            where: {
              isActive: true,
              endDate: {
                gte: new Date(),
              },
            },
            select: {
              id: true,
              type: true,
              value: true,
              startDate: true,
              endDate: true,
              name: true,
              description: true,
              code: true,
            }
          }
        },
      });

      if (!book) {
        set.status = 404;
        return {
          msg: "Book not found.",
        };
      }

      if (view === true) {
        await prisma.book.update({
          where: {
            id: book.id
          },
          data: {
            viewCount: {
              increment: 1
            }
          }
        })
      }

      const picture = book.picture.split(",").filter(x => {
        if (fs.existsSync(path.join(file_path, x))) return true
        return false
      }).map((item) => {
        let fullPath = path.join(file_path, item);
        const stat = fs.statSync(fullPath);
        return {
          name: path.basename(item),
          path: item,
          isFile: true,
          size: stat.size,
          type: Bun.file(fullPath).type,
          modified: stat.mtime,
          created: stat.birthtime,
        }
      })

      return {
        ...book,
        viewCount: view === true ? book.viewCount + 1 : book.viewCount,
        categories: book.categories.map((item) => item.name),
        picture
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
          description: t.String(),
          price: t.Number(),
          currentPrice: t.Number(),
          viewCount: t.Number(),
          status: t.Union([
            t.Literal('AVAILABLE'),
            t.Literal('UNAVAILABLE'),
          ]), // tương ứng $Enums.BookStatus
          createdAt: t.Date({ format: 'date-time' }), // Date → string ISO
          updatedAt: t.Date({ format: 'date-time' }),
          picture: t.Array(
            t.Object({
              name: t.String(),
              path: t.String(),
              isFile: t.Boolean(),
              size: t.Number(),
              type: t.String(),
              modified: t.Date({ format: 'date-time' }), // Date → string ISO
              created: t.Date({ format: 'date-time' }),  // Date → string ISO
            })
          ),
          auth: t.Union([
            t.Object({
              name: t.String(),
              email: t.String(),
              avatarUrl: t.String(),
            }),
            t.Null(),
          ]),

          categories: t.Array(t.String()),

          promotions: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              description: t.String(),
              type: t.Union([
                t.Literal('PERCENTAGE'),
                t.Literal('FIXED_AMOUNT'),
                t.Literal('FREE_SHIPPING'),
              ]), // tương ứng $Enums.PromotionType
              startDate: t.Date({ format: 'date-time' }),
              endDate: t.Date({ format: 'date-time' }),
              code: t.String(),
              value: t.Number(),
            })
          ),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        })
      },
      query: t.Object({
        view: t.Optional(t.BooleanString({ examples: ["true", "false"] }))
      }),
      detail: {
        security: [],
      },
    }
  )
  .use(auth)
  .post(
    "",
    async ({ prisma, body: { pictures, ...body }, set, auth }) => {
      try {
        await prisma.book.create({
          data: {
            name: body.name,
            description: body.description || "",
            status: body.status,
            price: body.price,
            slug: body.slug || slugify(body.name),
            picture: (pictures ?? []).join(","),
            currentPrice: handlePrice(body.price, await prisma.promotion.findMany({
              where: {
                isActive: true,
                id: { in: body.promotions },
                endDate: {
                  gte: new Date()
                },
                startDate: {
                  lte: new Date()
                }
              }
            })),
            promotions: {
              connect: body.promotions?.map((p) => ({
                id: p,
              }))
            },
            categories: {
              connectOrCreate: body.categories.map((c) => ({
                where: {
                  name: c,
                },
                create: {
                  name: c,
                },
              })),
            },
            auth:
              (auth && {
                connect: {
                  id: auth.id,
                },
              }) ||
              undefined,
          },
        });

        return {
          msg: "Book created successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          return {
            msg: "Book name already exists.",
          };
        }
        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "Promotion not found." };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyBook,
      response: {
        201: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        401: t.Object({
          msg: t.String(),
        }),
        403: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        description: "Create a new book"
      }
    }
  )
  .patch(
    "/:id",
    async ({ body, prisma, set, params }) => {
      try {
        const BookOld = await prisma.book.findFirst({
          where: {
            id: params.id,
          },
          select: {
            price: true
          }
        })
        if (!BookOld) {
          set.status = 404;
          return { msg: "Book not found." };
        }
        const price = body.price ?? BookOld.price
        const book = await prisma.book.update({
          where: {
            id: params.id,
          },
          data: {
            name: body.name,
            description: body.description || "",
            status: body.status,
            price: price,
            slug: body.slug,
            promotions: {
              connect: body.promotions?.map((p) => ({
                id: p,
              }))
            },
            currentPrice: (body.promotions) ? handlePrice(price, await prisma.promotion.findMany({
              where: {
                isActive: true,
                id: { in: body.promotions },
                endDate: {
                  gte: new Date()
                },
                startDate: {
                  lte: new Date()
                }
              }
            })) : undefined,
            picture: (body.pictures ?? []).join(","),
            categories: body?.categories
              ? {
                connectOrCreate: body.categories.map((c) => ({
                  where: {
                    name: c,
                  },
                  create: {
                    name: c,
                  },
                })),
              }
              : undefined,
          },
        });

        if (!book) {
          set.status = 404;
          return {
            msg: "Book not found.",
          };
        }

        return {
          msg: "Book updated successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          return {
            msg: "Book name already exists.",
          };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        201: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        401: t.Object({
          msg: t.String(),
        }),
        403: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      body: t.Partial(bodyBook),
      detail: {
        description: "Update a book"
      }
    }
  )
  .delete(
    "/:id",
    async ({ params, prisma, set }) => {
      try {
        await prisma.$transaction(async (ctx) => {
          const book = await ctx.book.delete({
            where: {
              id: params.id,
            },
            select: {
              picture: true
            }
          });
          book.picture.split(",").forEach((p) => {
            p && p.length > 5 && fs.rmSync(path.join(file_path, p), { recursive: true, force: true });
          })
        });

        return {
          msg: "Deleted successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2025") {
          set.status = 404;
          return {
            msg: "Book not found.",
          };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
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
        400: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        })
      },
    }
  );
