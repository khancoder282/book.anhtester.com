import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";

const categoryController = new Elysia({
  prefix: "category-book",
  tags: ["Quản lý Danh mục"],
}) as unknown as AppMain;

export default categoryController;

// **************************************************************************

categoryController
  .get("", async ({ prisma }) => {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: {
            books: true,
          },
        },
      },
    });
    return {
      list: categories.map((c) => ({
        name: c.name,
        bookCount: c._count.books,
      })),
      pagination: {
        total: categories.length,
      },
    };
  }, {
    response: {
      200: t.Object({
        list: t.Array(t.Object({
          name: t.String(),
          bookCount: t.Number(),
        })),
        pagination: t.Object({
          total: t.Number(),
        }),
      })
    },
    detail: {
      description: "Lấy danh sách danh mục"
    }
  })
  .use(auth)
  .post(
    "",
    async ({ prisma, body: { name }, set }) => {
      try {
        await prisma.category.create({
          data: {
            name,
          },
        });
        set.status = 201;
        return {
          msg: "Category created successfully.",
        }
      } catch (e) {
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2002") {
          set.status = 400;
          return {
            msg: "Category already exists.",
          };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
      }),
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
      }
    }
  )
  .put("",
    async ({ prisma, body, set }) => {
      try {
        await prisma.category.update({
          where: {
            name: body.name,
          },
          data: {
            name: body.newName,
          },
        });
        return {
          msg: "Category updated successfully.",
        }
      } catch (e) {
        const err = e as PrismaClientKnownRequestError;
        set.status = 400;
        if (err.code === "P2002") {
          return {
            msg: "Category already exists.",
          };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {

      body: t.Object({
        name: t.String(),
        newName: t.String(),
      }),
      response: {
        200: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      }
    }
  )
  .delete(
    ":name",
    async ({ prisma, set, params }) => {
      try {
        await prisma.category.delete({
          where: {
            name: params.name,
          },
        });
        return {
          msg: "Category deleted successfully.",
        }
      } catch (e) {
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2025") {
          set.status = 404;
          return {
            msg: "Category not found.",
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
        name: t.String(),
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
      }
    }
  );
