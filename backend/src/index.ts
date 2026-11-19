import { Elysia, file, t, validationDetail } from "elysia";
import { regis } from "./regis";
import { staticPlugin } from "@elysiajs/static";
import authController from "./routers/auth-controller";
import userController from "./routers/user-controller";
import fileController from "./routers/file-controller";
import bookController from "./routers/book-controller";
import categoryController from "./routers/category-controller";
import promotionController from "./routers/promotion-controller";
import path from "path";
import dayjs from "dayjs";
import { addressController } from "./routers/address-controller";
import fs from "fs";
import databaseController from "./routers/database-controller";
import { UPLOAD_ROOT, resolveInside, resolveUpload, serveFile } from "./utils/upload-security";

const ASSETS_ROOT = path.resolve(process.cwd(), "public", "assets");

/** Tối đa số giây POST /api/status được chờ (tránh giữ kết nối quá lâu). */
const MAX_STATUS_DELAY = 30;

/** Giải mã URL đúng 1 lần; chuỗi % hỏng (VD "%E0%A4%A") trả null. */
const decodeOnce = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
};

/**
 * CORS cho `/api/*` (2026-11-20): trang Swagger mở ở origin khác server đang chọn (VD `localhost:3039/swagger`
 * qua proxy Vite, hoặc trang production gọi `localhost:4566`) bị trình duyệt chặn ở preflight → "Failed to fetch".
 * `Allow-Origin: *` nên trình duyệt KHÔNG gửi cookie cross-origin: cookie `refetchToken` không lộ cho site khác,
 * gọi API bằng header `Authorization: Bearer` vẫn chạy.
 */
function corsHeaders(request: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      request.headers.get("access-control-request-headers") ?? "Content-Type, Authorization, Accept",
    "Access-Control-Max-Age": "600",
  };
}

new Elysia()
  .onRequest(({ request, set }) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith("/api")) {
      Object.assign(set.headers, corsHeaders(request));
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }
      console.log(`[${dayjs().format("DD/MM/YYYY HH:mm:ss")}] ${request.method.padEnd(6)}: ${url.pathname} `);
    }
  })
  .onAfterResponse(({ responseValue }) => {
    if (responseValue instanceof Response && responseValue.status > 300) {
      console.log(responseValue)
    }
  })
  .onError(async ({ code, error, set }) => {
    if (code === "VALIDATION") {
      // NOTE: don't log the raw error object here. Elysia's ValidationError
      // builds its message lazily via TypeBox Value.Create(), which throws
      // "String types with formats must specify a default value" for any
      // formatted string schema without a `default`.
      const fields = (error.all ?? []).reduce((acc, cur) => {
        const { path, summary, message, schema } = cur as {
          path?: string;
          summary?: string;
          message?: string;
          schema?: { error?: unknown };
        };
        // Thông báo riêng khai trong schema (`error: "..."` hoặc `error: validationDetail("...")`)
        // được ưu tiên hơn câu mặc định của TypeBox
        let custom: string | undefined;
        if (typeof schema?.error === "string") custom = schema.error;
        else if (typeof schema?.error === "function") {
          try {
            const out = (schema.error as (e: unknown) => unknown)(cur);
            if (typeof out === "string") custom = out;
            else if (out && typeof (out as { message?: unknown }).message === "string")
              custom = (out as { message: string }).message;
          } catch {
            // bỏ qua, dùng câu mặc định
          }
        }
        const key = (path ?? "").replace("/", "") || "_";
        if (!acc[key]) acc[key] = [];
        const text = custom ?? summary ?? message ?? "Invalid value.";
        if (!acc[key].includes(text)) acc[key].push(text);
        return acc;
      }, {} as Record<string, string[]>);
      console.error(`[VALIDATION] ${JSON.stringify(fields)}`);
      set.status = 422;
      return { msg: "Invalid data.", fields };
    }
    // Các lỗi khác: không trả lỗi thô (đường dẫn tuyệt đối, stack, trang lỗi của Bun) ra client
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { msg: "Not found." };
    }
    if (code === "PARSE") {
      set.status = 400;
      return { msg: "Invalid request body." };
    }
    console.error(code, error instanceof Error ? error.message : error);
    const status = (error as { status?: unknown })?.status;
    set.status = typeof status === "number" && status >= 400 && status <= 599 ? status : 500;
    return { msg: set.status === 500 ? "Internal server error." : "Request failed." };
  })
  .use(regis)
  .group("/api", (app) =>
    app
      .use(authController)
      .use(categoryController)
      .use(userController)
      .use(fileController)
      .use(bookController)
      .use(promotionController)
      .use(addressController)
      .use(databaseController)
  )
  // Xem / tải file đã upload. Công khai (ảnh bìa sách, avatar) nhưng CHỈ trong thư mục upload.
  // params["*"] của Elysia chưa giải mã URL (kể cả %2F, %2E) nên giải mã đúng 1 lần ở đây,
  // rồi resolveUpload() chặn "..", đường dẫn tuyệt đối, ổ đĩa Windows, backslash.
  .get("/view-file/*", ({ params, set }) => {
    const rel = decodeOnce(params["*"]);
    const p = rel === null ? null : resolveUpload(rel);
    if (!p || p === UPLOAD_ROOT) {
      set.status = 400;
      return { msg: "Invalid path." };
    }
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
      set.status = 404;
      return {
        msg: "File not found."
      }
    }
    // Content-Type theo đuôi, nosniff, CSP sandbox, attachment cho mọi loại không phải ảnh raster
    return serveFile(p);
  }
    , {
      params: t.Object({
        "*": t.String()
      }),
      detail: {
        hide: true
      }
    })
  .get("/assets/*", ({ params, set }) => {
    const rel = decodeOnce(params["*"]);
    const p = rel === null ? null : resolveInside(ASSETS_ROOT, rel);
    if (p && p !== ASSETS_ROOT && fs.existsSync(p) && fs.statSync(p).isFile()) {
      return file(p)
    }
    set.status = 404
    return {
      msg: "File not found."
    }
  }, {
    params: t.Object({
      "*": t.String()
    }),
    detail: {
      hide: true
    }
  }).get("/*", () => file(path.join(process.cwd(), "public/index.html")), {
    detail: {
      hide: true
    }
  })
  .post("/api/status", async ({ set, body: { code, msg, time } }) => {
    set.status = code
    if (time) {
      await new Promise((resolve) => setTimeout(resolve, time * 1000))
    }
    return { msg }
  }, {
    body: t.Object({
      // Bun chỉ cho phép status 101 hoặc 200-599 cho response cuối; 1xx khác làm server lỗi 500
      code: t.Integer({
        minimum: 200,
        maximum: 599,
        description: "HTTP status code to return: an integer from 200 to 599.",
        error: validationDetail("Code must be an integer HTTP status code from 200 to 599."),
      }),
      msg: t.String({
        maxLength: 500,
        description: "Message returned in the body as { msg }. At most 500 characters.",
        error: validationDetail("Msg must be a string of at most 500 characters."),
      }),
      time: t.Optional(t.Number({
        minimum: 0,
        maximum: MAX_STATUS_DELAY,
        description: `Seconds to wait before responding: 0 to ${MAX_STATUS_DELAY}.`,
        error: validationDetail(`Time must be a number of seconds from 0 to ${MAX_STATUS_DELAY}.`),
      })),
    }),
    response: {
      // Mọi status 200-599 trả { msg } (riêng 204, 205, 304 không có body theo chuẩn HTTP)
      200: t.Object({ msg: t.String() }),
      422: t.Object({
        msg: t.String(),
        fields: t.Record(t.String(), t.Array(t.String())),
      }),
    },
    detail: {
      security: [],
      description: `Return the given status code with body { msg } after waiting "time" seconds, to simulate errors and slow responses. Limits: code is an integer 200-599, time is 0-${MAX_STATUS_DELAY} seconds, msg is at most 500 characters; anything else returns 422.`,
      tags: ["System"]
    }
  })
  .listen(Bun.env.PORT || 4544, () => {
    console.log(
      `🦕 Elysia is running at http://localhost:${Bun.env.PORT || 4544}`
    );
  });
