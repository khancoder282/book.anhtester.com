/**
 * Xuất tài liệu Swagger (OpenAPI) ra docs/api/openapi.json để commit cùng code.
 *
 * Swagger của app được @elysiajs/openapi sinh lúc chạy từ khai báo body/response/detail
 * trong controller, nên cần backend đang chạy:
 *
 *   cd backend && bun run dev            # terminal 1
 *   cd backend && bun run swagger:export # terminal 2
 *
 * Đổi nguồn bằng biến môi trường API_URL (mặc định http://localhost:<PORT>).
 * KHÔNG trỏ vào production khi đang thử code chưa deploy.
 */
import fs from "node:fs";
import path from "node:path";

const base = (Bun.env.API_URL ?? `http://localhost:${Bun.env.PORT ?? 4566}`).replace(/\/$/, "");
const out = path.resolve(import.meta.dir, "../../docs/api/openapi.json");

let res: Response;
try {
  res = await fetch(`${base}/swagger/json`);
} catch {
  console.error(`Không kết nối được ${base}. Backend đã chạy chưa? (cd backend && bun run dev)`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`GET ${base}/swagger/json trả ${res.status}`);
  process.exit(1);
}

const spec = (await res.json()) as {
  paths?: Record<string, Record<string, unknown>>;
  servers?: { url: string }[];
};

// Khi chạy `bun run dev`, Swagger để localhost lên đầu (xem regis.ts). File tài liệu thì luôn
// để production lên đầu, để diff không đổi theo người xuất.
if (spec.servers) {
  spec.servers.sort((a, b) => Number(b.url.startsWith("https://")) - Number(a.url.startsWith("https://")));
}

// Sắp xếp path và method để diff giữa các lần xuất ổn định
const sortObject = <T>(obj: Record<string, T>) =>
  Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
if (spec.paths) {
  spec.paths = sortObject(
    Object.fromEntries(Object.entries(spec.paths).map(([p, ops]) => [p, sortObject(ops)]))
  );
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);

const count = Object.values(spec.paths ?? {}).reduce((n, ops) => n + Object.keys(ops).length, 0);
console.log(`Đã ghi ${path.relative(process.cwd(), out)}: ${Object.keys(spec.paths ?? {}).length} path, ${count} endpoint.`);
