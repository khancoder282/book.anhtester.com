import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { auth } from "../plugins/auth";
import { $Enums, Prisma } from "../prisma";
import type { PrismaClient } from "../prisma/client";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import {
  MAX_ITEM_QUANTITY,
  MAX_ORDER_ITEMS,
  PRICING_RULE,
  buildQuote,
  invalid,
  type Fields,
  msgSchema,
  quoteLineSchema,
  validationSchema,
} from "./order-controller";

/**
 * Giỏ hàng trên server (2026-11-21) cho user đã đăng nhập: mỗi sách một dòng (`CartItem`), chỉ lưu số lượng.
 * Đọc giỏ luôn tính lại giá bằng `buildQuote` của order-controller (cùng quy tắc với POST /api/order/quote).
 * Khách chưa đăng nhập vẫn giữ giỏ ở trình duyệt, đăng nhập xong gộp vào đây bằng POST /api/cart/merge.
 */
const cartController = new Elysia({
  tags: ["Cart Management"],
  prefix: "cart",
}) as unknown as AppMain;

export default cartController;

// **************************************************************************

type Db = Prisma.TransactionClient;

const CART_RULE =
  `One line per book, quantity 1 – ${MAX_ITEM_QUANTITY}, at most ${MAX_ORDER_ITEMS} different books. ` +
  "`bookId` (body or path) accepts a book **id or slug**; responses always use the book's id.";

// ---- Schemas ------------------------------------------------------------------------------

const quantitySchema = (description = `Integer 1 – ${MAX_ITEM_QUANTITY}.`) =>
  t.Number({
    multipleOf: 1,
    minimum: 1,
    maximum: MAX_ITEM_QUANTITY,
    description,
    error: `Quantity must be an integer from 1 to ${MAX_ITEM_QUANTITY}.`,
  });
const bookIdSchema = t.String({ minLength: 1, description: "Book id or slug.", error: "Book id is required." });

const cartLineSchema = t.Composite([
  quoteLineSchema,
  t.Object({
    addedAt: t.Date({ format: "date-time", description: "When the book was first added to the cart. Lines are sorted by it, oldest first." }),
  }),
]);

const cartSchema = t.Object({
  items: t.Array(cartLineSchema),
  totalQuantity: t.Number({ description: "Number of copies in the cart (all lines, including unavailable ones)." }),
  subtotal: t.Number(),
  discount: t.Number(),
  shippingFee: t.Number(),
  freeShipping: t.Boolean(),
  freeShipThreshold: t.Number(),
  total: t.Number(),
  canCheckout: t.Boolean({ description: "`true` when the cart is not empty and every line is available." }),
});

const cartResponse = (msgDescription: string) =>
  t.Object({ msg: t.String({ description: msgDescription }), cart: cartSchema });

const notInCartSchema = t.Object({ msg: t.String({ description: "`Book is not in the cart.`" }) });

const bookIdParams = t.Object({ bookId: t.String({ description: "Book id or slug." }) });

// ---- Helpers ------------------------------------------------------------------------------

/** Tìm sách theo id, không có thì theo slug (collation MySQL không phân biệt hoa thường). */
async function findBook(db: Db, key: string) {
  const k = key.trim();
  const select = { id: true, name: true, status: true } as const;
  return (
    (await db.book.findUnique({ where: { id: k }, select })) ??
    (await db.book.findFirst({ where: { slug: k }, select }))
  );
}

/** Giỏ của user kèm báo giá hiện tại. */
async function readCart(db: Db, userId: string) {
  const rows = await db.cartItem.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { bookId: true, quantity: true, createdAt: true },
  });
  const { quote } = await buildQuote(db, rows.map((r) => ({ bookId: r.bookId, quantity: r.quantity })));
  const addedAt = new Map(rows.map((r) => [r.bookId, r.createdAt]));
  return {
    ...quote,
    items: quote.items.map((l) => ({ ...l, addedAt: addedAt.get(l.bookId) ?? new Date() })),
    totalQuantity: rows.reduce((s, r) => s + r.quantity, 0),
  };
}

const getCart = (prisma: PrismaClient, userId: string) =>
  prisma.$transaction((tx) => readCart(tx, userId));

/** Thử lại một lần khi hai request cùng thêm một sách mới (trùng khoá `userId + bookId`). */
async function retryOnConflict<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    if ((e as PrismaClientKnownRequestError).code === "P2002") return fn();
    throw e;
  }
}

/** Dòng giỏ của user cho sách `key` (id hoặc slug), hoặc null. */
async function findCartLine(db: Db, userId: string, key: string) {
  const book = await findBook(db, key);
  if (!book) return null;
  return db.cartItem.findUnique({
    where: { userId_bookId: { userId, bookId: book.id } },
    select: { id: true, bookId: true, quantity: true },
  });
}

const notInCart = { msg: "Book is not in the cart." };

type AddResult = { status: 200 | 201 | 404 } | { status: 422; fields: Fields };

// ---- Routes -------------------------------------------------------------------------------

cartController
  .use(auth)
  .get("", ({ prisma, auth }) => getCart(prisma, auth!.id), {
    response: { 200: cartSchema, 401: msgSchema, 403: msgSchema },
    detail: {
      summary: "Get my cart",
      description:
        "The current user's cart with up-to-date prices and totals. An empty cart returns `items: []` and zero totals.\n\n" +
        CART_RULE + "\n\n" +
        "A book that became UNAVAILABLE stays in the cart with `available: false` and is excluded from the totals; " +
        "`canCheckout` is then `false` until it is removed.\n\n" +
        PRICING_RULE,
    },
  })
  .post(
    "/items",
    async ({ body, prisma, set, auth }) => {
      const userId = auth!.id;
      const quantity = body.quantity ?? 1;
      const result = await retryOnConflict(() =>
        prisma.$transaction(async (tx): Promise<AddResult> => {
          const book = await findBook(tx, body.bookId);
          if (!book) return { status: 404 };
          if (book.status !== $Enums.BookStatus.AVAILABLE) {
            return { status: 422, fields: { bookId: [`Book "${book.name}" is unavailable.`] } };
          }
          const line = await tx.cartItem.findUnique({
            where: { userId_bookId: { userId, bookId: book.id } },
            select: { id: true, quantity: true },
          });
          if (line) {
            if (line.quantity + quantity > MAX_ITEM_QUANTITY) {
              return {
                status: 422,
                fields: {
                  quantity: [
                    `The cart already has ${line.quantity} of "${book.name}"; at most ${MAX_ITEM_QUANTITY} copies per book.`,
                  ],
                },
              };
            }
            await tx.cartItem.update({ where: { id: line.id }, data: { quantity: line.quantity + quantity } });
            return { status: 200 };
          }
          if ((await tx.cartItem.count({ where: { userId } })) >= MAX_ORDER_ITEMS) {
            return {
              status: 422,
              fields: { bookId: [`The cart can hold at most ${MAX_ORDER_ITEMS} different books.`] },
            };
          }
          await tx.cartItem.create({ data: { userId, bookId: book.id, quantity } });
          return { status: 201 };
        })
      );
      if (result.status === 404) {
        set.status = 404;
        return { msg: "Book not found." };
      }
      if (result.status === 422) return invalid(set, result.fields);
      set.status = result.status;
      return { msg: "Added to cart.", cart: await getCart(prisma, userId) };
    },
    {
      body: t.Object({
        bookId: bookIdSchema,
        quantity: t.Optional(quantitySchema(`Copies to add, integer 1 – ${MAX_ITEM_QUANTITY}. Default 1.`)),
      }),
      response: {
        200: cartResponse("`Added to cart.` — the book was already in the cart; its quantity was increased."),
        201: cartResponse("`Added to cart.` — a new line was created."),
        401: msgSchema,
        403: msgSchema,
        404: t.Object({ msg: t.String({ description: "`Book not found.`" }) }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String()), {
            description:
              "`bookId`: the book is UNAVAILABLE, or the cart already has 50 different books. " +
              "`quantity`: not an integer 1 – 99, or the quantity in the cart would go over 99.",
          }),
        }),
      },
      detail: {
        summary: "Add a book to my cart",
        description:
          "Add `quantity` copies (default 1) of a book. A book already in the cart has its quantity **increased** (200); " +
          "a new book creates a line (201). Returns the whole cart.\n\n" +
          CART_RULE + "\n\n" +
          "- Book not found → **404** `Book not found.`\n" +
          "- Book UNAVAILABLE → **422** `fields.bookId`.\n" +
          "- Quantity in the cart would exceed 99 → **422** `fields.quantity` (nothing is changed).\n" +
          "- 50 different books already in the cart → **422** `fields.bookId`.",
      },
    }
  )
  .put(
    "/items/:bookId",
    async ({ params, body, prisma, set, auth }) => {
      const userId = auth!.id;
      const line = await prisma.$transaction((tx) => findCartLine(tx, userId, params.bookId));
      if (!line) {
        set.status = 404;
        return notInCart;
      }
      await prisma.cartItem.update({ where: { id: line.id }, data: { quantity: body.quantity } });
      return { msg: "Cart updated.", cart: await getCart(prisma, userId) };
    },
    {
      params: bookIdParams,
      body: t.Object({ quantity: quantitySchema(`New quantity (replaces the current one), integer 1 – ${MAX_ITEM_QUANTITY}.`) }),
      response: {
        200: cartResponse("`Cart updated.`"),
        401: msgSchema,
        403: msgSchema,
        404: notInCartSchema,
        422: validationSchema,
      },
      detail: {
        summary: "Change quantity in my cart",
        description:
          "Set the quantity of a book that is already in the cart (allowed even if the book became UNAVAILABLE). " +
          "To remove a book use DELETE; quantity 0 is rejected (**422**).\n\n" +
          "- Book not in the cart (or not found) → **404** `Book is not in the cart.`",
      },
    }
  )
  .delete(
    "/items/:bookId",
    async ({ params, prisma, set, auth }) => {
      const userId = auth!.id;
      const line = await prisma.$transaction((tx) => findCartLine(tx, userId, params.bookId));
      if (!line) {
        set.status = 404;
        return notInCart;
      }
      await prisma.cartItem.deleteMany({ where: { id: line.id } });
      return { msg: "Removed from cart.", cart: await getCart(prisma, userId) };
    },
    {
      params: bookIdParams,
      response: {
        200: cartResponse("`Removed from cart.`"),
        401: msgSchema,
        403: msgSchema,
        404: notInCartSchema,
      },
      detail: {
        summary: "Remove a book from my cart",
        description: "Remove one book from the cart and return the cart. Book not in the cart → **404** `Book is not in the cart.`",
      },
    }
  )
  .delete(
    "",
    async ({ prisma, auth }) => {
      const userId = auth!.id;
      await prisma.cartItem.deleteMany({ where: { userId } });
      return { msg: "Cart cleared.", cart: await getCart(prisma, userId) };
    },
    {
      response: { 200: cartResponse("`Cart cleared.`"), 401: msgSchema, 403: msgSchema },
      detail: {
        summary: "Clear my cart",
        description: "Remove every book from the cart. Clearing an empty cart also returns 200.",
      },
    }
  )
  .post(
    "/merge",
    async ({ body, prisma, auth }) => {
      const userId = auth!.id;
      const skipped: { bookId: string; reason: string }[] = [];
      await retryOnConflict(() =>
        prisma.$transaction(async (tx) => {
          skipped.length = 0;
          const rows = await tx.cartItem.findMany({ where: { userId }, select: { bookId: true, quantity: true } });
          const current = new Map(rows.map((r) => [r.bookId, r.quantity]));
          const changed = new Map<string, number>();
          for (const item of body.items) {
            const book = await findBook(tx, item.bookId);
            if (!book) {
              skipped.push({ bookId: item.bookId, reason: "Book not found." });
              continue;
            }
            if (book.status !== $Enums.BookStatus.AVAILABLE) {
              skipped.push({ bookId: book.id, reason: "Book is unavailable." });
              continue;
            }
            const cur = current.get(book.id);
            if (cur === undefined && current.size >= MAX_ORDER_ITEMS) {
              skipped.push({ bookId: book.id, reason: `The cart can hold at most ${MAX_ORDER_ITEMS} different books.` });
              continue;
            }
            const next = Math.min((cur ?? 0) + item.quantity, MAX_ITEM_QUANTITY);
            current.set(book.id, next);
            changed.set(book.id, next);
          }
          for (const [bookId, quantity] of changed) {
            await tx.cartItem.upsert({
              where: { userId_bookId: { userId, bookId } },
              update: { quantity },
              create: { userId, bookId, quantity },
            });
          }
        })
      );
      return { msg: "Cart merged.", cart: await getCart(prisma, userId), skipped };
    },
    {
      body: t.Object({
        items: t.Array(t.Object({ bookId: bookIdSchema, quantity: quantitySchema() }), {
          maxItems: MAX_ORDER_ITEMS,
          description: `Guest cart lines from the browser, 0 – ${MAX_ORDER_ITEMS}. An empty array just returns the cart.`,
          error: `Items must contain at most ${MAX_ORDER_ITEMS} lines.`,
        }),
      }),
      response: {
        200: t.Object({
          msg: t.String({ description: "`Cart merged.`" }),
          cart: cartSchema,
          skipped: t.Array(
            t.Object({
              bookId: t.String({ description: "Book id, or the value sent when the book was not found." }),
              reason: t.String({ description: "`Book not found.`, `Book is unavailable.` or `The cart can hold at most 50 different books.`" }),
            }),
            { description: "Lines that were not added." }
          ),
        }),
        401: msgSchema,
        403: msgSchema,
        422: validationSchema,
      },
      detail: {
        summary: "Merge a guest cart into my cart",
        description:
          "Call once right after signing in to move the browser (guest) cart into the server cart. " +
          "Quantities of the same book are **added up and capped at 99** (no error). " +
          "Books that are not found, UNAVAILABLE, or would exceed 50 different books are **skipped** and listed in `skipped`; the rest is still merged.\n\n" +
          CART_RULE,
      },
    }
  );
