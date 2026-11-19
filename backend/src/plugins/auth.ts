import type { PrismaClient, User } from "../prisma/client";
import { AppMain } from "../regis";

/**
 * Access token (JWT) mang `sid` = id bản ghi `UserRefreshToken` (phiên đăng nhập).
 * Guard chỉ chấp nhận token khi phiên đó còn tồn tại và chưa bị thu hồi, nên:
 * - logout (thu hồi phiên hiện tại) làm access token của phiên đó hết hiệu lực ngay;
 * - đổi mật khẩu / email (thu hồi mọi phiên của user) làm mọi access token cũ hết hiệu lực.
 * Token phát hành trước khi có `sid` (bản cũ) bị từ chối, phải đăng nhập lại.
 */
export type AccessTokenPayload = { id: string; sid: string; iat?: number };

export type AuthUser = Auth & { sid: string };

type TokenCtx = {
  headers: Record<string, string | undefined>;
  jwt: { verify: (token?: string) => Promise<unknown> };
  prisma: PrismaClient;
};

type TokenUser = NonNullable<
  Awaited<ReturnType<PrismaClient["userRefreshToken"]["findUnique"]>>
> & { user: User };

/**
 * Kiểm tra access token trong header `Authorization: Bearer <token>`.
 * Dùng chung cho guard `auth` và các route chỉ cần token ở một số nhánh (vd `GET /api/file`).
 * Trả `{ status, msg }` khi bị từ chối, hoặc `{ session }` (kèm `session.user`) khi hợp lệ.
 */
export async function verifyAccessToken(
  ctx: TokenCtx
): Promise<{ status: number; msg: string } | { session: TokenUser }> {
  const authHeader = ctx.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return { status: 401, msg: "Missing or invalid Authorization header" };
  }
  try {
    const payload = (await ctx.jwt.verify(authHeader.split(" ")[1])) as AccessTokenPayload | false;
    if (!payload || !payload.id || !payload.sid) {
      return { status: 401, msg: "Invalid or expired token" };
    }
    const session = await ctx.prisma.userRefreshToken.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });
    if (!session || session.revoked || session.userId !== payload.id) {
      return { status: 401, msg: "Token has been revoked. Please login again." };
    }
    if (!session.user.isActive) return { status: 403, msg: "User account is disabled" };
    return { session };
  } catch {
    return { status: 401, msg: "Invalid or expired token" };
  }
}

export const auth = (app: AppMain) => {
  app.onBeforeHandle(async (ctx) => {
    const result = await verifyAccessToken(ctx as unknown as TokenCtx);
    if ("status" in result) {
      ctx.set.status = result.status;
      return { msg: result.msg };
    }
    const { session } = result;
    const { user } = session;
    // Gắn auth vào ctx để dùng trong handler
    ctx.auth = {
      id: user.id,
      sid: session.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      password: user.password,
      phone: user.phone,
      address: user.address,
      config: user.config ?? {},
    } as AuthUser;
  });

  return app;
};

/** Refresh token gửi cho client là chuỗi ngẫu nhiên; DB chỉ lưu SHA-256 của nó. */
export function newRefreshToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("hex");
}

export function hashRefreshToken(token: string) {
  return new Bun.CryptoHasher("sha256").update(token).digest("hex");
}

export const REFRESH_TOKEN_DAYS = 7;
export const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_DAYS * 24 * 60 * 60; // giây

export const NAME_MAX_LENGTH = 191;
export const PASSWORD_MIN_LENGTH = 6;

/**
 * Kiểm tra tên và mật khẩu (dùng chung cho register, profile, /user).
 * - `name` có gửi thì không được rỗng / chỉ khoảng trắng, tối đa 191 ký tự.
 * - `password` có gửi (khác chuỗi rỗng) thì tối thiểu 6 ký tự.
 * Trả `fields` theo định dạng lỗi 422 của API, hoặc `null` nếu hợp lệ.
 */
export function validateUserInput(
  body: { name?: string; password?: string },
  { passwordRequired = false }: { passwordRequired?: boolean } = {}
) {
  const fields: Record<string, string[]> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) fields.name = ["Name must not be empty."];
    else if (name.length > NAME_MAX_LENGTH)
      fields.name = [`Name must be at most ${NAME_MAX_LENGTH} characters.`];
  }
  if (passwordRequired && !body.password) {
    fields.password = ["Password is required."];
  } else if (body.password && body.password.length < PASSWORD_MIN_LENGTH) {
    fields.password = [
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    ];
  }
  return Object.keys(fields).length ? fields : null;
}
