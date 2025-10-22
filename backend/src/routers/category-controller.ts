import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";

const categoryController = new Elysia({
  prefix: "category-book",
  tags: ["Category management"],
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
    };
  })
  .use(auth)
  .post(
    "",
    async ({ prisma, body: { name }, set }) => {
      try {
        return await prisma.category.create({
          data: {
            name,
          },
        });
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
    }
  )
  .put(
    ":name",
    async ({ prisma, body, params: { name: id } }) => {
      try {
        return await prisma.category.update({
          where: {
            name: id,
          },
          data: body,
        });
      } catch (e) {
        const err = e as PrismaClientKnownRequestError;
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
      params: t.Object({
        name: t.String(),
      }),
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .delete(
    ":name",
    async ({ prisma, set, params }) => {
      try {
        return await prisma.category.delete({
          where: {
            name: params.name,
          },
        });
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
    }
  );
