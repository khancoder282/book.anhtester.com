import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable } from "../plugins/filterTable";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";

const userController = new Elysia({
  tags: ["Quản lý Người dùng"],
  prefix: "user",
}) as unknown as AppMain;

export default userController;

// ***************************************************************************

userController
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
          const where = filterTable(search, ["name", "email", "phone", "address"]);
          const users = await prisma.user.findMany({
            orderBy: [
              {
                [sort]: sortBy,
              },
              {
                updatedAt: 'desc'
              }
            ],
            skip: (page - 1) * limit,
            take: limit,
            where,
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
              address: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          const total = await prisma.user.count({
            where,
          });

          return {
            list: users,
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
      response: {
        200: t.Object({
          list: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              email: t.String(),
              avatarUrl: t.String(),
              phone: t.String(),
              address: t.String(),
              isActive: t.Boolean(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
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
          error: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        500: t.Object({
          msg: t.String(),
        }),

      },
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
            ["name", "email", "isActive", "phone", "address", "createdAt", "updatedAt"],
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
    "/:id",
    async ({ params, prisma, set }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: params.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phone: true,
          address: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        set.status = 404;
        return {
          msg: "User not found.",
        };
      }
      return user;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
          email: t.String(),
          avatarUrl: t.String(),
          phone: t.String(),
          address: t.String(),
          isActive: t.Boolean(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
      },
      detail: {
        security: [],
      },
    }
  )
  .use(auth)
  .post(
    "",
    async ({ body, prisma, set }) => {
      try {
        await prisma.user.create({
          data: {
            ...body,
            avatarUrl: body.avatarUrl ?? "",
            address: body.address ?? "",
            password: await Bun.password.hash(body.password ?? "anhtester.com"),
          },
        });
        set.status = 201;
        return {
          msg: "Created successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          set.status = 422;
          return {
            msg: "Email already exists.",
            fields: {
              email: ["Email already exists."],
            }
          };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      response: {
        201: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        password: t.Optional(
          t.String({
            default: "anhtester.com",
          })
        ),
        avatarUrl: t.Optional(t.String()),
        address: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        description: "Tạo người dùng mới",
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, prisma, set }) => {
      try {
        await prisma.$transaction(async (ctx) => {
          if (body.password) {
            body.password = await Bun.password.hash(body.password);
          }
          await ctx.user.update({
            where: {
              id: params.id,
            },
            data: body,
          });
          await ctx.userRefreshToken.updateMany({
            where: {
              userId: params.id,
              revoked: false,
            },
            data: {
              revoked: true,
            },
          });
        });
        set.status = 200;
        return {
          msg: `Updated successfully.`,
        };
      } catch (err) {
        const e = err as PrismaClientKnownRequestError;

        if (e.code === "P2002") {
          set.status = 422;
          return {
            msg: "Email already exists.",
            fields: {
              email: ["Email already exists."],
            }
          };
        }
        if (e.code === "P2025") {
          set.status = 404;
          return {
            msg: "User not found.",
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
      },
      body: t.Partial(
        t.Object({
          name: t.String(),
          email: t.String({ format: "email" }),
          password: t.String(),
          avatarUrl: t.String(),
          address: t.Optional(t.String()),
          phone: t.Optional(t.String()),
          isActive: t.Optional(t.Boolean()),
        })
      ),
    }
  )
  .delete(
    "/:id",
    async ({ params, prisma, set }) => {
      try {
        await prisma.$transaction(async (ctx) => {
          await ctx.user.delete({
            where: {
              id: params.id,
            },
          });

          await ctx.userRefreshToken.deleteMany({
            where: {
              userId: params.id,
            },
          });
        });
        return {
          msg: "Deleted successfully.",
        };
      } catch (err) {
        const e = err as PrismaClientKnownRequestError;

        if (e.code === "P2025") {
          set.status = 404;
          return {
            msg: "User not found.",
          };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
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
        })
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  );
