import Elysia, { t } from "elysia";
import path from "path";
import fs from "fs";
import { AppMain } from "../regis";
import { auth } from "../plugins/auth";
import { $Enums, Prisma } from "../prisma";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { isPromotionEffective, syncStaleBookPrices } from "../utils/pricing";
import { file_path } from "./file-controller";

/**
 * Đơn hàng (2026-11-21). Giỏ hàng nằm ở trình duyệt; server chỉ báo giá (`/quote`) và lưu đơn đã đặt.
 * Giá luôn tính lại ở server từ `book.currentPrice`, không tin giá client gửi.
 */
const orderController = new Elysia({
  tags: ["Order Management"],
  prefix: "order",
}) as unknown as AppMain;

export default orderController;

// **************************************************************************

/** Đơn từ 500.000 đ (tạm tính) được miễn phí vận chuyển. */
export const FREE_SHIP_THRESHOLD = 500_000;
/** Phí vận chuyển cố định khi không được miễn. */
export const SHIPPING_FEE = 30_000;
export const MAX_ORDER_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;
/** Cột tiền là `Int` (MySQL tối đa 2.147.483.647). */
export const MAX_ORDER_TOTAL = 2_000_000_000;
const NOTE_MAX_LENGTH = 1000;
const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const PRICING_RULE =
  "**Pricing rule (server-side, client prices are never trusted).** " +
  "`price` = regular price, `unitPrice` = selling price = the book's `currentPrice` at order time (regular price minus promotions in effect). " +
  "`lineTotal = unitPrice × quantity`; `subtotal = Σ lineTotal`; `discount = Σ (price − unitPrice) × quantity` (informational, already included in `unitPrice`). " +
  `\`shippingFee\` = **0** when at least one book has a FREE_SHIPPING promotion in effect (\`isActive\` and \`startDate <= now <= endDate\`) ` +
  `or \`subtotal >= ${FREE_SHIP_THRESHOLD.toLocaleString("en-US")}\` (FREE_SHIP_THRESHOLD), otherwise **${SHIPPING_FEE.toLocaleString("en-US")}** (SHIPPING_FEE). ` +
  "`total = subtotal + shippingFee`. Amounts are integers in VND.";

const ITEMS_RULE =
  `\`items\`: 1 – ${MAX_ORDER_ITEMS} lines, \`quantity\` integer 1 – ${MAX_ITEM_QUANTITY}. \`bookId\` accepts a book **id or slug**. ` +
  `Lines pointing to the same book are merged (quantities added; the merged quantity must still be at most ${MAX_ITEM_QUANTITY}).`;

// ---- Schemas ------------------------------------------------------------------------------

const msgSchema = t.Object({ msg: t.String() });
const validationSchema = t.Object({
  msg: t.String(),
  fields: t.Record(t.String(), t.Array(t.String())),
});

const cartItemSchema = t.Object({
  bookId: t.String({ minLength: 1, description: "Book id or slug.", error: "Book id is required." }),
  quantity: t.Number({
    multipleOf: 1,
    minimum: 1,
    maximum: MAX_ITEM_QUANTITY,
    description: `Integer 1 – ${MAX_ITEM_QUANTITY}.`,
    error: `Quantity must be an integer from 1 to ${MAX_ITEM_QUANTITY}.`,
  }),
});
const cartItemsSchema = t.Array(cartItemSchema, {
  minItems: 1,
  maxItems: MAX_ORDER_ITEMS,
  description: `Cart lines, 1 – ${MAX_ORDER_ITEMS}. Duplicate books are merged.`,
  error: `Items must contain 1 to ${MAX_ORDER_ITEMS} lines.`,
});

const statusSchema = t.Union([t.Literal("PENDING"), t.Literal("CANCELLED")], {
  description: "`PENDING` = placed successfully, `CANCELLED` = cancelled by the customer.",
});
const paymentMethodSchema = t.Union([t.Literal("COD"), t.Literal("BANK_TRANSFER")], {
  description: "`COD` (cash on delivery, default) or `BANK_TRANSFER`.",
});

const quoteLineSchema = t.Object({
  bookId: t.String({ description: "The book's id (or the value sent, when the book was not found)." }),
  name: t.String({ description: "Empty string when the book was not found." }),
  slug: t.String({ description: "Empty string when the book was not found." }),
  picture: t.Nullable(t.String({ description: "File path of the first existing picture (view it at `/view-file/<path>`)." })),
  price: t.Number({ description: "Regular price. 0 when the book was not found." }),
  unitPrice: t.Number({ description: "Selling price (`currentPrice`). 0 when the book was not found." }),
  quantity: t.Number(),
  lineTotal: t.Number({ description: "`unitPrice × quantity`." }),
  available: t.Boolean({ description: "`false` when the book was not found or is UNAVAILABLE. Such lines are excluded from totals." }),
  error: t.Nullable(t.String({ description: "`Book not found.` or `Book is unavailable.`; `null` when available." })),
});

const quoteSchema = t.Object({
  items: t.Array(quoteLineSchema),
  subtotal: t.Number(),
  discount: t.Number(),
  shippingFee: t.Number(),
  freeShipping: t.Boolean({ description: "`true` when shipping is free (FREE_SHIPPING promotion or subtotal over the threshold)." }),
  freeShipThreshold: t.Number({ description: `FREE_SHIP_THRESHOLD = ${FREE_SHIP_THRESHOLD}.` }),
  total: t.Number(),
  canCheckout: t.Boolean({ description: "`true` when there is at least one line and every line is available." }),
});

const orderItemSchema = t.Object({
  id: t.String(),
  bookId: t.Nullable(t.String({ description: "`null` when the book has been deleted since." })),
  name: t.String({ description: "Snapshot of the book name at order time." }),
  slug: t.String(),
  picture: t.Nullable(t.String()),
  price: t.Number({ description: "Regular price at order time." }),
  unitPrice: t.Number({ description: "Selling price at order time." }),
  quantity: t.Number(),
  lineTotal: t.Number(),
});

const orderSchema = t.Object({
  id: t.String(),
  code: t.String({ description: "Order code: `BK` + yyMMdd (Vietnam time) + 4 random uppercase letters/digits, e.g. `BK261121A7K2`." }),
  status: statusSchema,
  recipientName: t.String(),
  phone: t.String({ description: "Normalized: digits only, leading `0`." }),
  province: t.String(),
  ward: t.String(),
  street: t.String(),
  note: t.Nullable(t.String()),
  paymentMethod: paymentMethodSchema,
  subtotal: t.Number(),
  discount: t.Number(),
  shippingFee: t.Number(),
  total: t.Number(),
  createdAt: t.Date({ format: "date-time" }),
  updatedAt: t.Date({ format: "date-time" }),
  items: t.Array(orderItemSchema),
});

const bodyQuote = t.Object({ items: cartItemsSchema });

const bodyOrderCreate = t.Object({
  items: cartItemsSchema,
  recipientName: t.String({
    maxLength: 191,
    description: "Trimmed, 1 – 191 characters.",
    error: "Recipient name must be at most 191 characters.",
  }),
  phone: t.String({
    maxLength: 30,
    description:
      "Vietnamese mobile number. Spaces, dots and hyphens are removed; the result must match `^(0|\\+84)(3|5|7|8|9)\\d{8}$`. Stored with a leading `0`.",
    error: "Phone number is invalid.",
  }),
  province: t.String({ maxLength: 191, description: "Province name exactly as returned by GET /api/address.", error: "Province is invalid." }),
  ward: t.String({ maxLength: 191, description: "Ward name of that province, as returned by GET /api/address/{province}.", error: "Ward is invalid." }),
  street: t.String({ maxLength: 255, description: "House number and street. Trimmed, 1 – 255 characters.", error: "Street must be at most 255 characters." }),
  note: t.Optional(t.Nullable(t.String({
    maxLength: NOTE_MAX_LENGTH,
    description: `Optional, at most ${NOTE_MAX_LENGTH.toLocaleString("en-US")} characters. Blank → \`null\`.`,
    error: `Note must be at most ${NOTE_MAX_LENGTH.toLocaleString("en-US")} characters.`,
  }))),
  paymentMethod: t.Optional(paymentMethodSchema),
});

// ---- Helpers ------------------------------------------------------------------------------

type Fields = Record<string, string[]>;
type Db = Prisma.TransactionClient;
type CartItem = { bookId: string; quantity: number };

function invalid(set: { status?: number | string }, fields: Fields, msg = "Invalid data.") {
  set.status = 422;
  return { msg, fields };
}

/** Ảnh đầu tiên còn tồn tại trên đĩa (cột `picture` là chuỗi đường dẫn nối bằng dấu phẩy). */
function firstPicture(picture: string) {
  for (const raw of picture.split(",")) {
    const p = raw.trim();
    if (!p) continue;
    try {
      const full = path.join(file_path, p);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) return p;
    } catch {
      // bỏ qua đường dẫn hỏng
    }
  }
  return null;
}

type QuoteLine = {
  bookId: string;
  name: string;
  slug: string;
  picture: string | null;
  price: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  error: string | null;
};

/**
 * Báo giá giỏ hàng. Đồng bộ giá bán đã lưu trước (khuyến mãi tới hạn / hết hạn), rồi tính theo PRICING_RULE.
 * Trả kèm `fields` khi số lượng sau khi gộp vượt giới hạn.
 */
async function buildQuote(db: Db, items: CartItem[]) {
  const keys = [...new Set(items.map((i) => i.bookId.trim()))];
  const where: Prisma.BookWhereInput = { OR: [{ id: { in: keys } }, { slug: { in: keys } }] };
  await syncStaleBookPrices(db, where);
  const books = await db.book.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      picture: true,
      price: true,
      currentPrice: true,
      status: true,
      promotions: {
        where: { type: $Enums.PromotionType.FREE_SHIPPING },
        select: { type: true, value: true, isActive: true, startDate: true, endDate: true },
      },
    },
  });
  const findBook = (key: string) =>
    books.find((b) => b.id === key) ??
    books.find((b) => b.slug === key) ??
    // collation của MySQL không phân biệt hoa thường
    books.find((b) => b.slug.toLowerCase() === key.toLowerCase());

  // Gộp theo sách thật (id và slug của cùng một sách là một dòng), giữ thứ tự xuất hiện đầu tiên
  const merged = new Map<string, { key: string; book: (typeof books)[number] | undefined; quantity: number }>();
  for (const item of items) {
    const key = item.bookId.trim();
    const book = findBook(key);
    const mapKey = book ? `book:${book.id}` : `missing:${key}`;
    const cur = merged.get(mapKey);
    if (cur) cur.quantity += item.quantity;
    else merged.set(mapKey, { key, book, quantity: item.quantity });
  }

  const fields: Fields = {};
  const now = new Date();
  let freeShipPromo = false;
  const lines: QuoteLine[] = [];
  for (const { key, book, quantity } of merged.values()) {
    if (quantity > MAX_ITEM_QUANTITY) {
      (fields.items ??= []).push(
        `Quantity of "${book?.name ?? key}" must be at most ${MAX_ITEM_QUANTITY} (duplicate lines are added up).`
      );
    }
    if (!book) {
      lines.push({
        bookId: key, name: "", slug: "", picture: null, price: 0, unitPrice: 0,
        quantity, lineTotal: 0, available: false, error: "Book not found.",
      });
      continue;
    }
    const available = book.status === $Enums.BookStatus.AVAILABLE;
    if (available && book.promotions.some((p) => isPromotionEffective(p, now))) freeShipPromo = true;
    lines.push({
      bookId: book.id,
      name: book.name,
      slug: book.slug,
      picture: firstPicture(book.picture || ""),
      price: book.price,
      unitPrice: book.currentPrice,
      quantity,
      lineTotal: book.currentPrice * quantity,
      available,
      error: available ? null : "Book is unavailable.",
    });
  }

  const ok = lines.filter((l) => l.available);
  const subtotal = ok.reduce((s, l) => s + l.lineTotal, 0);
  const discount = ok.reduce((s, l) => s + (l.price - l.unitPrice) * l.quantity, 0);
  // Không có dòng hợp lệ nào thì không tính phí vận chuyển
  const freeShipping = ok.length > 0 && (freeShipPromo || subtotal >= FREE_SHIP_THRESHOLD);
  const shippingFee = ok.length === 0 || freeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  return {
    quote: {
      items: lines,
      subtotal,
      discount,
      shippingFee,
      freeShipping,
      freeShipThreshold: FREE_SHIP_THRESHOLD,
      total,
      canCheckout: lines.length > 0 && lines.every((l) => l.available),
    },
    fields,
  };
}

/** `BK` + yyMMdd theo giờ Việt Nam (UTC+7) + 4 ký tự A-Z0-9. */
function newOrderCode() {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${pad(vn.getUTCFullYear() % 100)}${pad(vn.getUTCMonth() + 1)}${pad(vn.getUTCDate())}`;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rand = Array.from(bytes, (b) => chars[b % chars.length]).join("");
  return `BK${date}${rand}`;
}

async function uniqueOrderCode(db: Db) {
  for (let i = 0; i < 10; i++) {
    const code = newOrderCode();
    if (!(await db.order.findUnique({ where: { code }, select: { id: true } }))) return code;
  }
  throw new Error("Could not generate a unique order code.");
}

const orderSelect = {
  id: true,
  code: true,
  status: true,
  recipientName: true,
  phone: true,
  province: true,
  ward: true,
  street: true,
  note: true,
  paymentMethod: true,
  subtotal: true,
  discount: true,
  shippingFee: true,
  total: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      id: true,
      bookId: true,
      name: true,
      slug: true,
      picture: true,
      price: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
    },
  },
} satisfies Prisma.OrderSelect;

/** Chỉ tìm trong đơn của chính user; đơn của người khác coi như không tồn tại. */
function ownOrderWhere(userId: string, idOrCode: string): Prisma.OrderWhereInput {
  return { userId, OR: [{ id: idOrCode }, { code: idOrCode }] };
}

const notFound = { msg: "Order not found." };

// ---- Routes -------------------------------------------------------------------------------

orderController
  .post(
    "/quote",
    async ({ body, prisma, set }) => {
      try {
        const { quote, fields } = await prisma.$transaction((tx) => buildQuote(tx, body.items));
        if (Object.keys(fields).length) return invalid(set, fields);
        return quote;
      } catch (e) {
        console.log(e);
        set.status = 400;
        return { msg: "Invalid data." };
      }
    },
    {
      body: bodyQuote,
      response: {
        200: quoteSchema,
        400: msgSchema,
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()), {
            description: "Invalid `items` (empty, more than 50 lines, bad quantity, merged quantity over 99).",
          }),
        }),
      },
      detail: {
        summary: "Quote a cart",
        description:
          "Price a cart without placing an order (no login needed). The cart lives in the browser; call this to show up-to-date prices, " +
          "availability and totals.\n\n" +
          ITEMS_RULE + "\n\n" +
          "- A book that does not exist → line with `available: false`, `error: \"Book not found.\"`, empty `name`/`slug`, prices 0.\n" +
          "- A book with status UNAVAILABLE → `available: false`, `error: \"Book is unavailable.\"`.\n" +
          "- Unavailable lines are **excluded from the totals**. `canCheckout` is `true` only when there is at least one line and every line is available.\n" +
          "- `bookId` in the response is the book's id, even when a slug was sent.\n" +
          "- When no line is available, `shippingFee` is 0.\n\n" +
          PRICING_RULE,
        security: [],
      },
    }
  )
  .use(auth)
  .post(
    "",
    async ({ body, prisma, set, auth }) => {
      const fields: Fields = {};
      const recipientName = body.recipientName.trim();
      if (!recipientName) fields.recipientName = ["Recipient name is required."];

      let phone = body.phone.replace(/[\s.-]/g, "");
      if (!PHONE_REGEX.test(phone)) fields.phone = ["Phone number must be a valid Vietnamese mobile number (e.g. 0912345678)."];
      else if (phone.startsWith("+84")) phone = `0${phone.slice(3)}`;

      const street = body.street.trim();
      if (!street) fields.street = ["Street is required."];

      const note = body.note == null ? null : body.note.trim() || null;
      const paymentMethod = body.paymentMethod ?? "COD";

      try {
        // Tỉnh / phường phải có trong bảng Address; lưu đúng tên đang lưu trong DB
        let province = body.province.trim();
        let ward = body.ward.trim();
        if (!province) fields.province = ["Province is required."];
        else {
          const div = await prisma.address.findFirst({ where: { div: province }, select: { div: true } });
          if (!div) fields.province = ["Province does not exist."];
          else province = div.div;
        }
        if (!ward) fields.ward = ["Ward is required."];
        else if (!fields.province) {
          const w = await prisma.address.findFirst({ where: { div: province, wards: ward }, select: { wards: true } });
          if (!w) fields.ward = ["Ward does not belong to the selected province."];
          else ward = w.wards;
        }

        const run = () =>
          prisma.$transaction(async (tx) => {
            const { quote, fields: itemFields } = await buildQuote(tx, body.items);
            const problems = [...(itemFields.items ?? [])];
            for (const line of quote.items) {
              if (line.error === "Book not found.") problems.push(`Book "${line.bookId}" not found.`);
              else if (line.error) problems.push(`Book "${line.name}" is unavailable.`);
            }
            if (!problems.length && quote.total > MAX_ORDER_TOTAL) {
              problems.push(`Order total must be at most ${MAX_ORDER_TOTAL.toLocaleString("en-US")}.`);
            }
            if (problems.length) fields.items = problems;
            if (Object.keys(fields).length) return null;

            return tx.order.create({
              data: {
                code: await uniqueOrderCode(tx),
                userId: auth!.id,
                recipientName,
                phone,
                province,
                ward,
                street,
                note,
                paymentMethod,
                subtotal: quote.subtotal,
                discount: quote.discount,
                shippingFee: quote.shippingFee,
                total: quote.total,
                items: {
                  create: quote.items.map((l) => ({
                    bookId: l.bookId,
                    name: l.name,
                    slug: l.slug,
                    picture: l.picture,
                    price: l.price,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                    lineTotal: l.lineTotal,
                  })),
                },
              },
              select: orderSelect,
            });
          });

        let order: Awaited<ReturnType<typeof run>> = null;
        for (let attempt = 0; ; attempt++) {
          try {
            order = await run();
            break;
          } catch (e) {
            // Trùng mã đơn do ghi đồng thời → sinh mã khác
            if ((e as PrismaClientKnownRequestError).code === "P2002" && attempt < 3) continue;
            throw e;
          }
        }
        if (!order) return invalid(set, fields);

        set.status = 201;
        return { msg: "Order placed successfully.", order };
      } catch (e) {
        console.log(e);
        set.status = 400;
        return { msg: "Invalid data." };
      }
    },
    {
      body: bodyOrderCreate,
      response: {
        201: t.Object({ msg: t.String({ description: "`Order placed successfully.`" }), order: orderSchema }),
        400: msgSchema,
        401: msgSchema,
        403: msgSchema,
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()), {
            description:
              "Invalid fields: `recipientName`, `phone`, `province` (not in the address list), `ward` (not in that province), `street`, `note`, " +
              "`items` (empty / too many / bad quantity, or one message per book that is not found or unavailable).",
          }),
        }),
      },
      detail: {
        summary: "Place an order",
        description:
          "Place an order for the current user from the browser cart. Returns **201** with the order. Everything is created in one transaction.\n\n" +
          ITEMS_RULE + "\n\n" +
          "Validation → **422** `{ msg: \"Invalid data.\", fields }`:\n" +
          "- `recipientName`: trimmed, 1 – 191 characters.\n" +
          "- `phone`: spaces, dots and hyphens removed, must be a Vietnamese mobile number `^(0|\\+84)(3|5|7|8|9)\\d{8}$`; stored with a leading `0` (`+84912345678` → `0912345678`).\n" +
          "- `province` must exist in GET /api/address; `ward` must belong to that province (GET /api/address/{province}).\n" +
          "- `street`: trimmed, 1 – 255 characters. `note`: optional, at most 1,000 characters.\n" +
          "- `items`: any book that is not found or UNAVAILABLE → `fields.items` with one message per book. No order is created.\n" +
          "- `paymentMethod`: `COD` (default) or `BANK_TRANSFER`. New orders have status `PENDING`.\n\n" +
          "Each order line stores a snapshot (name, slug, first picture, prices) so the order stays readable after the book changes or is deleted (`bookId` becomes `null`).\n\n" +
          PRICING_RULE,
      },
    }
  )
  .get(
    "",
    async ({ query, prisma, auth }) => {
      const { page = 1, limit = 10, status } = query;
      const where: Prisma.OrderWhereInput = { userId: auth!.id, ...(status && { status }) };
      const [list, total] = await prisma.$transaction([
        prisma.order.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
          select: orderSelect,
        }),
        prisma.order.count({ where }),
      ]);
      return {
        list,
        pagination: {
          total,
          totalPage: Math.ceil(total / limit),
          currentPage: page,
          lengthData: list.length,
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1, multipleOf: 1, default: 1, description: "Default 1." })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, multipleOf: 1, default: 10, description: "Default 10, at most 100." })),
        status: t.Optional(statusSchema),
      }),
      response: {
        200: t.Object({
          list: t.Array(orderSchema),
          pagination: t.Object({
            total: t.Number(),
            totalPage: t.Number(),
            currentPage: t.Number(),
            lengthData: t.Number({ description: "Number of orders in `list`." }),
          }),
        }),
        401: msgSchema,
        403: msgSchema,
        422: validationSchema,
      },
      detail: {
        summary: "List my orders",
        description: "Orders of the current user only, newest first. Optional `status` filter (`PENDING` / `CANCELLED`).",
      },
    }
  )
  .get(
    "/:id",
    async ({ params, prisma, set, auth }) => {
      const order = await prisma.order.findFirst({ where: ownOrderWhere(auth!.id, params.id), select: orderSelect });
      if (!order) {
        set.status = 404;
        return notFound;
      }
      return order;
    },
    {
      params: t.Object({ id: t.String({ description: "Order id or order code (e.g. `BK261121A7K2`)." }) }),
      response: {
        200: orderSchema,
        401: msgSchema,
        403: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Order not found.` — also returned for another user's order." }) }),
      },
      detail: {
        summary: "Get my order",
        description: "Get one of the current user's orders by id or code. Another user's order returns **404** (its existence is not revealed).",
      },
    }
  )
  .patch(
    "/:id/cancel",
    async ({ params, prisma, set, auth }) => {
      const found = await prisma.order.findFirst({
        where: ownOrderWhere(auth!.id, params.id),
        select: { id: true, status: true },
      });
      if (!found) {
        set.status = 404;
        return notFound;
      }
      // Điều kiện status trong updateMany chặn hai request huỷ cùng lúc
      const { count } = await prisma.order.updateMany({
        where: { id: found.id, status: $Enums.OrderStatus.PENDING },
        data: { status: $Enums.OrderStatus.CANCELLED },
      });
      if (count === 0) {
        set.status = 409;
        return { msg: "Order is already cancelled." };
      }
      const order = await prisma.order.findUniqueOrThrow({ where: { id: found.id }, select: orderSelect });
      return { msg: "Order cancelled.", order };
    },
    {
      params: t.Object({ id: t.String({ description: "Order id or order code." }) }),
      response: {
        200: t.Object({ msg: t.String({ description: "`Order cancelled.`" }), order: orderSchema }),
        401: msgSchema,
        403: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Order not found.` — also returned for another user's order." }) }),
        409: t.Object({ msg: t.String({ description: "`Order is already cancelled.`" }) }),
      },
      detail: {
        summary: "Cancel my order",
        description:
          "Cancel one of the current user's orders. Only `PENDING` orders can be cancelled (→ `CANCELLED`); " +
          "an already cancelled order returns **409**. Another user's order returns **404**.",
      },
    }
  );
