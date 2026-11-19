import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable, filterErrorMessage } from "../plugins/filterTable";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import {
  auth,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateUserInput,
} from "../plugins/auth";
import { Prisma } from "../prisma";

const userController = new Elysia({
  tags: ["User Management"],
  prefix: "user",
}) as unknown as AppMain;

export default userController;

// ***************************************************************************

/** Lỗi chung: `fields` chỉ có ở lỗi gắn với từng trường. */
const errorSchema = t.Object({
  msg: t.String(),
  fields: t.Optional(t.Record(t.String(), t.Array(t.String()))),
});
const msgSchema = t.Object({ msg: t.String() });

const nameSchema = t.String({
  minLength: 1,
  maxLength: NAME_MAX_LENGTH,
  description: "Must not be empty or whitespace only (trimmed before saving).",
});
const emailSchema = t.String({
  format: "email",
  maxLength: 191,
  examples: ["user@example.com"],
});

userController
  // ==========================================
  // GET /user
  // ==========================================
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
                updatedAt: "desc",
              },
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
          error: filterErrorMessage(error),
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
        description:
          "Get a paginated list of users with optional filters and sorting. `search` is either plain text " +
          "(contains on name, email, phone, address) or a JSON Prisma `where` object; filtering by sensitive " +
          "fields or relations (`password`, `refreshTokens`, `tokenHash`, ...) returns 400.",
        security: [],
      },
    }
  )

  // ==========================================
  // GET /user/:id
  // ==========================================
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
        description: "Get detailed information of a specific user by ID",
        security: [],
      },
    }
  )


  // ==========================================
  // POST /user
  // ==========================================
  .use(auth)
  .post(
    "",
    async ({ body, prisma, set }) => {
      const fields = validateUserInput(body);
      if (fields) {
        set.status = 422;
        return { msg: "Invalid data.", fields };
      }
      try {
        await prisma.user.create({
          data: {
            ...body,
            name: body.name.trim(),
            avatarUrl: body.avatarUrl ?? "",
            address: body.address ?? "",
            password: await Bun.password.hash(body.password || "anhtester.com"),
          },
        });
        set.status = 201;
        return {
          msg: "Created successfully.",
        };
      } catch (e) {
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          set.status = 422;
          return {
            msg: "Email already exists.",
            fields: {
              email: ["Email already exists."],
            },
          };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      response: {
        201: msgSchema,
        400: errorSchema,
        401: msgSchema,
        403: msgSchema,
        422: errorSchema,
      },
      body: t.Object({
        name: nameSchema,
        email: emailSchema,
        password: t.Optional(
          t.String({
            description: `At least ${PASSWORD_MIN_LENGTH} characters. Missing or empty = "anhtester.com".`,
          })
        ),
        avatarUrl: t.Optional(t.String()),
        address: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        description:
          "Create a new user. Blank name, password shorter than 6 characters or duplicated email return 422 with `fields`.",
      },
    }
  )

  // ==========================================
  // PATCH /user/:id
  // ==========================================
  .patch(
    "/:id",
    async ({ params, body, prisma, set, auth: user }) => {
      // Không có role: mỗi user chỉ được sửa chính mình
      if (params.id !== user!.id) {
        const exists = await prisma.user.findUnique({
          where: { id: params.id },
          select: { id: true },
        });
        if (!exists) {
          set.status = 404;
          return { msg: "User not found." };
        }
        set.status = 403;
        return { msg: "You can only update your own account." };
      }

      if (body.isActive === false) {
        set.status = 400;
        return { msg: "You cannot disable your own account." };
      }

      const fields = validateUserInput(body);
      if (fields) {
        set.status = 422;
        return { msg: "Invalid data.", fields };
      }

      // Chỉ cập nhật trường client thật sự gửi
      const data: Prisma.UserUpdateInput = {};
      if (body.name !== undefined) data.name = body.name.trim();
      if (body.email !== undefined) data.email = body.email;
      if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
      if (body.address !== undefined) data.address = body.address;
      if (body.phone !== undefined) data.phone = body.phone;
      if (body.password) data.password = await Bun.password.hash(body.password);

      // Đổi email hoặc mật khẩu thì thu hồi mọi phiên (refresh token + access token)
      const shouldRevokeTokens =
        (body.email !== undefined && body.email !== user!.email) ||
        !!body.password;

      try {
        await prisma.$transaction(async (ctx) => {
          await ctx.user.update({
            where: {
              id: params.id,
            },
            data,
          });
          if (shouldRevokeTokens) {
            await ctx.userRefreshToken.updateMany({
              where: {
                userId: params.id,
                revoked: false,
              },
              data: {
                revoked: true,
              },
            });
          }
        });
        set.status = 200;
        return {
          msg: `Updated successfully.`,
          requireLogin: shouldRevokeTokens,
        };
      } catch (err) {
        const e = err as PrismaClientKnownRequestError;

        if (e.code === "P2002") {
          set.status = 422;
          return {
            msg: "Email already exists.",
            fields: {
              email: ["Email already exists."],
            },
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
          requireLogin: t.Boolean({
            description:
              "true when email or password changed: every session of the user was revoked and the user must login again.",
          }),
        }),
        400: errorSchema,
        401: msgSchema,
        403: msgSchema,
        404: msgSchema,
        422: errorSchema,
      },
      body: t.Partial(
        t.Object({
          name: nameSchema,
          email: emailSchema,
          password: t.String({
            description: `At least ${PASSWORD_MIN_LENGTH} characters. Empty string = keep current password.`,
          }),
          avatarUrl: t.String(),
          address: t.String(),
          phone: t.String(),
          isActive: t.Boolean({
            description: "Cannot be set to false on your own account (400).",
          }),
        })
      ),
      detail: {
        description:
          "Update a user by ID. A user can only update their own account (403 for another user, 404 if the ID does not exist) " +
          "and cannot disable it (`isActive: false` returns 400). Only fields sent in the body are updated. " +
          "Changing email or password revokes every session of the user and returns `requireLogin: true`.",
      },
    }
  )

  // ==========================================
  // DELETE /user/:id
  // ==========================================
  .delete(
    "/:id",
    async ({ params, prisma, set, auth: user }) => {
      // Không có role: mỗi user chỉ được xoá chính mình
      if (params.id !== user!.id) {
        const exists = await prisma.user.findUnique({
          where: { id: params.id },
          select: { id: true },
        });
        if (!exists) {
          set.status = 404;
          return { msg: "User not found." };
        }
        set.status = 403;
        return { msg: "You can only delete your own account." };
      }
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
        200: msgSchema,
        400: msgSchema,
        401: msgSchema,
        403: msgSchema,
        404: msgSchema,
      },
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        description:
          "Delete a user by ID and remove all related refresh tokens. A user can only delete their own account " +
          "(403 for another user, 404 if the ID does not exist). After deleting yourself every session is gone, " +
          "so the current access token returns 401.",
      },
    }
  );
