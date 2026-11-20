/**
 * Dựng lại bộ dữ liệu mẫu: XOÁ toàn bộ dữ liệu (trừ tài khoản admin) rồi tạo
 * category, user, sách (kèm ảnh), khuyến mãi, file mẫu và địa chỉ.
 *
 *   cd backend && bun run seed --yes
 *
 * --yes           bắt buộc, xác nhận xoá dữ liệu
 * --allow-remote  cho phép chạy khi DATABASE_URL không phải localhost
 *
 * Dữ liệu ở data.json, địa chỉ ở vn-address.json, ảnh ở assets/ (sinh bằng tools/make_images.py).
 */
import fs from "fs";
import path from "path";
import { PrismaClient, type Promotion } from "../../src/prisma/client";
import data from "./data.json";
import { addressRows } from "./address";

/** Một sách trong data.json; trường không bắt buộc thiếu thì lưu null. `toc` chỉ dùng cho make_images.py. */
type BookSeed = {
  name: string;
  slug: string;
  author?: string;
  publisher?: string;
  publishYear?: number;
  pageCount?: number;
  isbn?: string;
  language?: string;
  categories: string[];
  price: number;
  status: string;
  owner: string;
  views: number;
  description: string;
  previewTitle?: string;
  previewContent?: string;
};

const args = process.argv.slice(2);
const SEED_DIR = import.meta.dir;
const BACKEND_DIR = path.resolve(SEED_DIR, "../..");
const ASSETS = path.join(SEED_DIR, "assets");
const UPLOAD = path.resolve(BACKEND_DIR, Bun.env.FILEDIR || "upload");
const DAY = 24 * 60 * 60 * 1000;

function guard() {
  if (!args.includes("--yes")) {
    console.error("Script này XOÁ toàn bộ dữ liệu (trừ admin). Chạy lại với --yes để xác nhận.");
    process.exit(1);
  }
  const url = Bun.env.DATABASE_URL ?? "";
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    console.error("DATABASE_URL không hợp lệ.");
    process.exit(1);
  }
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host) && !args.includes("--allow-remote")) {
    console.error(`DATABASE_URL trỏ tới "${host}", không phải localhost. Thêm --allow-remote nếu chắc chắn.`);
    process.exit(1);
  }
}

/** Giống handlePrice trong routers/book-controller.ts. */
function currentPrice(price: number, promotions: Promotion[]) {
  const now = Date.now();
  const discount = promotions
    .filter((p) => p.isActive && p.startDate.getTime() <= now && p.endDate.getTime() >= now)
    .reduce((sum, p) => {
      if (p.type === "PERCENTAGE") return sum + (price * p.value) / 100;
      if (p.type === "FIXED_AMOUNT") return sum + p.value;
      return sum;
    }, 0);
  return Math.max(0, Math.round(price - discount));
}

/** Copy file vào thư mục upload, trả về đường dẫn kiểu app lưu ("/$book-image/slug/file.jpg"). */
function putFile(src: string, relDir: string) {
  const destDir = path.join(UPLOAD, relDir);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, path.basename(src)));
  return `/${relDir}/${path.basename(src)}`;
}

function resetUploadDir() {
  fs.mkdirSync(UPLOAD, { recursive: true });
  for (const entry of fs.readdirSync(UPLOAD)) {
    if (entry === "$image-404.svg") continue;
    fs.rmSync(path.join(UPLOAD, entry), { recursive: true, force: true });
  }
  const img404 = path.join(UPLOAD, "$image-404.svg");
  if (!fs.existsSync(img404)) fs.copyFileSync(path.join(BACKEND_DIR, "$image-404.svg"), img404);
  fs.mkdirSync(path.join(UPLOAD, "$book-image"));
  fs.mkdirSync(path.join(UPLOAD, "$avatar-image"));
}

async function main() {
  guard();
  const prisma = new PrismaClient();
  const now = Date.now();
  const password = await Bun.password.hash(data.defaultPassword);

  // 1. Giữ admin (tạo nếu chưa có), xoá mọi thứ khác
  let admin = await prisma.user.findUnique({ where: { email: data.admin.email } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: data.admin.name,
        email: data.admin.email,
        password: await Bun.password.hash(data.admin.password),
        avatarUrl: "",
        address: "",
      },
    });
  }
  await prisma.$transaction([
    prisma.userRefreshToken.deleteMany({ where: { userId: { not: admin.id } } }),
    prisma.book.deleteMany(),
    prisma.promotion.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany({ where: { id: { not: admin.id } } }),
    prisma.address.deleteMany(),
  ]);
  resetUploadDir();
  // Thư mục upload vừa bị xoá sạch → avatar cũ của admin (nếu có) không còn file
  await prisma.user.update({ where: { id: admin.id }, data: { avatarUrl: "" } });

  // 2. Category, địa chỉ
  await prisma.category.createMany({ data: data.categories.map((name) => ({ name })) });
  await prisma.address.createMany({ data: addressRows() });

  // 3. User (mỗi user tạo cách nhau vài ngày)
  const userIds: Record<string, string> = { admin: admin.id };
  const userCreatedAt: Record<string, number> = {}; // admin có sẵn (có thể vừa tạo) nên không tính
  for (const [i, u] of data.users.entries()) {
    const createdAt = new Date(now - (60 - i * 6) * DAY);
    const avatarUrl = u.avatar
      ? putFile(path.join(ASSETS, "avatars", u.avatar), `$avatar-image/${u.email}`)
      : "";
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password,
        phone: u.phone,
        address: u.address,
        avatarUrl,
        isActive: u.isActive,
        createdAt,
        updatedAt: createdAt,
      },
    });
    userIds[u.key] = user.id;
    userCreatedAt[u.key] = createdAt.getTime();
  }

  // 4. Khuyến mãi (ngày tính tương đối so với lúc chạy seed)
  const promotions: Record<string, Promotion> = {};
  for (const p of data.promotions) {
    promotions[p.code] = await prisma.promotion.create({
      data: {
        code: p.code,
        name: p.name,
        description: p.description,
        type: p.type as Promotion["type"],
        value: p.value,
        startDate: new Date(now + p.startOffsetDays * DAY),
        endDate: new Date(now + p.endOffsetDays * DAY),
        isActive: p.isActive,
      },
    });
  }

  // 5. Sách + ảnh (bìa trước, bìa sau, 2 trang trong — file nào có thì lấy)
  // createdAt: RECENT_BOOKS sách cuối danh sách nằm trong 7 ngày gần đây (UI gắn nhãn "New"),
  // các sách còn lại rải từ ~10 đến ~112 ngày trước và không sớm hơn ngày tạo của chủ sách (trừ admin).
  const RECENT_BOOKS = 5;
  const PICTURES = ["bia-truoc.jpg", "bia-sau.jpg", "trang-1.jpg", "trang-2.jpg"];
  const books = data.books as BookSeed[];
  for (const [i, b] of books.entries()) {
    const bookPromos = data.promotions.filter((p) => p.books.includes(b.slug)).map((p) => promotions[p.code]);
    const dir = path.join(ASSETS, "books", b.slug);
    const pictures = PICTURES.filter((f) => fs.existsSync(path.join(dir, f))).map((f) =>
      putFile(path.join(dir, f), `$book-image/${b.slug}`),
    );
    const older = books.length - RECENT_BOOKS;
    const daysAgo = i >= older ? (books.length - i) * 1.1 : 10 + (older - 1 - i) * 3;
    const createdAt = new Date(Math.max(now - daysAgo * DAY, (userCreatedAt[b.owner] ?? 0) + DAY / 2));
    await prisma.book.create({
      data: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        author: b.author ?? null,
        publisher: b.publisher ?? null,
        publishYear: b.publishYear ?? null,
        pageCount: b.pageCount ?? null,
        isbn: b.isbn ?? null,
        language: b.language ?? null,
        previewTitle: b.previewTitle ?? null,
        previewContent: b.previewContent ?? null,
        picture: pictures.join(","),
        price: b.price,
        currentPrice: currentPrice(b.price, bookPromos),
        status: b.status as "AVAILABLE" | "UNAVAILABLE",
        viewCount: b.views,
        authId: userIds[b.owner],
        createdAt,
        updatedAt: createdAt,
        categories: { connect: b.categories.map((name) => ({ name })) },
        promotions: { connect: bookPromos.map((p) => ({ id: p.id })) },
      },
    });
  }

  // 6. File mẫu cho module File
  fs.cpSync(path.join(ASSETS, "files"), UPLOAD, { recursive: true });
  fs.mkdirSync(path.join(UPLOAD, "thu-muc-trong"), { recursive: true });

  const count = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    books: await prisma.book.count(),
    promotions: await prisma.promotion.count(),
    addresses: await prisma.address.count(),
  };
  console.log("Seed xong:", count, "| upload:", UPLOAD);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
