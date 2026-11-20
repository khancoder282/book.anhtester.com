import Elysia, { t } from "elysia";
import fs from "fs";
import path from "path";
import { auth, verifyAccessToken } from "../plugins/auth";
import { AppMain } from "../regis";
import { hitRateLimit } from "../utils/rate-limit";
import {
  ALLOWED_KEEP_EXT,
  ALLOWED_UPLOAD_TEXT,
  UPLOAD_ROOT,
  dirSize,
  isAllowedUpload,
  isInsideOf,
  isValidName,
  resolveUpload,
  serveFile,
  toClientPath,
} from "../utils/upload-security";

const fileController = new Elysia({
  prefix: "file",
  tags: ["File Management"],
}) as unknown as AppMain;

export default fileController;
export const file_path = UPLOAD_ROOT;

/**
 * Hạn mức tổng dung lượng thư mục upload (user chốt 2026-11-21): 1GB.
 * Upload / copy làm tổng vượt hạn mức → 507 `{ msg }`. Trước đây con số này chỉ để hiển thị ở /api/file/info.
 */
const maxStorage = 1024 * 1024 * 1024; // 1GB
export const MAX_STORAGE = maxStorage;
const toMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

/** Thêm `incoming` byte có vượt hạn mức không. Trả về dung lượng đang dùng nếu vượt, ngược lại null. */
async function overStorage(incoming: number) {
  const used = await dirSize(file_path);
  return used + incoming > maxStorage ? used : null;
}

const storageFullMsg = (used: number, incoming: number) => ({
  msg:
    `Storage limit reached: ${toMB(used)} of 1GB used, this request needs ${toMB(incoming)} more. ` +
    "Delete some books or files first.",
});

/**
 * Tổng dung lượng các file trong MỘT lần upload (user chốt 2026-11-21): ≤ 4MB.
 * Một file đơn lẻ vì thế cũng ≤ 4MB. Vượt → 422 `fields.files`.
 */
export const MAX_UPLOAD_TOTAL = 4 * 1024 * 1024;
const MAX_UPLOAD_TEXT = "4MB";
/** Số lần upload tối đa mỗi phút cho mỗi user (2026-11-21). Vượt → 429 + header Retry-After. */
export const UPLOAD_RATE_LIMIT = 20;

if (!fs.existsSync(file_path)) {
  fs.mkdirSync(file_path);
  fs.mkdirSync(path.join(file_path, "$book-image"));
  fs.mkdirSync(path.join(file_path, "$avatar-image"));
  fs.copyFileSync(
    path.join(process.cwd(), '$image-404.svg'),
    path.join(file_path, '$image-404.svg')
  )
}

const INVALID_PATH = "Invalid path. Paths must be inside the upload directory.";
const DELETE_PATH_PATTERN = /^\/[^/]+(\/[^/]+)*$/;

const msgSchema = t.Object({ msg: t.String() });
const validationSchema = t.Object({
  msg: t.String(),
  fields: t.Record(t.String(), t.Array(t.String())),
});

/** Every folder name between the upload root and `abs` must be a valid name (no "C:", "<", ...). */
const hasValidSegments = (abs: string) =>
  abs === file_path ||
  path.relative(file_path, abs).split(path.sep).every((s) => isValidName(s));

/** A file may only end up with an extension the app can serve safely. */
const hasAllowedExt = (name: string) =>
  ALLOWED_KEEP_EXT.includes(path.extname(name).toLowerCase());

const getFilesRecursive =(dir: string, search: string) => {
  let results: any[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((name) => {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    const path_dir = toClientPath(fullPath)
    if (stat.isDirectory()) {
      const files = getFilesRecursive(fullPath, search);
      if (path_dir.includes(search)) {
        results.push({
          name,
          path: path_dir,
          isFile: false,
          size: stat.size,
          type: "_/folder",
          modified: stat.mtime,
          created: stat.birthtime,
        })

      }
      if (search !== "") results.push(...files);
    } else {
      if (path_dir.includes(search)) {
        results.push({
          name,
          path: path_dir,
          isFile: true,
          size: stat.size,
          type: Bun.file(fullPath).type,
          modified: stat.mtime,
          created: stat.birthtime,
        });
      }
    }
  });
  return results;
};

fileController
  .get(
    "",
    async (ctx) => {
      const { query, set } = ctx;
      let { path: p = "/", search = "" } = query;
      if (search === "*") search = "/";

      const pathname = resolveUpload(p);
      if (!pathname) {
        set.status = 400;
        return { msg: "Invalid path." };
      }
      if (!fs.existsSync(pathname)) {
        set.status = 404;
        return { msg: "File or directory not found." };
      }
      const stat = fs.statSync(pathname);
      if (stat.isFile()) {
        // Public: book covers / avatars are loaded by <img> without a token
        return serveFile(pathname) as any;
      }
      if (stat.isDirectory()) {
        const denied = await verifyAccessToken(ctx as never);
        if ("status" in denied) {
          set.status = denied.status;
          return { msg: denied.msg };
        }
        const list = getFilesRecursive(pathname, search);
        return { list };
      }
      set.status = 400;
      return { msg: "Invalid path." };
    },
    {
      query: t.Object({
        path: t.Optional(t.String({ default: "/", description: "Path inside the upload directory, e.g. /$book-image/clean-code/cover.png" })),
        search: t.Optional(t.String({ default: "", description: "Only for folders: filter by path, searching all sub folders. \"*\" lists everything." })),
      }),
      response: {
        200: t.Union([
          t.Object({
            list: t.Array(
              t.Object({
                name: t.String(),
                path: t.String(),
                isFile: t.Boolean(),
                size: t.Number(),
                type: t.String(),
                modified: t.Date(),
                created: t.Date(),
              })
            ),
          }),
          t.File(),
        ]),
        400: msgSchema,
        401: msgSchema,
        403: msgSchema,
        404: msgSchema,
      },
      detail: {
        // Token optional: required for folders, not for a single file
        security: [{ BearerAuth: [] }, {}],
        description:
          "If `path` is a FILE: download it, no token needed (used by <img> for book covers and avatars). " +
          "Raster images (jpg, png, gif, webp, bmp) are sent inline, every other type as `Content-Disposition: attachment`; " +
          "all files are sent with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: ... sandbox`. " +
          "If `path` is a FOLDER: list its content, **requires a Bearer token** (401 without). " +
          "Paths outside the upload directory return 400.",
      },
    }
  )
  .get("/info", async () => {
    return {
      usedStorage: await dirSize(file_path),
      maxStorage: maxStorage,
    }
  }, {
    response: {
      200: t.Object({
        usedStorage: t.Number({ description: "Bytes used by the upload directory" }),
        maxStorage: t.Number({ description: "Storage limit in bytes" }),
      }),
    },
    detail: {
      security: [],
      description: "Get information about storage (bytes used / limit). Works on Windows and Linux.",
    }
  })
  .use(auth)
  .post(
    "",
    async ({ body, set, auth }) => {
      // Mỗi user tối đa UPLOAD_RATE_LIMIT lần upload / phút (chống upload dồn dập làm đầy ổ đĩa)
      const retryAfter = hitRateLimit(`upload:${auth?.id ?? "anonymous"}`, UPLOAD_RATE_LIMIT, 60_000);
      if (retryAfter) {
        set.status = 429;
        set.headers["Retry-After"] = String(retryAfter);
        return {
          msg: `Too many uploads. Please wait ${retryAfter} seconds and try again.`,
        };
      }

      const { files, path: p = "/" } = body;
      const pathname = resolveUpload(p);

      if (!pathname || !hasValidSegments(pathname)) {
        set.status = 400;
        return { msg: "Invalid path." };
      }
      if (fs.existsSync(pathname) && !fs.statSync(pathname).isDirectory()) {
        set.status = 400;
        return {
          msg: "Path is not a directory.",
        };
      }

      // Tổng dung lượng cả lần upload (kiểm trước khi đọc nội dung từng file)
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > MAX_UPLOAD_TOTAL) {
        set.status = 422;
        return {
          msg: "Invalid data.",
          fields: {
            files: [
              `Total upload size must not exceed ${MAX_UPLOAD_TEXT} (got ${(totalSize / 1024 / 1024).toFixed(2)}MB).`,
            ],
          },
        };
      }

      // Hạn mức tổng thư mục upload (1GB)
      const usedBeforeUpload = await overStorage(totalSize);
      if (usedBeforeUpload !== null) {
        set.status = 507;
        return storageFullMsg(usedBeforeUpload, totalSize);
      }

      // Check every file before writing anything
      const targets: string[] = [];
      for (const file of files) {
        if (!isValidName(file.name)) {
          set.status = 400;
          return { msg: "Invalid file name." };
        }
        if (!(await isAllowedUpload(file))) {
          set.status = 422;
          return {
            msg: "Invalid data.",
            fields: {
              files: [`File "${file.name}" is not allowed. Only ${ALLOWED_UPLOAD_TEXT} files whose content matches the extension can be uploaded.`],
            },
          };
        }
        const filePath = path.join(pathname, file.name.trim());
        if (!isInsideOf(filePath, pathname)) {
          set.status = 400;
          return { msg: "Invalid file name." };
        }
        if (fs.existsSync(filePath) || targets.includes(filePath)) {
          set.status = 400;
          return {
            msg: "File already exists.",
          };
        }
        targets.push(filePath);
      }

      try {
        fs.mkdirSync(pathname, { recursive: true });
        for (let i = 0; i < files.length; i++) {
          await Bun.write(targets[i], await files[i].arrayBuffer());
        }
      } catch (e) {
        console.error("[upload]", e instanceof Error ? e.message : e);
        set.status = 500;
        return { msg: "Failed to upload." };
      }

      return {
        msg: "Uploaded successfully.",
        paths: targets.map(toClientPath),
      };
    },
    {
      body: t.Object({
        files: t.Files({
          multiple: true,
          maxItems: 20,
          minItems: 1,
          // Không đặt maxSize ở đây: lỗi schema của Elysia khó đọc ("Expected kind 'Files'").
          // Handler kiểm tổng cả lần upload ≤ MAX_UPLOAD_TOTAL (nên mỗi file cũng ≤ 4MB) với thông báo rõ.
          description: `1-20 files, **at most ${MAX_UPLOAD_TEXT} in total** for the whole request (so each file is at most ${MAX_UPLOAD_TEXT} too; over the limit → 422 \`fields.files\`). Allowed: ${ALLOWED_UPLOAD_TEXT}. The type is checked from the file content and extension, not from the Content-Type sent by the client. SVG, HTML and other types are rejected (422).`,
        }),
        path: t.Optional(
          t.String({
            default: "/",
            description: "Destination folder inside the upload directory, created if missing (e.g. /photos/2026).",
          })
        ),
      }),
      response: {
        200: t.Object({
          msg: t.String(),
          paths: t.Array(t.String()),
        }),
        400: msgSchema,
        422: validationSchema,
        429: t.Object({ msg: t.String({ description: "Too many uploads. Wait `Retry-After` seconds." }) }),
        507: t.Object({ msg: t.String({ description: "The upload folder would exceed its 1GB limit." }) }),
        500: msgSchema,
      },
      parse: ["multipart/form-data"],
      detail: {
        description:
          `Upload files. The total size of all files in one request must not exceed ${MAX_UPLOAD_TEXT} (422 \`fields.files\`). ` +
          `At most ${UPLOAD_RATE_LIMIT} uploads per minute per user (429 + \`Retry-After\` header). ` +
          "The whole upload folder is limited to 1GB (507 when an upload would exceed it, see GET /api/file/info). " +
          `Allowed types: ${ALLOWED_UPLOAD_TEXT} (checked by content). File / folder names must not contain \`%\`, start with \`.\` or end with \`.\`. ` +
          `Path or file names that leave the upload directory return 400 "Invalid path." / "Invalid file name.".`,
      }
    }
  )
  .delete(
    "",
    async ({ query, set }) => {
      const { path: _p } = query;
      const ps = (Array.isArray(_p) ? _p : [_p]).filter(Boolean);
      if (ps.length === 0) {
        set.status = 422;
        return { msg: "Invalid data.", fields: { path: ["Path is required."] } };
      }
      if (!ps.every((p) => DELETE_PATH_PATTERN.test(p))) {
        set.status = 422;
        return {
          msg: "Invalid data.",
          fields: {
            path: ["Invalid path format. Path must start with '/' and follow valid directory or file path structure."],
          },
        };
      }
      const pathnames: string[] = [];
      for (const p of ps) {
        const pathname = resolveUpload(p);
        if (!pathname || pathname === file_path) {
          set.status = 400;
          return {
            msg: INVALID_PATH,
          };
        }
        if (!fs.existsSync(pathname)) {
          set.status = 404;
          return {
            msg: "File or directory not found.",
          };
        }
        if (path.basename(pathname).startsWith("$")) {
          set.status = 403;
          return {
            msg: "File system not allowed delete.",
          }
        }
        pathnames.push(pathname);
      }

      let deletedDir = false;
      try {
        for (const pathname of pathnames) {
          if (!fs.existsSync(pathname)) continue; // already removed with its parent folder
          if (fs.statSync(pathname).isDirectory()) {
            fs.rmSync(pathname, { recursive: true });
            deletedDir = true;
          } else {
            fs.unlinkSync(pathname);
          }
        }
      } catch (e) {
        console.error("[delete]", e instanceof Error ? e.message : e);
        set.status = 400;
        return {
          msg: "Invalid data.",
        };
      }
      return {
        msg: deletedDir && pathnames.length === 1 ? "Deleted directory successfully." : "Deleted file successfully.",
      };
    },
    {
      response: {
        200: msgSchema,
        400: msgSchema,
        403: msgSchema,
        404: msgSchema,
        422: validationSchema,
      },
      query: t.Object({
        // Định dạng kiểm tra trong handler: lỗi pattern trong t.Union không ra được thông báo (fields rỗng)
        path: t.Union([
          t.String({ description: "Path starting with '/', e.g. /photos/a.png. Repeat the parameter to delete several." }),
          t.Array(t.String()),
        ])
      }),
      detail: {
        description: "Delete files or folders (repeat `path` to delete several). System items whose name starts with `$` cannot be deleted (403).",
      }
    }
  )
  .put(
    "/rename",
    async ({ body, set }) => {
      const { path: p, name } = body;
      const pathname = resolveUpload(p);

      if (!pathname || pathname === file_path) {
        set.status = 400;
        return {
          msg: INVALID_PATH,
        };
      }
      if (!isValidName(name)) {
        set.status = 400;
        return { msg: "Invalid name." };
      }

      if (!fs.existsSync(pathname)) {
        set.status = 404;
        return {
          msg: "File or directory not found.",
        };
      }

      if (path.basename(pathname).startsWith("$")) {
        set.status = 403;
        return { msg: "File system not allowed rename." };
      }

      const dirBase = path.dirname(pathname);
      const target = path.join(dirBase, name.trim());
      if (!isInsideOf(target, dirBase) || target === dirBase) {
        set.status = 400;
        return { msg: "Invalid name." };
      }
      if (fs.statSync(pathname).isFile() && !hasAllowedExt(target)) {
        set.status = 400;
        return { msg: "File extension not allowed." };
      }
      if (fs.existsSync(target)) {
        set.status = 400;
        return {
          msg: "File or directory already exists.",
        };
      }

      try {
        fs.renameSync(pathname, target);
      } catch (e) {
        console.error("[rename]", e instanceof Error ? e.message : e);
        set.status = 500;
        return { msg: "Failed to rename." };
      }

      return {
        msg: "Renamed successfully.",
      };
    },
    {
      response: {
        200: msgSchema,
        400: msgSchema,
        403: msgSchema,
        404: msgSchema,
        422: validationSchema,
        500: msgSchema,
      },
      body: t.Object({
        path: t.String(),
        name: t.String({ description: "New name only (no folder). Must not contain / \\ : * ? \" < > | ; a file must keep an allowed extension." }),
      }),
      detail: {
        description: "Rename file or directory in its current folder. Names with path separators or `..` return 400 \"Invalid name.\".",
      }
    }
  )
  .post(
    "/copy",
    async ({ body, set }) => {
      let { oldPath, newPath } = body;
      const oldPathname = resolveUpload(oldPath);
      let newPathname = resolveUpload(newPath);

      if (!oldPathname || !newPathname || oldPathname === file_path || newPathname === file_path) {
        set.status = 400;
        return {
          msg: INVALID_PATH,
        };
      }

      if (!isValidName(path.basename(newPathname))) {
        set.status = 400;
        return { msg: "Invalid characters in file name." };
      }
      if (!fs.existsSync(oldPathname)) {
        set.status = 404;
        return {
          msg: "File or directory not found.",
        };
      }

      const parentDir = path.dirname(newPathname);
      if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
        set.status = 400;
        return { msg: "Destination folder not found." };
      }

      const isDirectory = fs.statSync(oldPathname).isDirectory();
      if (isDirectory && isInsideOf(newPathname, oldPathname)) {
        set.status = 400;
        return { msg: "Cannot copy a folder into itself." };
      }
      if (!isDirectory && !hasAllowedExt(newPathname)) {
        set.status = 400;
        return { msg: "File extension not allowed." };
      }

      // Keep the destination folder, only make the name unique.
      const ext = isDirectory ? "" : path.extname(newPathname);
      const base = path.basename(newPathname, ext);
      let count = 0;
      while (fs.existsSync(newPathname)) {
        count += 1;
        newPathname = path.join(parentDir, `${base}_copy${count > 1 ? count : ""}${ext}`);
      }
      newPath = toClientPath(newPathname);

      // Copy cũng làm tăng dung lượng → kiểm hạn mức 1GB
      const copySize = isDirectory ? await dirSize(oldPathname) : fs.statSync(oldPathname).size;
      const usedBeforeCopy = await overStorage(copySize);
      if (usedBeforeCopy !== null) {
        set.status = 507;
        return storageFullMsg(usedBeforeCopy, copySize);
      }

      try {
        fs.cpSync(oldPathname, newPathname, { recursive: isDirectory });
      } catch (e) {
        set.status = 500;
        return { msg: "Failed to copy." };
      }

      return {
        msg: "Copied successfully.",
        newPath,
        newName: path.basename(newPathname),
      };
    },
    {
      response: {
        200: t.Object({
          msg: t.String(),
          newPath: t.String(),
          newName: t.String(),
        }),
        400: msgSchema,
        404: msgSchema,
        422: validationSchema,
        507: t.Object({ msg: t.String({ description: "The upload folder would exceed its 1GB limit." }) }),
        500: msgSchema,
      },
      body: t.Object({
        oldPath: t.String(),
        newPath: t.String(),
      }),
      detail: {
        description: "Copy file or directory.",
      }
    }
  )
  .put(
    "/move",
    async ({ body, set }) => {
      const { oldPath, newPath } = body;
      const oldPathname = resolveUpload(oldPath);
      const newPathname = resolveUpload(newPath);
      // Check if paths are inside the base directory
      if (!oldPathname || !newPathname || oldPathname === file_path || newPathname === file_path) {
        set.status = 400;
        return {
          msg: INVALID_PATH,
        };
      }

      if (!fs.existsSync(oldPathname)) {
        set.status = 404;
        return {
          msg: "Old file or directory not found.",
        };
      }

      if (path.basename(oldPathname).startsWith("$")) {
        set.status = 403;
        return {
          msg: "File system not allowed move.",
        };
      }

      if (!isValidName(path.basename(newPathname))) {
        set.status = 400;
        return { msg: "Invalid characters in file name." };
      }

      const parentDir = path.dirname(newPathname);
      if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
        set.status = 400;
        return { msg: "Destination folder not found." };
      }

      const isDirectory = fs.statSync(oldPathname).isDirectory();
      if (isDirectory && isInsideOf(newPathname, oldPathname)) {
        set.status = 400;
        return { msg: "Cannot move a folder into itself." };
      }
      if (!isDirectory && !hasAllowedExt(newPathname)) {
        set.status = 400;
        return { msg: "File extension not allowed." };
      }

      if (fs.existsSync(newPathname)) {
        set.status = 400;
        return {
          msg: "New file or directory already exists.",
        };
      }

      try {
        fs.renameSync(oldPathname, newPathname);
        return {
          msg: "Moved successfully.",
        };
      } catch (e) {
        set.status = 500;
        return {
          msg: "Failed to move."
        };
      }
    },
    {
      response: {
        200: msgSchema,
        400: msgSchema,
        403: msgSchema,
        404: msgSchema,
        422: validationSchema,
        500: msgSchema,
      },
      body: t.Object({
        oldPath: t.String(),
        newPath: t.String(),
      }),
      detail: {
        description: "Move file or directory.",
      }
    }
  )
