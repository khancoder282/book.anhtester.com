import { User } from "../prisma";
import { AppMain } from "../regis";

export const auth = (app: AppMain) => {
  app.onBeforeHandle(async (ctx) => {
    const { headers, set, jwt, prisma, cookie } = ctx;
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer")) {
      set.status = 401;
      return { msg: "Missing or invalid Authorization header" };
    }

    const token = authHeader.split(" ")[1] ?? cookie.accessToken?.value;
    try {
      const user = (await jwt.verify(token)) as { id: string; iat: number };
      if (!user) {
        set.status = 401;
        return { msg: "Unauthorized" };
      }

      const auth = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!auth) {
        set.status = 401;
        return { msg: "User no longer exists" };
      }

      if (!auth.isActive) {
        set.status = 403;
        return { msg: "User account is disabled" };
      }

      // ✅ Gắn auth vào ctx để dùng trong handler
      ctx.auth = {
        id: auth.id,
        email: auth.email,
        name: auth.name,
        avatarUrl: auth.avatarUrl,
        password: auth.password,
        phone: auth.phone,
        address: auth.address,
        config: auth.config ?? {}
      } as Auth;
    } catch (err) {
      set.status = 401;
      return { msg: "Invalid or expired token" };
    }
  });

  return app;
};
