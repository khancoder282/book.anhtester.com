/**
 * Nạp lại bảng Address theo đơn vị hành chính Việt Nam hiện hành (vn-address.json).
 * Chỉ đụng tới bảng Address, không xoá user/sách/file.
 *
 *   cd backend && bun run seed:address --yes
 *
 * --yes           bắt buộc, xác nhận thay toàn bộ bảng Address
 * --allow-remote  cho phép chạy khi DATABASE_URL không phải localhost
 *
 * seed.ts cũng dùng addressRows() để nạp địa chỉ khi dựng lại toàn bộ dữ liệu mẫu.
 */
import { PrismaClient } from "../../src/prisma/client";
import vnAddress from "./vn-address.json";

/** Mỗi phường/xã một dòng, giữ thứ tự theo mã hành chính (id tăng dần = đúng thứ tự). */
export function addressRows() {
  return Object.entries(vnAddress.provinces as Record<string, string[]>).flatMap(([div, wards]) =>
    wards.map((ward) => ({ div, wards: ward }))
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.includes("--yes")) {
    console.error("Script này thay TOÀN BỘ bảng Address. Chạy lại với --yes để xác nhận.");
    process.exit(1);
  }
  let host = "";
  try {
    host = new URL(Bun.env.DATABASE_URL ?? "").hostname;
  } catch {
    console.error("DATABASE_URL không hợp lệ.");
    process.exit(1);
  }
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host) && !args.includes("--allow-remote")) {
    console.error(`DATABASE_URL trỏ tới "${host}", không phải localhost. Thêm --allow-remote nếu chắc chắn.`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const rows = addressRows();
  await prisma.$transaction([prisma.address.deleteMany(), prisma.address.createMany({ data: rows })]);
  const provinces = await prisma.address.groupBy({ by: ["div"] });
  console.log(`Address: ${provinces.length} tỉnh/thành, ${await prisma.address.count()} phường/xã/đặc khu.`);
  await prisma.$disconnect();
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
