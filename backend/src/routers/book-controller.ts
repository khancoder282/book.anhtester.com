import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { filterTable, FilterError } from "../plugins/filterTable";
import { auth } from "../plugins/auth";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { Prisma } from "../prisma";
import path from "path";
import fs from "fs";
import { file_path } from "./file-controller";
import { calcCurrentPrice, recalcBookPrices, syncStaleBookPrices } from "../utils/pricing";
import { checkPictures, removeBookImages } from "../utils/book-images";

export function slugify(str: string) {
  return str
    .toString()
    .replace(/[Đđ]/g, "d")          // đ/Đ không tách dấu được bằng NFKD
    .normalize('NFKD')              // normalize Unicode accents
    .replace(/[\u0300-\u036f]/g, '')// remove separated diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')  // keep a-z, 0-9, spaces, underscores and hyphens
    .replace(/[\s_]+/g, '-')        // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens into one
    .replace(/^-+|-+$/g, '');       // trim leading/trailing hyphens
}

const bookController = new Elysia({
  tags: ["Book Management"],
  prefix: "book",
}) as unknown as AppMain;

export default bookController;

// **************************************************************************

/** Cột `price` / `currentPrice` là `Int` (MySQL tối đa 2.147.483.647) — giới hạn API là 1 tỷ VNĐ. */
export const MAX_BOOK_PRICE = 1_000_000_000;

const PRICING_RULE =
  "**Pricing rule.** `currentPrice` (selling price) is computed by the server and cannot be sent: `price` minus the discounts of the promotions " +
  "attached to the book that are **in effect** (`isActive = true` and `startDate <= now <= endDate`). PERCENTAGE takes off `price * value / 100`, " +
  "FIXED_AMOUNT takes off `value`, FREE_SHIPPING does not change the price; discounts of several promotions add up. " +
  "The result is rounded to an integer and always stays within `[0, price]`. It is recalculated when the book (price, promotions) " +
  "or any attached promotion changes, and when a promotion starts or ends.";

const nameSchema = t.String({ minLength: 1, maxLength: 191, description: "Unique book name (trimmed, must not be blank)." });
const slugSchema = t.String({
  maxLength: 191,
  description: "Optional. Normalized by the server (lowercase, `đ` → `d`, accents removed, non-alphanumerics dropped). Defaults to slugify(name). Must be unique.",
});
// t.UnionEnum tự gán default = giá trị đầu tiên → dùng Union literal cho PATCH để không ghi đè trạng thái
const statusSchema = t.Union([t.Literal("AVAILABLE"), t.Literal("UNAVAILABLE")]);
const PICTURES_RULE =
  "Paths of images uploaded with POST /api/file into `/$book-image/` (e.g. `/$book-image/dac-nhan-tam/bia-truoc.jpg`). " +
  "Any other path (outside `/$book-image/`, `..`, commas) → 422 `fields.pictures`.";
const picturesSchema = t.Array(t.String(), { description: PICTURES_RULE });
/** Cùng luật với category-controller.ts (tên category là khoá chính và nằm trong URL khi xoá). */
const CATEGORY_MAX_LENGTH = 24;
const CATEGORY_RULE =
  `Names are trimmed. Unknown names are created automatically and must be non-blank, at most ${CATEGORY_MAX_LENGTH} characters ` +
  "and must not contain '/' (422 `fields.categories`). Existing categories are matched as stored.";
const categoriesSchema = t.Array(t.String({ minLength: 1 }), {
  minItems: 1,
  description: `Category names. ${CATEGORY_RULE}`,
});
// t.Number + multipleOf: 1 (t.Integer của Elysia là union với chuỗi số, thông báo lỗi khó đọc)
const priceSchema = t.Number({
  multipleOf: 1,
  minimum: 0,
  maximum: MAX_BOOK_PRICE,
  description: `Regular price in VND: integer, 0 – ${MAX_BOOK_PRICE.toLocaleString("en-US")}.`,
});
const promotionsSchema = t.Array(t.String(), { description: "Promotion ids. Every id must exist (404 otherwise)." });

// ---- Thông tin thêm của sách, đều KHÔNG bắt buộc (2026-11-20) --------------------------------
// Gửi `null` hoặc chuỗi rỗng để xoá giá trị. Chuỗi được trim; chuỗi rỗng sau trim lưu thành null.
const MIN_PUBLISH_YEAR = 1000;
const MAX_PAGE_COUNT = 100_000;
/** Cột TEXT của MySQL tối đa 65.535 byte; chữ Việt UTF-8 tới 3 byte/ký tự → giới hạn 20.000 ký tự. */
const MAX_PREVIEW_LENGTH = 20_000;
const bookExtraSchemas = {
  author: t.Nullable(t.String({ maxLength: 191, description: 'Optional. Author name(s), at most 191 characters. `null` / `""` clears it.' })),
  publisher: t.Nullable(t.String({ maxLength: 191, description: 'Optional. Publisher, at most 191 characters. `null` / `""` clears it.' })),
  publishYear: t.Nullable(t.Number({
    multipleOf: 1,
    minimum: MIN_PUBLISH_YEAR,
    maximum: 9999,
    description: `Optional. Publication year: integer from ${MIN_PUBLISH_YEAR} to the current year (422 \`fields.publishYear\` if in the future). \`null\` clears it.`,
  })),
  pageCount: t.Nullable(t.Number({
    multipleOf: 1,
    minimum: 1,
    maximum: MAX_PAGE_COUNT,
    description: `Optional. Number of pages: integer 1 – ${MAX_PAGE_COUNT.toLocaleString("en-US")}. \`null\` clears it.`,
  })),
  isbn: t.Nullable(t.String({
    maxLength: 20,
    description:
      "Optional. ISBN-10 or ISBN-13. Hyphens and spaces are removed, `x` is upper-cased; the result must be a valid ISBN-10 " +
      "(9 digits + digit or `X`) or ISBN-13 (13 digits), check digit included (422 `fields.isbn`). Stored without hyphens. Not unique. " +
      '`null` / `""` clears it.',
  })),
  language: t.Nullable(t.String({ maxLength: 50, description: 'Optional. Language of the book (e.g. `Tiếng Việt`, `English`), at most 50 characters. `null` / `""` clears it.' })),
  previewTitle: t.Nullable(t.String({
    maxLength: 191,
    description: 'Optional. Title of the sample chapter ("read a sample"), at most 191 characters. `null` / `""` clears it.',
  })),
  previewContent: t.Nullable(t.String({
    maxLength: MAX_PREVIEW_LENGTH,
    description:
      `Optional. Sample chapter text, at most ${MAX_PREVIEW_LENGTH.toLocaleString("en-US")} characters. Plain text: paragraphs separated by a blank line, ` +
      'a line starting with `## ` is a subheading. `null` / `""` clears it.',
  })),
};
const bookExtraResponse = {
  author: t.Nullable(t.String()),
  publisher: t.Nullable(t.String()),
  publishYear: t.Nullable(t.Number()),
  pageCount: t.Nullable(t.Number()),
  isbn: t.Nullable(t.String({ description: "ISBN without hyphens." })),
  language: t.Nullable(t.String()),
};
/** Chỉ API chi tiết trả nội dung đọc thử; danh sách trả `hasPreview` cho nhẹ. */
const bookPreviewResponse = {
  previewTitle: t.Nullable(t.String()),
  previewContent: t.Nullable(t.String({ description: "Sample chapter text (paragraphs separated by a blank line, `## ` = subheading)." })),
};
const bookExtraSelect = {
  author: true,
  publisher: true,
  publishYear: true,
  pageCount: true,
  isbn: true,
  language: true,
} as const;
const BOOK_EXTRA_RULE =
  "- `author`, `publisher`, `publishYear`, `pageCount`, `isbn`, `language`, `previewTitle`, `previewContent` are optional " +
  "(see the schema for limits); `null` or a blank string clears them.";

type BookExtra = {
  author?: string | null;
  publisher?: string | null;
  publishYear?: number | null;
  pageCount?: number | null;
  isbn?: string | null;
  language?: string | null;
  previewTitle?: string | null;
  previewContent?: string | null;
};

function isValidIsbn(isbn: string) {
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = isbn
      .split("")
      .reduce((acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  if (/^\d{13}$/.test(isbn)) {
    const sum = isbn.split("").reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
    return sum % 10 === 0;
  }
  return false;
}

/** Chuẩn hoá thông tin thêm. Chỉ trả về trường có gửi lên (PATCH giữ nguyên trường không gửi). */
function parseBookExtra(body: BookExtra, fields: Record<string, string[]>): BookExtra {
  const data: BookExtra = {};
  const text = (v: string | null | undefined) => (v == null ? null : v.trim() || null);
  if (body.author !== undefined) data.author = text(body.author);
  if (body.publisher !== undefined) data.publisher = text(body.publisher);
  if (body.language !== undefined) data.language = text(body.language);
  if (body.previewTitle !== undefined) data.previewTitle = text(body.previewTitle);
  if (body.previewContent !== undefined) {
    // Chuẩn hoá xuống dòng (Windows gửi CRLF), giữ nguyên dòng trống giữa các đoạn văn
    data.previewContent = text(body.previewContent?.replace(/\r\n?/g, "\n"));
  }
  if (body.pageCount !== undefined) data.pageCount = body.pageCount;
  if (body.publishYear !== undefined) {
    const year = body.publishYear;
    if (year !== null && year > new Date().getFullYear()) {
      fields.publishYear = ["Publish year must not be in the future."];
    } else data.publishYear = year;
  }
  if (body.isbn !== undefined) {
    const isbn = body.isbn == null ? "" : body.isbn.replace(/[\s-]/g, "").toUpperCase();
    if (!isbn) data.isbn = null;
    else if (!isValidIsbn(isbn)) fields.isbn = ["ISBN must be a valid ISBN-10 or ISBN-13."];
    else data.isbn = isbn;
  }
  return data;
}

const bodyBookCreate = t.Object({
  name: nameSchema,
  slug: t.Optional(slugSchema),
  description: t.Optional(t.String()),
  status: t.Optional(t.UnionEnum(["AVAILABLE", "UNAVAILABLE"], { default: "AVAILABLE" })),
  pictures: t.Optional(picturesSchema),
  categories: categoriesSchema,
  price: t.Optional(t.Number({
    multipleOf: 1,
    minimum: 0,
    maximum: MAX_BOOK_PRICE,
    default: 50_000,
    description: `Regular price in VND: integer, 0 – ${MAX_BOOK_PRICE.toLocaleString("en-US")}. Default 50,000.`,
  })),
  promotions: t.Optional(promotionsSchema),
  author: t.Optional(bookExtraSchemas.author),
  publisher: t.Optional(bookExtraSchemas.publisher),
  publishYear: t.Optional(bookExtraSchemas.publishYear),
  pageCount: t.Optional(bookExtraSchemas.pageCount),
  isbn: t.Optional(bookExtraSchemas.isbn),
  language: t.Optional(bookExtraSchemas.language),
  previewTitle: t.Optional(bookExtraSchemas.previewTitle),
  previewContent: t.Optional(bookExtraSchemas.previewContent),
});

// PATCH: mọi trường đều tuỳ chọn và KHÔNG có giá trị mặc định (Elysia sẽ điền mặc định nếu có).
const bodyBookUpdate = t.Object({
  name: t.Optional(nameSchema),
  slug: t.Optional(slugSchema),
  description: t.Optional(t.String()),
  status: t.Optional(statusSchema),
  pictures: t.Optional(t.Array(t.String(), {
    description: `Replaces all pictures. \`[]\` removes all. Image files dropped from the list are deleted from the server unless another book still uses them. ${PICTURES_RULE}`,
  })),
  categories: t.Optional(t.Array(t.String({ minLength: 1 }), {
    minItems: 1,
    description: `Replaces the whole category list (not merged). ${CATEGORY_RULE}`,
  })),
  price: t.Optional(priceSchema),
  promotions: t.Optional(t.Array(t.String(), {
    description: "Replaces the whole promotion list (not merged). `[]` removes all promotions. Every id must exist (404 otherwise).",
  })),
  author: t.Optional(bookExtraSchemas.author),
  publisher: t.Optional(bookExtraSchemas.publisher),
  publishYear: t.Optional(bookExtraSchemas.publishYear),
  pageCount: t.Optional(bookExtraSchemas.pageCount),
  isbn: t.Optional(bookExtraSchemas.isbn),
  language: t.Optional(bookExtraSchemas.language),
  previewTitle: t.Optional(bookExtraSchemas.previewTitle),
  previewContent: t.Optional(bookExtraSchemas.previewContent),
});

const msgSchema = t.Object({ msg: t.String() });
const validationSchema = t.Object({
  msg: t.String(),
  fields: t.Record(t.String(), t.Array(t.String())),
});

type Fields = Record<string, string[]>;

function invalid(set: { status?: number | string }, fields: Fields, msg = "Invalid data.") {
  set.status = 422;
  return { msg, fields };
}

/** Trả về lỗi trùng tên / slug (bỏ qua chính sách đang sửa). */
async function findDuplicate(
  prisma: Prisma.TransactionClient,
  { name, slug }: { name?: string; slug?: string },
  excludeId?: string,
) {
  const notSelf = excludeId ? { NOT: { id: excludeId } } : {};
  // So sánh theo collation của DB (giống unique index): không phân biệt hoa thường
  if (name !== undefined && (await prisma.book.findFirst({ where: { name, ...notSelf }, select: { id: true } }))) {
    return { msg: "Book name already exists.", fields: { name: ["Book name already exists."] } };
  }
  if (slug !== undefined && (await prisma.book.findFirst({ where: { slug, ...notSelf }, select: { id: true } }))) {
    return { msg: "Slug already exists.", fields: { slug: ["Slug already exists."] } };
  }
  return null;
}

/**
 * Trim + bỏ trùng tên category. Tên chưa có trong DB (sẽ được tạo kèm) phải theo luật của
 * category-controller: bắt buộc, ≤ 24 ký tự, không có "/". Tên đã có thì giữ nguyên (dữ liệu cũ).
 */
async function checkCategories(prisma: Prisma.TransactionClient, input: string[]) {
  const errors: string[] = [];
  const names: string[] = [];
  for (const raw of input) {
    const name = raw.trim();
    if (!name) {
      errors.push("Category name is required.");
      continue;
    }
    if (!names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
  }
  const existing = await prisma.category.findMany({
    where: { name: { in: names } },
    select: { name: true },
  });
  // Khớp theo collation của DB → dùng đúng tên đang lưu
  const resolved = names.map(
    (n) => existing.find((e) => e.name.toLowerCase() === n.toLowerCase())?.name ?? n
  );
  for (const name of resolved) {
    if (existing.some((e) => e.name === name)) continue;
    if (name.length > CATEGORY_MAX_LENGTH) {
      errors.push(`Category "${name}" must be at most ${CATEGORY_MAX_LENGTH} characters.`);
    } else if (name.includes("/")) {
      errors.push(`Category "${name}" must not contain '/'.`);
    }
  }
  return { names: resolved, errors };
}

/** Bắt lỗi P2002 lọt qua bước kiểm tra trước (ghi đồng thời). */
function duplicateFromPrismaError(err: PrismaClientKnownRequestError) {
  const target = String((err.meta as { target?: unknown } | undefined)?.target ?? "");
  if (target.includes("slug")) return { msg: "Slug already exists.", fields: { slug: ["Slug already exists."] } };
  return { msg: "Book name already exists.", fields: { name: ["Book name already exists."] } };
}

function mapPictures(picture: string) {
  return picture
    .split(",")
    .map((x) => x.trim())
    .filter((x) => {
      if (!x) return false;
      try {
        const fullPath = path.join(file_path, x);
        return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
      } catch {
        return false;
      }
    });
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
        const where = filterTable(search, ["name", "description", "slug", "author", "publisher", "isbn"]);

        // Khuyến mãi tới hạn / hết hạn theo thời gian: cập nhật giá bán đã lưu trước khi lọc, sort.
        await prisma.$transaction((tx) => syncStaleBookPrices(tx));

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
              ...bookExtraSelect,
              previewTitle: true,
              previewContent: true,
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

        const mappedList = list.map(({ previewContent, ...item }) => ({
          ...item,
          hasPreview: !!previewContent,
          categories: item.categories.map((c) => c.name),
          picture: mapPictures(item.picture || ""),
        }));

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
          // Không trả nguyên văn lỗi Prisma (lộ cấu trúc DB, đường dẫn file)
          error:
            error instanceof FilterError
              ? error.message
              : "Check the JSON filter: field names, operators and value types must match the Book model.",
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
              "author",
              "publisher",
              "publishYear",
              "pageCount",
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
              currentPrice: t.Number({ description: "Selling price after promotions in effect. Always between 0 and `price`." }),
              viewCount: t.Number(),
              ...bookExtraResponse,
              previewTitle: t.Nullable(t.String()),
              hasPreview: t.Boolean({ description: "`true` when the book has a sample chapter (`previewContent`). Read it from GET /book/{id}." }),
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
                }),
                { description: "Active, not yet expired promotions (includes scheduled ones that have not started)." }
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
        422: validationSchema,
      },
      detail: {
        summary: "List books",
        description: `Query list of books (pagination, filtering, sorting). \`picture\` only lists files that exist. A plain-text \`search\` matches \`name\`, \`description\`, \`slug\`, \`author\`, \`publisher\` and \`isbn\`.\n\n${PRICING_RULE}`,
        tags: ["Book Management"],
        security: [],
      },
    }
  )

  .get(
    ":id",
    async ({ params, prisma, set, query: { view } }) => {
      await prisma.$transaction((tx) =>
        syncStaleBookPrices(tx, { OR: [{ id: params.id }, { slug: params.id }] })
      );

      const book = await prisma.book.findFirst({
        where: {
          OR: [{ id: params.id }, { slug: params.id }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          picture: true,
          price: true,
          currentPrice: true,
          createdAt: true,
          updatedAt: true,
          viewCount: true,
          ...bookExtraSelect,
          previewTitle: true,
          previewContent: true,
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

      const picture = mapPictures(book.picture || "").map((item) => {
        const fullPath = path.join(file_path, item);
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
        id: t.String({ description: "Book id or slug." }),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
          slug: t.String(),
          description: t.String(),
          price: t.Number(),
          currentPrice: t.Number({ description: "Selling price after promotions in effect. Always between 0 and `price`." }),
          viewCount: t.Number(),
          ...bookExtraResponse,
          ...bookPreviewResponse,
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
            }),
            { description: "Existing image files only. Empty array when the book has no picture." }
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
            }),
            { description: "Active, not yet expired promotions (includes scheduled ones that have not started)." }
          ),
        }),
        400: msgSchema,
        404: msgSchema,
      },
      query: t.Object({
        view: t.Optional(t.BooleanString({ examples: ["true", "false"], description: "`true` increments `viewCount`." }))
      }),
      detail: {
        summary: "Get a book",
        description: `Get a book by id or slug.\n\n${PRICING_RULE}`,
        security: [],
      },
    }
  )
  .use(auth)
  .post(
    "",
    async ({ prisma, body, set, auth }) => {
      const name = body.name.trim();
      const price = body.price ?? 50_000;
      if (!name) return invalid(set, { name: ["Name is required."] });
      const slug = slugify(body.slug?.trim() || name);
      if (!slug) {
        return invalid(set, { slug: ["Slug must contain at least one letter or digit."] });
      }

      const extraErrors: Fields = {};
      const extra = parseBookExtra(body, extraErrors);
      if (Object.keys(extraErrors).length) return invalid(set, extraErrors);
      // Ảnh chỉ được là file trong /$book-image/ (chặn đường dẫn kiểu "/../src")
      const pic = checkPictures(body.pictures ?? []);
      if ("error" in pic) return invalid(set, { pictures: [pic.error] });

      try {
        const cat = await checkCategories(prisma, body.categories);
        if (cat.errors.length) return invalid(set, { categories: cat.errors });

        const dup = await findDuplicate(prisma, { name, slug });
        if (dup) {
          set.status = 422;
          return dup;
        }

        const promotionIds = [...new Set(body.promotions ?? [])];
        const promotions = promotionIds.length
          ? await prisma.promotion.findMany({
            where: { id: { in: promotionIds } },
            select: { id: true, type: true, value: true, isActive: true, startDate: true, endDate: true },
          })
          : [];
        if (promotions.length !== promotionIds.length) {
          set.status = 404;
          return { msg: "Promotion not found." };
        }

        const categories = cat.names;
        await prisma.$transaction(async (tx) => {
          await tx.category.createMany({
            data: categories.map((c) => ({ name: c })),
            skipDuplicates: true,
          });
          await tx.book.create({
            data: {
              name,
              slug,
              description: body.description ?? "",
              status: body.status ?? "AVAILABLE",
              price,
              ...extra,
              picture: pic.pictures.join(","),
              currentPrice: calcCurrentPrice(price, promotions),
              promotions: { connect: promotionIds.map((id) => ({ id })) },
              categories: { connect: categories.map((c) => ({ name: c })) },
              auth: auth ? { connect: { id: auth.id } } : undefined,
            },
          });
        });

        set.status = 201;
        return {
          msg: "Book created successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2002") {
          set.status = 422;
          return duplicateFromPrismaError(err);
        }
        if (err.code === "P2025" || err.code === "P2003") {
          set.status = 404;
          return { msg: "Promotion not found." };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: bodyBookCreate,
      response: {
        201: msgSchema,
        400: msgSchema,
        401: msgSchema,
        403: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Promotion not found.` when an id in `promotions` does not exist." }) }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()), {
            description: "Invalid fields. Duplicate name → `name`, duplicate slug → `slug` (msg `Book name already exists.` / `Slug already exists.`), invalid new category → `categories`, future `publishYear` → `publishYear`, bad ISBN → `isbn`.",
          }),
        }),
      },
      detail: {
        summary: "Create a book",
        description:
          "Create a new book. Returns **201**.\n\n" +
          "- `name` is trimmed and must not be blank; `slug` is normalized (`Đắc Nhân Tâm` → `dac-nhan-tam`) and must not end up empty.\n" +
          `- \`price\`: integer 0 – ${MAX_BOOK_PRICE.toLocaleString("en-US")} (default 50,000).\n` +
          "- No `promotions` (or `[]`) → no promotion attached, `currentPrice = price`.\n" +
          BOOK_EXTRA_RULE + "\n\n" +
          PRICING_RULE,
      }
    }
  )
  .patch(
    "/:id",
    async ({ body, prisma, set, params }) => {
      try {
        const old = await prisma.book.findUnique({
          where: { id: params.id },
          select: { id: true, name: true, picture: true },
        });
        if (!old) {
          set.status = 404;
          return { msg: "Book not found." };
        }

        const data: Prisma.BookUpdateInput = {};
        const fields: Fields = {};

        if (body.name !== undefined) {
          const name = body.name.trim();
          if (!name) fields.name = ["Name is required."];
          else data.name = name;
        }
        if (body.slug !== undefined) {
          const slug = slugify(body.slug.trim() || (data.name as string | undefined) || old.name);
          if (!slug) fields.slug = ["Slug must contain at least one letter or digit."];
          else data.slug = slug;
        }
        Object.assign(data, parseBookExtra(body, fields));
        let newPictures: string[] | undefined;
        if (body.pictures !== undefined) {
          const pic = checkPictures(body.pictures);
          if ("error" in pic) fields.pictures = [pic.error];
          else newPictures = pic.pictures;
        }
        let categories: string[] | undefined;
        if (body.categories !== undefined) {
          const cat = await checkCategories(prisma, body.categories);
          if (cat.errors.length) fields.categories = cat.errors;
          else categories = cat.names;
        }
        if (Object.keys(fields).length) return invalid(set, fields);

        if (body.description !== undefined) data.description = body.description;
        if (body.status !== undefined) data.status = body.status;
        if (body.price !== undefined) data.price = body.price;
        if (newPictures) data.picture = newPictures.join(",");

        const dup = await findDuplicate(
          prisma,
          { name: data.name as string | undefined, slug: data.slug as string | undefined },
          old.id,
        );
        if (dup) {
          set.status = 422;
          return dup;
        }

        let promotionIds: string[] | undefined;
        if (body.promotions !== undefined) {
          promotionIds = [...new Set(body.promotions)];
          const count = promotionIds.length
            ? await prisma.promotion.count({ where: { id: { in: promotionIds } } })
            : 0;
          if (count !== promotionIds.length) {
            set.status = 404;
            return { msg: "Promotion not found." };
          }
          data.promotions = { set: promotionIds.map((id) => ({ id })) };
        }

        if (categories) data.categories = { set: categories.map((c) => ({ name: c })) };

        await prisma.$transaction(async (tx) => {
          if (categories) {
            await tx.category.createMany({
              data: categories.map((c) => ({ name: c })),
              skipDuplicates: true,
            });
          }
          await tx.book.update({ where: { id: old.id }, data });
          // Giá gốc hoặc danh sách khuyến mãi có thể đã đổi
          await recalcBookPrices(tx, [old.id]);
        });

        // Ảnh bị bỏ khỏi sách → xoá file (nếu không sách nào khác dùng), tránh đầy ổ đĩa
        if (newPictures) {
          const dropped = (old.picture || "").split(",").filter((p) => p && !newPictures!.includes(p));
          await removeBookImages(prisma, dropped);
        }

        return {
          msg: "Book updated successfully.",
        };
      } catch (e) {
        console.log(e);
        const err = e as PrismaClientKnownRequestError;
        if (err.code === "P2002") {
          set.status = 422;
          return duplicateFromPrismaError(err);
        }
        if (err.code === "P2025") {
          set.status = 404;
          return { msg: "Book not found." };
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
        200: msgSchema,
        400: msgSchema,
        401: msgSchema,
        403: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Book not found.` or `Promotion not found.`" }) }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()), {
            description: "Invalid fields. Duplicate name → `name`, duplicate slug → `slug`, invalid new category → `categories`, future `publishYear` → `publishYear`, bad ISBN → `isbn`.",
          }),
        }),
      },
      body: bodyBookUpdate,
      detail: {
        summary: "Update a book",
        description:
          "Partially update a book. **Fields not sent are kept unchanged** (no default values are applied).\n\n" +
          "- `categories` and `promotions`, when sent, **replace** the whole list (`promotions: []` removes all promotions).\n" +
          "- `pictures`, when sent, replaces all pictures.\n" +
          "- `slug`, when sent, is normalized; changing `name` alone does not change `slug`.\n" +
          "- `currentPrice` is recalculated after every update.\n" +
          BOOK_EXTRA_RULE + "\n\n" +
          PRICING_RULE,
      }
    }
  )
  .delete(
    "/:id",
    async ({ params, prisma, set }) => {
      try {
        const book = await prisma.book.delete({
          where: { id: params.id },
          select: { picture: true },
        });
        // Xoá ảnh của sách sau khi đã xoá trong DB. Chỉ xoá file trong /$book-image/ mà không sách nào khác dùng,
        // không xoá đệ quy (trước đây `rmSync(..., { recursive: true })` không kiểm đường dẫn).
        await removeBookImages(prisma, (book.picture || "").split(","));

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
        200: msgSchema,
        400: msgSchema,
        404: msgSchema,
        422: validationSchema,
      },
      detail: {
        summary: "Delete a book",
        description:
          "Delete a book. Its picture files in `/$book-image/` are deleted too (unless another book still uses the same file), " +
          "and the book image folder is removed when it becomes empty.",
      },
    }
  );
