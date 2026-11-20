import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable, FilterError } from "../plugins/filterTable";
import { auth } from "../plugins/auth";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import dayjs from "dayjs";
import { $Enums } from "../prisma";
import { recalcBookPrices } from "../utils/pricing";
import { Prisma } from "../prisma";

const promotionController = new Elysia({
  prefix: "promotion-book",
  tags: ["Promotion Management"],
}) as unknown as AppMain;

export default promotionController;

// ***************************************************************************

const PROMOTION_RULES =
  "Validation: `code`, `name` must not be blank; `code` is unique. " +
  "PERCENTAGE: `0 < value <= 100`. FIXED_AMOUNT: `value > 0` (VND). FREE_SHIPPING: `value` is ignored and stored as 0. " +
  "`startDate` must be before `endDate`. Errors → **422** `{ msg, fields }`.\n\n" +
  "Every create / update / enable / disable / delete recalculates `currentPrice` of the affected books: " +
  "price minus the discounts of promotions **in effect** (`isActive` and `startDate <= now <= endDate`), rounded, always between 0 and `price`.";

// t.UnionEnum tự gán default = giá trị đầu tiên → PATCH dùng Union literal để không ghi đè loại
const typeSchema = t.Union([t.Literal("PERCENTAGE"), t.Literal("FIXED_AMOUNT"), t.Literal("FREE_SHIPPING")]);
const codeSchema = t.String({ minLength: 1, maxLength: 191, description: "Unique promotion code." });
const nameSchema = t.String({ minLength: 1, maxLength: 191 });
const valueSchema = t.Number({
  description: "PERCENTAGE: 0 < value <= 100. FIXED_AMOUNT: value > 0 (VND). FREE_SHIPPING: ignored (stored as 0).",
});
const configFeSchema = t.Object({}, { additionalProperties: true, description: "Free-form UI config, stored as JSON." });

const bodyPromotionCreate = t.Object({
  code: codeSchema,
  name: nameSchema,
  description: t.Optional(t.String({ default: "" })),
  type: t.Optional(t.UnionEnum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"], {
    default: "PERCENTAGE",
  })),
  value: t.Optional(valueSchema),
  startDate: t.Optional(t.Date({ description: "Default: now." })),
  endDate: t.Optional(t.Date({ description: "Default: startDate + 7 days." })),
  isActive: t.Optional(t.Boolean({ default: true })),
  books: t.Optional(t.Array(t.String(), {
    default: [],
    description: "Book ids the promotion applies to. Every id must exist (404 otherwise).",
  })),
  configFe: t.Optional(configFeSchema),
});

// PATCH: mọi trường tuỳ chọn, KHÔNG có giá trị mặc định — trường không gửi thì giữ nguyên.
const bodyPromotionUpdate = t.Object({
  code: t.Optional(codeSchema),
  name: t.Optional(nameSchema),
  description: t.Optional(t.String()),
  type: t.Optional(typeSchema),
  value: t.Optional(valueSchema),
  startDate: t.Optional(t.Date()),
  endDate: t.Optional(t.Date()),
  isActive: t.Optional(t.Boolean({ description: "`false` disables the promotion; book prices are recalculated." })),
  books: t.Optional(t.Array(t.String(), {
    description: "Replaces the whole list of books (not merged). `[]` detaches all books. Every id must exist (404 otherwise).",
  })),
  configFe: t.Optional(configFeSchema),
});

const msgSchema = t.Object({ msg: t.String() });
const validationSchema = t.Object({
  msg: t.String(),
  fields: t.Record(t.String(), t.Array(t.String())),
});

type Fields = Record<string, string[]>;

/** Kiểm tra quy tắc nghiệp vụ của khuyến mãi (sau khi đã gộp với bản cũ khi PATCH). */
function validatePromotion(p: {
  code: string;
  name: string;
  type: $Enums.PromotionType;
  value: number | undefined;
  startDate: Date;
  endDate: Date;
}): Fields {
  const fields: Fields = {};
  if (!p.code.trim()) fields.code = ["Code is required."];
  if (!p.name.trim()) fields.name = ["Name is required."];
  if (p.type === "PERCENTAGE") {
    if (p.value === undefined || !Number.isFinite(p.value)) fields.value = ["Value is required."];
    else if (p.value <= 0 || p.value > 100) {
      fields.value = ["Percentage value must be greater than 0 and at most 100."];
    }
  }
  if (p.type === "FIXED_AMOUNT") {
    if (p.value === undefined || !Number.isFinite(p.value)) fields.value = ["Value is required."];
    else if (p.value <= 0) fields.value = ["Fixed amount value must be greater than 0."];
  }
  if (Number.isNaN(p.startDate.getTime())) fields.startDate = ["Invalid start date."];
  if (Number.isNaN(p.endDate.getTime())) fields.endDate = ["Invalid end date."];
  if (!fields.startDate && !fields.endDate && p.startDate >= p.endDate) {
    fields.endDate = ["End date must be after start date."];
  }
  return fields;
}

async function booksExist(prisma: Prisma.TransactionClient, ids: string[]) {
  if (ids.length === 0) return true;
  return (await prisma.book.count({ where: { id: { in: ids } } })) === ids.length;
}

async function codeTaken(prisma: Prisma.TransactionClient, code: string, excludeId?: string) {
  return !!(await prisma.promotion.findFirst({
    where: { code, ...(excludeId && { NOT: { id: excludeId } }) },
    select: { id: true },
  }));
}

const PROMOTION_TYPES = Object.values($Enums.PromotionType);

/**
 * `search` là JSON → dùng làm `where`. Chữ thường → `contains` trên cột chuỗi (code, name, description);
 * `type` là enum nên không dùng `contains` được (Prisma báo lỗi) — chỉ khớp chính xác khi từ khoá trùng tên loại.
 */
function promotionWhere(search: string | undefined): Prisma.PromotionWhereInput | undefined {
  const where = filterTable(search, ["code", "name", "description"]) as
    | Prisma.PromotionWhereInput
    | undefined;
  if (!search || !where || !Array.isArray(where.OR)) return where;
  let isJson = false;
  try {
    isJson = typeof JSON.parse(search) === "object";
  } catch {
    isJson = false;
  }
  if (isJson) return where;
  const type = PROMOTION_TYPES.find((x) => x === search.trim().toUpperCase().replace(/\s+/g, "_"));
  if (type) (where.OR as Prisma.PromotionWhereInput[]).push({ type });
  return where;
}

const duplicateCode = {
  msg: "Promotion code already exists.",
  fields: { code: ["Promotion code already exists."] },
};

promotionController
  .get("",
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
          const where = promotionWhere(search);
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
              lengthData: list.length,
            },
          };
        });
      } catch (error) {
        set.status = 400;
        return {
          msg: "Invalid filter or query syntax",
          // Không trả nguyên văn lỗi Prisma (lộ cấu trúc DB, đường dẫn file)
          error:
            error instanceof FilterError
              ? error.message
              : "Check the JSON filter: field names, operators and value types must match the Promotion model.",
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
          error: t.Optional(t.String()),
        }),
        422: validationSchema,
      },

      detail: {
        summary: "List promotions",
        description:
          "Query list of promotions. `search` is either a Prisma `where` JSON, or plain text matched (contains) against " +
          "`code`, `name`, `description`; plain text equal to a type (`PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING`, case-insensitive) also matches `type`.",
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
      summary: "Get a promotion",
      security: [],
      description: "Get promotion by id",
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
      const type = body.type ?? "PERCENTAGE";
      const startDate = body.startDate ?? new Date();
      const endDate = body.endDate ?? dayjs(startDate).add(1, "week").toDate();
      const code = body.code.trim();
      const name = body.name.trim();
      const fields = validatePromotion({ code, name, type, value: body.value, startDate, endDate });
      if (Object.keys(fields).length) {
        set.status = 422;
        return { msg: "Invalid data.", fields };
      }
      const books = [...new Set(body.books ?? [])];

      try {
        if (!(await booksExist(prisma, books))) {
          set.status = 404;
          return { msg: "One or more books not found." };
        }
        if (await codeTaken(prisma, code)) {
          set.status = 422;
          return duplicateCode;
        }

        await prisma.$transaction(async (tx) => {
          await tx.promotion.create({
            data: {
              code,
              name,
              description: body.description ?? "",
              type,
              value: type === "FREE_SHIPPING" ? 0 : body.value!,
              startDate,
              endDate,
              isActive: body.isActive ?? true,
              configFe: JSON.stringify(body.configFe ?? {}),
              books: { connect: books.map((id) => ({ id })) },
            },
          });
          await recalcBookPrices(tx, books);
        });

        set.status = 201;
        return {
          msg: "Created promotion successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2002") {
          set.status = 422;
          return duplicateCode;
        }
        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "One or more books not found." };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyPromotionCreate,
      response: {
        201: msgSchema,
        400: msgSchema,
        404: t.Object({ msg: t.String({ description: "`One or more books not found.`" }) }),
        422: validationSchema,
      },
      detail: {
        summary: "Create a promotion",
        description: `Create promotion. Returns **201**.\n\n${PROMOTION_RULES}`,
      }
    }
  )
  .patch(
    "/:id",
    async ({ params, body, prisma, set }) => {
      try {
        const old = await prisma.promotion.findUnique({
          where: { id: params.id },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
            startDate: true,
            endDate: true,
            books: { select: { id: true } },
          },
        });
        if (!old) {
          set.status = 404;
          return { msg: "Promotion not found." };
        }

        const code = body.code !== undefined ? body.code.trim() : old.code;
        const name = body.name !== undefined ? body.name.trim() : old.name;
        const type = body.type ?? old.type;
        const value = body.value ?? old.value;
        const startDate = body.startDate ?? old.startDate;
        const endDate = body.endDate ?? old.endDate;
        // Chỉ báo lỗi cho những gì request này đụng tới, để vẫn tắt/sửa được bản ghi cũ đang sai
        const touched = {
          code: body.code !== undefined,
          name: body.name !== undefined,
          value: body.type !== undefined || body.value !== undefined,
          startDate: body.startDate !== undefined || body.endDate !== undefined,
          endDate: body.startDate !== undefined || body.endDate !== undefined,
        };
        const fields = Object.fromEntries(
          Object.entries(validatePromotion({ code, name, type, value, startDate, endDate })).filter(
            ([key]) => touched[key as keyof typeof touched]
          )
        );
        if (Object.keys(fields).length) {
          set.status = 422;
          return { msg: "Invalid data.", fields };
        }

        const books = body.books ? [...new Set(body.books)] : undefined;
        if (books && !(await booksExist(prisma, books))) {
          set.status = 404;
          return { msg: "One or more books not found." };
        }
        if (body.code !== undefined && (await codeTaken(prisma, code, old.id))) {
          set.status = 422;
          return duplicateCode;
        }

        const data: Prisma.PromotionUpdateInput = {
          code,
          name,
          type,
          value: type === "FREE_SHIPPING" ? 0 : value,
          startDate,
          endDate,
        };
        if (body.description !== undefined) data.description = body.description;
        if (body.isActive !== undefined) data.isActive = body.isActive;
        if (body.configFe !== undefined) data.configFe = JSON.stringify(body.configFe);
        if (books) data.books = { set: books.map((id) => ({ id })) };

        await prisma.$transaction(async (tx) => {
          await tx.promotion.update({ where: { id: old.id }, data });
          // Sách cũ (có thể vừa bị gỡ) và sách mới đều phải tính lại giá
          await recalcBookPrices(tx, [...old.books.map((b) => b.id), ...(books ?? [])]);
        });

        return {
          msg: "Updated promotion successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2002") {
          set.status = 422;
          return duplicateCode;
        }
        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "One or more books not found." };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyPromotionUpdate,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: msgSchema,
        400: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Promotion not found.` or `One or more books not found.`" }) }),
        422: validationSchema,
      },
      detail: {
        summary: "Update a promotion",
        description:
          "Partially update a promotion. **Fields not sent are kept unchanged** (no default values are applied); " +
          "rules are checked on the merged result (e.g. sending only `type: PERCENTAGE` re-checks the stored `value`). " +
          "`books`, when sent, **replaces** the whole list.\n\n" +
          PROMOTION_RULES,
      }
    }
  )
  .delete(
    ":id",
    async ({ params, prisma, set }) => {
      try {
        await prisma.$transaction(async (tx) => {
          const promotion = await tx.promotion.delete({
            where: { id: params.id },
            select: { books: { select: { id: true } } },
          });
          await recalcBookPrices(tx, promotion.books.map((b) => b.id));
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
      response: {
        200: msgSchema,
        404: msgSchema,
        400: msgSchema,
        422: validationSchema,
      },
      detail: {
        summary: "Delete a promotion",
        description: "Delete promotion. `currentPrice` of the books it was attached to is recalculated.",
      }
    }
  );
