import Elysia, { t } from "elysia";
import dayjs from "dayjs";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";

const authController = new Elysia({
  tags: ["Auth management"],
}) as AppMain;

export default authController;

// ***************************************************************************

authController
  .post(
    "/login",
    async ({
      body,
      prisma,
      set,
      jwt,
      cookie: { refetchToken, accessToken },
      headers,
    }) => {
      const { email, password } = body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        set.status = 404;
        return {
          msg: "User not found.",
        };
      }

      if (!user.isActive) {
        set.status = 403;
        return {
          msg: "User account is disabled.",
        };
      }

      if (await Bun.password.verify(password, user.password)) {
        const token = await jwt.sign({ id: user.id, jit: Bun.randomUUIDv7() });
        // cơ chế accesstoken refetch
        const deviceInfo = JSON.stringify({
          userAgent: headers["user-agent"] || "unknown",
          platform: headers["sec-ch-ua-platform"] || "unknown",
        });
        const ipAddress =
          headers["x-forwarded-for"]?.split(",")[0] || "unknown";
        const userRefreshToken = await prisma.userRefreshToken.create({
          data: {
            tokenHash: await Bun.password.hash(token),
            userId: user.id,
            expiresAt: dayjs().add(7, "day").toDate(),
            deviceInfo,
            ipAddress,
          },
        });

        refetchToken.value = userRefreshToken.tokenHash;
        refetchToken.maxAge = dayjs(userRefreshToken.expiresAt).unix();
        refetchToken.httpOnly = true;
        refetchToken.secure = true;
        refetchToken.sameSite = "strict";

        accessToken.value = token;

        return {
          msg: "Login successfully.",
          accessToken: token,
          exp: Bun.env.EXPTOKEN || "30m",
        };
      }

      set.status = 401;
      return {
        msg: "Invalid password.",
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: {
        security: [],
      },
      cookie: t.Cookie({
        refetchToken: t.Optional(t.String()),
        accessToken: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/register",
    async ({ body, prisma, set }) => {
      try {
        await prisma.user.create({
          data: {
            ...body,
            password: await Bun.password.hash(body.password),
          },
        });
        return {
          msg: "Register successfully.",
        };
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            set.status = 400;
            return {
              msg: "Email already exists.",
            };
          }
        }
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        password: t.String(),
        avatarUrl: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
      detail: {
        security: [],
      },
    }
  )
  .post(
    "/refetch-token",
    async ({ cookie: { refetchToken }, prisma, set, jwt, headers }) => {
      const deviceInfo = JSON.stringify({
        userAgent: headers["user-agent"] || "unknown",
        platform: headers["sec-ch-ua-platform"] || "unknown",
      });
      const ipAddress = headers["x-forwarded-for"]?.split(",")[0] || "unknown";
      const user = await prisma.userRefreshToken.findUnique({
        where: {
          tokenHash: refetchToken.value,
          expiresAt: {
            gt: dayjs().toDate(),
          },
          deviceInfo,
          ipAddress,
        },
        select: {
          userId: true,
        },
      });

      if (!user) {
        set.status = 401;
        return {
          msg: "Invalid token.",
        };
      }

      return {
        msg: "Refetch token successfully.",
        assessToken: await jwt.sign({ id: user.userId }),
        exp: Bun.env.EXPTOKEN || "30m",
      };
    },
    {
      cookie: t.Cookie(
        {
          refetchToken: t.String(),
        },
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        }
      ),
      detail: {
        security: [],
      },
    }
  )
  .use(auth)
  .patch(
    "/profile",
    async ({ prisma, body, set, cookie: { refetchToken }, auth: user }) => {
      try {
        await prisma.$transaction(async (ctx) => {

          if (body.email || body.password) {
            await ctx.userRefreshToken.updateMany({
              where: {
                userId: user?.id,
                revoked: false,
              },
              data: {
                revoked: true,
              },
            });
          }

          if (body.password) {
            if (await Bun.password.verify(body.password_old ?? "", user!.password!)) {
              set.status = 400;
              return {
                msg: "Old password is incorrect.",
              }
            }
            body.password = await Bun.password.hash(body.password);
          }
          await ctx.user.update({
            where: {
              id: user?.id,
            },
            data: body,
          });
          await ctx.userRefreshToken.updateMany({
            where: {
              userId: user?.id,
              revoked: false,
            },
            data: {
              revoked: true,
            },
          });
        });
        refetchToken.remove();
        set.status = 200;
        return {
          msg: `Updated ${Object.keys(body)
            .map((key) => `'${key}'`)
            .join(", ")} successfully.`,
        };
      } catch (err) {
        const e = err as PrismaClientKnownRequestError;
        set.status = 400;
        if (e.code === "P2005") {
          set.status = 404;
          refetchToken.remove();
          return {
            msg: "User not found.",
          };
        }
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: t.Partial(
        t.Object({
          name: t.String(),
          email: t.String({ format: "email" }),
          password: t.String(),
          password_old: t.String(),
          avatarUrl: t.String(),
          phone: t.Optional(t.String()),
          address: t.Optional(t.String()),
        })
      ),
    }
  )
  .get("/me", async ({ auth: user }) => ({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
    phone: user?.phone,
    address: user?.address,
  }))
  .delete(
    "/logout",
    async ({ cookie: { refetchToken, accessToken }, prisma, set }) => {
      try {
        await prisma.userRefreshToken.updateMany({
          where: {
            tokenHash: refetchToken.value as string,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });
        refetchToken.remove();
        accessToken.remove();
        return {
          msg: "Logout successfully.",
        };
      } catch (err) {
        const e = err as PrismaClientKnownRequestError;
        if (e.code === "P2025") {
          set.status = 404;
          return {
            msg: "User not found.",
          };
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    }
  );
