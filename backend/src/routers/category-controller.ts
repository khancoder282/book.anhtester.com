import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";

const categoryController = new Elysia({
  prefix: "category-book",
  tags: ["Category Management"],
}) as unknown as AppMain;

export default categoryController;

// **************************************************************************

/** Cùng giới hạn với frontend (category-mgt/page.tsx, card-property.tsx). */
const MAX_LENGTH = 24;

const msgSchema = t.Object({ msg: t.String() });
const validationSchema = t.Object({
  msg: t.String(),
  fields: t.Record(t.String(), t.Array(t.String())),
});

/**
 * Validate a category name after trimming. Returns the error message, or null when valid.
 * Rules: required (not only spaces), at most 24 characters, no "/" (the name is the
 * primary key and is sent in the URL of DELETE /api/category-book/{name}).
 */
const nameError = (name: string) => {
  if (!name) return "Name is required.";
  if (name.length > MAX_LENGTH) return `Name must be at most ${MAX_LENGTH} characters.`;
  if (name.includes("/")) return "Name must not contain '/'.";
  return null;
};

const invalid = (field: string, msg: string) => ({
  msg: "Invalid data.",
  fields: { [field]: [msg] },
});

const prismaCode = (e: unknown) => (e as PrismaClientKnownRequestError)?.code;

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
      security: [],
      description: "Get list of categories (not paginated, `pagination.total` is the number of categories)."
    }
  })
  .use(auth)
  .post(
    "",
    async ({ prisma, body, set }) => {
      const name = body.name.trim();
      const error = nameError(name);
      if (error) {
        set.status = 422;
        return invalid("name", error);
      }
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
        if (prismaCode(e) === "P2002") {
          set.status = 409;
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
        name: t.String({
          description: `Category name. Trimmed; required, at most ${MAX_LENGTH} characters, must not contain '/'.`,
        }),
      }),
      response: {
        201: msgSchema,
        400: msgSchema,
        409: msgSchema,
        422: validationSchema,
      },
      detail: {
        description: `Create new category. Name is trimmed, required, at most ${MAX_LENGTH} characters and must not contain '/' (422). An existing name (case-insensitive) returns 409 "Category already exists.".`,
      }
    }
  )
  .put("",
    async ({ prisma, body, set }) => {
      const newName = body.newName.trim();
      const error = nameError(newName);
      if (error) {
        set.status = 422;
        return invalid("newName", error);
      }
      try {
        await prisma.category.update({
          where: {
            name: body.name,
          },
          data: {
            name: newName,
          },
        });
        return {
          msg: "Category updated successfully.",
        }
      } catch (e) {
        const code = prismaCode(e);
        if (code === "P2025") {
          set.status = 404;
          return {
            msg: "Category not found.",
          };
        }
        if (code === "P2002") {
          set.status = 409;
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
        name: t.String({ description: "Current name of the category." }),
        newName: t.String({
          description: `New name. Trimmed; required, at most ${MAX_LENGTH} characters, must not contain '/'.`,
        }),
      }),
      response: {
        200: msgSchema,
        400: msgSchema,
        404: msgSchema,
        409: msgSchema,
        422: validationSchema,
      },
      detail: {
        description: `Rename a category. 404 "Category not found." when \`name\` does not exist, 409 "Category already exists." when \`newName\` is taken, 422 when \`newName\` is empty, longer than ${MAX_LENGTH} characters or contains '/'.`,
      }
    }
  )
  .delete(
    ":name",
    async ({ prisma, set, params, request }) => {
      // Elysia giải mã path param nhưng giữ nguyên "%2F" → lấy tên từ URL gốc và giải mã đúng 1 lần,
      // để xoá được cả category cũ có "/" trong tên.
      let name = params.name;
      const raw = new URL(request.url).pathname.split("/category-book/")[1];
      if (raw !== undefined) {
        try {
          name = decodeURIComponent(raw);
        } catch {
          set.status = 400;
          return { msg: "Invalid data." };
        }
      }
      try {
        await prisma.category.delete({
          where: {
            name,
          },
        });
        return {
          msg: "Category deleted successfully.",
        }
      } catch (e) {
        if (prismaCode(e) === "P2025") {
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
        name: t.String({ description: "Category name, URL-encoded (e.g. K%E1%BB%B9%20n%C4%83ng)." }),
      }),
      response: {
        200: msgSchema,
        400: msgSchema,
        404: msgSchema,
        422: validationSchema,
      },
      detail: {
        description: "Delete category. The name must be URL-encoded; 404 \"Category not found.\" when it does not exist.",
      }
    }
  );
