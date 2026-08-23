import { Elysia, file, t } from "elysia";
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

new Elysia()
  .onRequest(({ request }) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith("/api")) {
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
        const { path, summary, message } = cur as {
          path?: string;
          summary?: string;
          message?: string;
        };
        const key = (path ?? "").replace("/", "") || "_";
        if (!acc[key]) acc[key] = [];
        acc[key].push(summary ?? message ?? "Invalid value.");
        return acc;
      }, {} as Record<string, string[]>);
      console.error(`[VALIDATION] ${JSON.stringify(fields)}`);
      set.status = 422;
      return { msg: "Invalid data.", fields };
    }
    console.error(code, error instanceof Error ? error.message : error);
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
  .get("/view-file/*", ({ params, set }) => {
    const p = (path.join(process.cwd(), Bun.env.FILEDIR || "upload", decodeURIComponent(params["*"])))
    if (fs.existsSync(p)) {
      return file(p)
    } else {
      set.status = 404;
      return {
        msg: "File not found."
      }
    }
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
    const p = path.join(process.cwd(), "public", "assets", decodeURIComponent(params["*"]))
    if (fs.existsSync(p)) {
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
      code: t.Number(),
      msg: t.String(),
      time: t.Optional(t.Number()),
    }),
    detail: {
      security: [],
      description: "Set status code.",
      tags: ["System"]
    }
  })
  .listen(Bun.env.PORT || 4544, () => {
    console.log(
      `🦕 Elysia is running at http://localhost:${Bun.env.PORT || 4544}`
    );
  });
