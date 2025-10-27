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
  .onError(async ({ code, error }) => {
    console.error(error);
    if (code === "VALIDATION") {
      return {
        msg: "Invalid data.",
        fields: error.all.reduce((acc, cur) => {
          const { path, summary } = cur as {
            path: string;
            summary: string;
            message: string;
          };
          const key = path.replace("/", "");
          if (!acc[key]) acc[key] = [];
          acc[key].push(summary);
          return acc;
        }, {} as Record<string, string[]>),
      };
    }
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
  .post("/api/status", async ({ set, body: { code, msg } }) => {
    set.status = code
    return { msg }
  }, {
    body: t.Object({
      code: t.Number(),
      msg: t.String()
    }),
    detail: {
      security: [],
    }
  })
  .listen(Bun.env.PORT || 4544, () => {
    console.log(
      `🦕 Elysia is running at http://localhost:${Bun.env.PORT || 4544}`
    );
  });
