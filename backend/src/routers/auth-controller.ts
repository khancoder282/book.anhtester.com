import Elysia, { t } from "elysia";
import dayjs from "dayjs";
import { AppMain } from "../regis";
import { PrismaClientKnownRequestError } from "../prisma/runtime/library";
import {
  auth,
  AuthUser,
  hashRefreshToken,
  newRefreshToken,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  REFRESH_TOKEN_DAYS,
  REFRESH_TOKEN_MAX_AGE,
  validateUserInput,
} from "../plugins/auth";
import { User } from "../prisma";

const authController = new Elysia({
  tags: ["Authentication Management"],
}) as AppMain;

export default authController;

// ***************************************************************************

/** Lỗi chung: `fields` chỉ có ở lỗi gắn với từng trường. */
const errorSchema = t.Object({
  msg: t.String(),
  fields: t.Optional(t.Record(t.String(), t.Array(t.String()))),
});
const msgSchema = t.Object({ msg: t.String() });

const INVALID_LOGIN = "Invalid email or password.";

// Hash giả để login với email không tồn tại cũng tốn thời gian như sai mật khẩu
const dummyPasswordHash = Bun.password.hash("dummy-password-for-timing");

const nameSchema = t.String({
  minLength: 1,
  maxLength: NAME_MAX_LENGTH,
  description: "Must not be empty or whitespace only (trimmed before saving).",
});
const emailSchema = t.String({
  format: "email",
  maxLength: 191,
  examples: ["user@example.com"],
});

function clientInfo(headers: Record<string, string | undefined>) {
  return {
    deviceInfo: JSON.stringify({
      userAgent: headers["user-agent"] || "unknown",
      platform: headers["sec-ch-ua-platform"] || "unknown",
    }),
    ipAddress: headers["x-forwarded-for"]?.split(",")[0] || "unknown",
  };
}

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

      // Sai email hay sai mật khẩu đều trả cùng một thông báo (không lộ email nào tồn tại)
      const passwordOk = user
        ? await Bun.password.verify(password, user.password)
        : (await Bun.password.verify(password, await dummyPasswordHash), false);

      if (!user || !passwordOk) {
        set.status = 401;
        return {
          msg: INVALID_LOGIN,
          fields: {
            email: [INVALID_LOGIN],
            password: [INVALID_LOGIN],
          },
        };
      }

      // Trạng thái khoá chỉ báo khi mật khẩu đã đúng
      if (!user.isActive) {
        set.status = 403;
        return {
          msg: "User account is disabled.",
        };
      }

      const refreshToken = newRefreshToken();
      const session = await prisma.userRefreshToken.create({
        data: {
          tokenHash: hashRefreshToken(refreshToken),
          userId: user.id,
          expiresAt: dayjs().add(REFRESH_TOKEN_DAYS, "day").toDate(),
          ...clientInfo(headers),
        },
      });
      const token = await jwt.sign({ id: user.id, sid: session.id });

      refetchToken.value = refreshToken;
      refetchToken.maxAge = REFRESH_TOKEN_MAX_AGE;
      refetchToken.httpOnly = true;
      refetchToken.secure = true;
      refetchToken.sameSite = "strict";

      accessToken.value = token;

      return {
        msg: "Login successfully.",
        accessToken: token,
        exp: Bun.env.EXPTOKEN || "30m",
      };
    },
    {
      body: t.Object({
        email: emailSchema,
        password: t.String(),
      }),
      response: {
        200: t.Object({
          msg: t.String(),
          accessToken: t.String(),
          exp: t.String(),
        }),
        401: errorSchema,
        403: msgSchema,
        422: errorSchema,
      },
      detail: {
        security: [],
        description:
          "Login to access the system. Wrong email and wrong password both return the same 401 \"Invalid email or password.\". " +
          "A disabled account returns 403 only when the password is correct. " +
          "Sets cookie `refetchToken` (HttpOnly, Max-Age 7 days = 604800s) used by `/refetch-token`.",
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
      const fields = validateUserInput(body, { passwordRequired: true });
      if (fields) {
        set.status = 422;
        return { msg: "Invalid data.", fields };
      }
      try {
        await prisma.user.create({
          data: {
            ...body,
            name: body.name.trim(),
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
              },
            };
          }
        }
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
    },
    {
      body: t.Object({
        name: nameSchema,
        email: emailSchema,
        password: t.String({ minLength: PASSWORD_MIN_LENGTH }),
        avatarUrl: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
      response: {
        201: msgSchema,
        400: errorSchema,
        422: errorSchema,
      },
      detail: {
        security: [],
        description:
          "Register new user account. `name` must not be blank, `password` at least 6 characters. " +
          "Validation errors and duplicated email return 422 with `fields`.",
      },
    }
  )
  .post(
    "/refetch-token",
    async ({ cookie: { refetchToken }, prisma, set, jwt, headers }) => {
      const session = await prisma.userRefreshToken.findFirst({
        where: {
          tokenHash: hashRefreshToken(refetchToken.value),
          revoked: false,
          expiresAt: {
            gt: dayjs().toDate(),
          },
          ...clientInfo(headers),
        },
        select: {
          id: true,
          userId: true,
          user: { select: { isActive: true } },
        },
      });

      if (!session) {
        set.status = 404;
        return {
          msg: "Invalid token.",
        };
      }

      if (!session.user.isActive) {
        set.status = 403;
        return {
          msg: "User account is disabled.",
        };
      }

      return {
        msg: "Refetch token successfully.",
        accessToken: await jwt.sign({ id: session.userId, sid: session.id }),
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
        403: msgSchema,
        404: msgSchema,
        422: errorSchema,
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
        description:
          "Refresh token to get new access token. Reads cookie `refetchToken` set by `/login`. " +
          "Returns 404 \"Invalid token.\" when the refresh token is unknown, expired, revoked (after logout / password or email change) " +
          "or used from another device; 403 when the account is disabled; 422 when the cookie is missing.",
      },
    }
  )
  .use(auth)
  .patch(
    "/profile",
    async ({
      prisma,
      body,
      set,
      cookie: { refetchToken, accessToken },
      auth: user,
    }) => {
      if (!user || !user.id) {
        set.status = 401;
        return { msg: "Unauthorized. User not authenticated." };
      }

      const fields = validateUserInput(body);
      if (fields) {
        set.status = 422;
        return { msg: "Invalid data.", fields };
      }

      // Chỉ cập nhật trường client thật sự gửi
      const data: Partial<User> = {};
      if (body.name !== undefined) data.name = body.name.trim();
      if (body.email !== undefined) data.email = body.email;
      if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
      if (body.phone !== undefined) data.phone = body.phone;
      if (body.address !== undefined) data.address = body.address;

      if (body.password) {
        if (!body.password_old) {
          set.status = 400;
          return { msg: "Old password is required when updating password." };
        }
        if (!(await Bun.password.verify(body.password_old, user.password))) {
          set.status = 400;
          return { msg: "Old password is incorrect." };
        }
        data.password = await Bun.password.hash(body.password);
      }

      // Đổi email hoặc mật khẩu thì thu hồi mọi phiên (refresh token + access token)
      const shouldRevokeTokens =
        (body.email !== undefined && body.email !== user.email) ||
        !!body.password;

      try {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: {
              ...data,
              ...(body.config !== undefined && { config: body.config }),
            },
          });
          if (shouldRevokeTokens) {
            await tx.userRefreshToken.updateMany({
              where: { userId: user.id, revoked: false },
              data: { revoked: true },
            });
          }
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            set.status = 422;
            return {
              msg: "Email is already in use.",
              fields: { email: ["Email is already in use."] },
            };
          }
          if (err.code === "P2025") {
            set.status = 404;
            return { msg: "User not found." };
          }
        }
        set.status = 400;
        return { msg: "Invalid data." };
      }

      if (shouldRevokeTokens) {
        refetchToken?.remove();
        accessToken?.remove();
      }

      set.status = 200;
      return {
        msg: "Updated profile successfully.",
        requireLogin: shouldRevokeTokens,
      };
    },
    {
      body: t.Partial(
        t.Object({
          name: nameSchema,
          email: emailSchema,
          password: t.String({
            description: `New password, at least ${PASSWORD_MIN_LENGTH} characters. Requires \`password_old\`. Empty string = keep current password.`,
          }),
          password_old: t.String(),
          avatarUrl: t.String(),
          phone: t.String(),
          address: t.String(),
          config: t.Any(),
        })
      ),
      response: {
        200: t.Object({
          msg: t.String(),
          requireLogin: t.Boolean({
            description:
              "true when email or password changed: every session of the user was revoked, the current access token no longer works and the user must login again.",
          }),
        }),
        400: errorSchema,
        401: msgSchema,
        403: msgSchema,
        404: msgSchema,
        422: errorSchema,
      },
      detail: {
        description:
          "Update the profile of the current user. Only fields sent in the body are updated. " +
          "Changing password requires `password_old` (400 when missing or wrong). " +
          "Changing email or password revokes every session (refresh tokens and access tokens) and returns `requireLogin: true`. " +
          "Blank name, short password or duplicated email return 422 with `fields`.",
      },
    }
  )
  .get(
    "/me",
    async ({ auth: user }) => ({
      id: user!.id,
      name: user!.name,
      email: user!.email,
      avatarUrl: user!.avatarUrl,
      phone: user!.phone,
      address: user!.address,
      config: user!.config,
    }),
    {
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
        401: msgSchema,
        403: msgSchema,
      },
      detail: {
        description:
          "Get current user information. 401 when the access token is missing, expired or revoked (logout, password/email change).",
      },
    }
  )
  .delete(
    "/logout",
    async ({ cookie: { refetchToken, accessToken }, prisma, auth: user }) => {
      const current = user as AuthUser;
      // Thu hồi phiên của access token đang dùng (+ phiên của cookie refetchToken nếu có)
      const sessions: { id?: string; tokenHash?: string }[] = [
        { id: current.sid },
      ];
      if (refetchToken.value) {
        sessions.push({ tokenHash: hashRefreshToken(refetchToken.value) });
      }
      await prisma.userRefreshToken.updateMany({
        where: {
          userId: current.id,
          revoked: false,
          OR: sessions,
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
    },
    {
      cookie: t.Cookie({
        refetchToken: t.Optional(t.String()),
        accessToken: t.Optional(t.String()),
      }),
      response: {
        200: msgSchema,
        401: msgSchema,
        403: msgSchema,
      },
      detail: {
        description:
          "Logout from the system: revokes the current session, so both the access token and the `refetchToken` cookie stop working immediately.",
      },
    }
  );
