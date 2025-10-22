import { Elysia, file } from "elysia";
import authController from "./routers/auth-controller";
import { regis } from "./regis";
import userController from "./routers/user-controller";
import fileController from "./routers/file-controller";
import bookController from "./routers/book-controller";
import categoryController from "./routers/category-controller";
import promotionController from "./routers/promotion-controller";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import { cors } from "@elysiajs/cors";

new Elysia()
  .use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }))
  .onError(async ({ code, error }) => {
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
  ).use(staticPlugin({
    assets: path.join(process.cwd(), "public/assets"),
    prefix: "/assets"
  }))
  .get("/*", () => file(path.join(process.cwd(), "public/index.html")), {
    detail: {
      hide: true
    }
  })

  .listen(Bun.env.PORT || 4544, () => {
    console.log(
      `🦕 Elysia is running at http://localhost:${Bun.env.PORT || 4544}`
    );
  });
