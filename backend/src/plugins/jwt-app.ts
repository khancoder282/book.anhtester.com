import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const jwtHandle = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET || "secret-key",
        exp: Bun.env.EXPTOKEN || "30m",
      })
    )
