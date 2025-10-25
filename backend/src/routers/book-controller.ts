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
    .normalize('NFKD')              // tách dấu (đối với Unicode)
    .replace(/[\u0300-\u036f]/g, '')// bỏ các dấu tách ra
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // giữ a-z, 0-9, space, dấu -
    .replace(/\s+/g, '-')           // space -> -
    .replace(/-+/g, '-');           // gộp nhiều dấu - thành 1
}

const bookController = new Elysia({
  tags: ["Book management"],
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

function handlePrice(price: number, promotions: Promotion[]) {
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
        search,
        sort = "updatedAt",
        sortBy = "desc",
      } = query;
      try {
        return await prisma.$transaction(async () => {
          const where = filterTable(search, ["name", "description", "slug"]);

          const list = await prisma.book.findMany({
            orderBy: [
              {
                [sort]: sortBy,
              },
              {
                createdAt: "desc",
              }
            ],
            skip: (page - 1) * limit,
            take: limit,
            where,
            select: {
              id: true,
              name: true,
              description: true,
              slug: true,
              categories: {
                select: {
                  name: true,
                },
              },
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
                  type: true,
                  value: true,
                  startDate: true,
                  endDate: true,
                  name: true,
                  description: true,
                  code: true,
                }
              },
            },
          });

          const total = await prisma.book.count({
            where,
          });

          return {
            list: list.map((item) => ({
              ...item,
              categories: item.categories.map((item) => item.name),
              picture: item.picture.split(",").filter(x => {
                const pathname = path.join(file_path, x)
                if (fs.existsSync(pathname) && fs.statSync(pathname).isFile()) return true
                return false;
              }),
              isFreeShipping: item.promotions.some(
                (x) => x.type === $Enums.PromotionType.FREE_SHIPPING
              ),
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
            ["name", "description", "status", "createdAt", "updatedAt", "slug", "price", "currentPrice", "viewCount"],
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
  .get(
    ":id",
    async ({ params, prisma, set }) => {
      const book = await prisma.book.findUnique({
        where: {
          id: params.id,
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

      if (params.view) {
        await prisma.book.update({
          where: {
            id: book.id,
          },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        })
      }

      return {
        ...book,
        categories: book.categories.map((item) => item.name),
        picture
      }
    },
    {
      params: t.Object({
        id: t.String(),
        view: t.Optional(t.BooleanString()),
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
                id: { in: body.promotions }
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
          msg: "Create book successfully.",
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
          return { msg: "Not found promotion" };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyBook,
    }
  )
  .patch(
    "/:id",
    async ({ body, prisma, set, params }) => {
      try {
        const book = await prisma.book.update({
          where: {
            id: params.id,
          },
          data: {
            name: body.name,
            description: body.description || "",
            status: body.status,
            price: body.price,
            slug: body.slug,
            promotions: {
              connect: body.promotions?.map((p) => ({
                id: p,
              }))
            },
            currentPrice: (body.promotions && body.price) ? handlePrice(body.price, await prisma.promotion.findMany({
              where: {
                isActive: true,
                id: { in: body.promotions }
              }
            })) : body.price,
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
          msg: "Update book successfully.",
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
      body: t.Partial(bodyBook),
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
    }
  );
