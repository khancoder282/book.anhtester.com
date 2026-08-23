import Elysia, { t } from "elysia";
import dayjs from "dayjs";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import { auth } from "../plugins/auth";
import { User } from "../prisma";

const authController = new Elysia({
  tags: ["Authentication Management"],
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
          fields: {
            email: ["Email not found, please register."],
          }
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

      set.status = 400;
      return {
        msg: "Invalid password.",
        fields: {
          password: ["Invalid password, please try again."],
        }
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email", default: "user@example.com" }),
        password: t.String(),
      }),
      response: {
        200: t.Object({
          msg: t.String(),
          accessToken: t.String(),
          exp: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        403: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        security: [],
        description: "Login to access the system.",
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
            address: body.address ?? "",
            avatarUrl: body.avatarUrl ?? "",
            password: await Bun.password.hash(body.password),
          },
        });
        set.status = 201;
        return {
          msg: "Register successfully.",
        };
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            set.status = 422;
            return {
              msg: "Email already exists.",
              fields: {
                email: ["Email already exists."],
              }
            };
          }
        }
        set.status = 400
        return {
          msg: "Invalid data."
        }
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email", default: "user@example.com" }),
        password: t.String(),
        avatarUrl: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
      response: {
        201: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        security: [],
        description: "Register new user account.",
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
        set.status = 404;
        return {
          msg: "Invalid token.",
        };
      }

      return {
        msg: "Refetch token successfully.",
        accessToken: await jwt.sign({ id: user.userId }),
        exp: Bun.env.EXPTOKEN || "30m",
      };
    },
    {
      response: {
        200: t.Object({
          msg: t.String(),
          accessToken: t.String(),
          exp: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
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
        description: "Refresh token to get new access token.",
      },
    }
  )
  .use(auth)
  .patch(
    "/profile",
    async ({ prisma, body, set, cookie: { refetchToken, accessToken }, auth: user }) => {
      // Check if user exists
      if (!user || !user.id) {
        set.status = 400;
        return { msg: 'Unauthorized. User not authenticated.' };
      }

      try {
        const data: Partial<User> = {
          email: body.email,
          name: body.name,
          avatarUrl: body.avatarUrl,
          phone: body.phone,
          address: body.address,
        }
        // Check old password when updating new password
        if (body.password) {
          if (!body.password_old) {
            set.status = 400;
            return { msg: 'Old password is required when updating password.' };
          }
          if (!user.password || !(await Bun.password.verify(body.password_old, user.password))) {
            set.status = 400;
            return { msg: 'Old password is incorrect.' };
          }
          // Hash new password
          data.password = await Bun.password.hash(body.password);
        }

        // Revoke tokens only if email or password has changed
        const shouldRevokeTokens = (body.email && user.email !== body.email) || body.password;
        if (shouldRevokeTokens) {
          await prisma.userRefreshToken.updateMany({
            where: {
              userId: user.id,
              revoked: false,
            },
            data: {
              revoked: true,
            },
          });
          // Remove tokens if they exist
          refetchToken?.remove();
          accessToken?.remove();
        }

        // Update user information
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...data,
            config: body.config
          }
        });

        set.status = 200;
        return { msg: 'Updated profile successfully.' };
      } catch (err) {
        // Handle Prisma errors
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            set.status = 400;
            return { msg: 'Email is already in use.' };
          }
          if (err.code === 'P2005') {
            set.status = 404;
            return { msg: 'User not found.' };
          }
        }
        // Handle general errors
        set.status = 400;
        return { msg: 'Invalid data.' };
      }
    },
    {
      body: t.Partial(
        t.Object({
          name: t.String(),
          email: t.String({ format: "email", default: "user@example.com" }),
          password: t.String(),
          password_old: t.String(),
          avatarUrl: t.String(),
          phone: t.Optional(t.String()),
          address: t.Optional(t.String()),
          config: t.Optional(t.Any()),
        })
      ),
      response: {
        200: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
        401: t.Object({
          msg: t.String(),
        }),
        403: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        description: "Update user profile.",
      },
    }
  )
  .get("/me", async ({ auth: user }) => ({
    id: user!.id,
    name: user!.name,
    email: user!.email,
    avatarUrl: user!.avatarUrl,
    phone: user!.phone,
    address: user!.address,
    config: user!.config,
  }), {
    response: {
      200: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String(),
        avatarUrl: t.String(),
        phone: t.String(),
        address: t.String(),
        config: t.Optional(t.Any()),
      }),
      401: t.Object({
        msg: t.String(),
      }),
      403: t.Object({
        msg: t.String(),
      }),
      404: t.Object({
        msg: t.String(),
      }),
      422: t.Object({
        msg: t.String(),
        fields: t.Record(t.String(), t.Array(t.String())),
      }),
    },
    detail: {
      description: "Get current user information.",
    },
  })
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
    },
    {
      cookie: t.Cookie({
        refetchToken: t.Optional(t.String()),
        accessToken: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          msg: t.String(),
        }),
        401: t.Object({

        }),
        403: t.Object({
          msg: t.String(),
        }),
        404: t.Object({
          msg: t.String(),
        }),
        400: t.Object({
          msg: t.String(),
        }),
        422: t.Object({
          msg: t.String(),
          fields: t.Record(t.String(), t.Array(t.String())),
        }),
      },
      detail: {
        description: "Logout from the system",
      }
    }
  );
