import Elysia, { t, validationDetail } from "elysia";
import fs from "fs";
import path from "path";
import { auth } from "../plugins/auth";
import { AppMain } from "../regis";

const fileController = new Elysia({
  prefix: "file",
  tags: ["File management"],
}) as unknown as AppMain;

export default fileController;
export const file_path = path.join(process.cwd(), Bun.env.FILEDIR || "upload");

const maxStorage = 1024 * 1024 * 1024;  //1GB 

if (!fs.existsSync(file_path)) {
  fs.mkdirSync(file_path);
  fs.mkdirSync(path.join(file_path, "$book-image"));
  fs.mkdirSync(path.join(file_path, "$avatar-image"));
  fs.copyFileSync(
    path.join(process.cwd(), '$image-404.svg'),
    path.join(file_path, '$image-404.svg')
  )
}

async function dirsize(pathDir: string = "."): Promise<number> {
  // Thử dùng `du -b` (Linux)
  let proc = Bun.spawn({
    cmd: ["du", "-sb", pathDir],
    stdout: "pipe",
    stderr: "ignore",
    stdio: ["ignore", "pipe", "ignore"],
  });

  const exited = await proc.exited;
  if (exited === 0) {
    const text = await new Response(proc.stdout).text();
    const bytes = parseInt(text.trim().split("\t")[0], 10);
    if (!isNaN(bytes)) return bytes;
  }

  // Nếu thất bại → dùng `du -sk` (macOS)
  proc = Bun.spawn({
    cmd: ["du", "-sk", pathDir],
    stdout: "pipe",
    stderr: "ignore",
    stdio: ["ignore", "pipe", "ignore"],
  });

  await proc.exited;
  const text = await new Response(proc.stdout).text();
  const blocks = parseInt(text.trim().split("\t")[0], 10);

  if (isNaN(blocks)) {
    throw new Error(`Không thể tính kích thước thư mục: ${pathDir}`);
  }

  return blocks * 1024; // macOS dùng 1024-byte blocks
}

const getFilesRecursive = (dir: string, search: string) => {
  let results: any[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((name) => {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    const path_dir = "/" + path.relative(file_path, fullPath)
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
    async ({ query, set }) => {
      let { path: p = "/", search = "" } = query;
      if (search === "*") search = "/";

      const pathname = path.join(file_path, p);
      if (!pathname.startsWith(file_path)) {
        set.status = 400;
        return { msg: "Invalid path." };
      }
      if (!fs.existsSync(pathname)) {
        set.status = 404;
        return { msg: "File or directory not found." };
      }
      const stat = fs.statSync(pathname);
      if (stat.isDirectory()) {

        const list = getFilesRecursive(pathname, search);
        return { list };
      }
      if (stat.isFile()) {
        return Bun.file(pathname);
      }
      set.status = 400;
      return { msg: "Invalid path." };
    },
    {
      query: t.Object({
        path: t.Optional(t.String({ default: "/" })),
        search: t.Optional(t.String({ default: "" })),
      }),
      detail: {
        security: [],
      },
    }
  )
  .get("/info", async () => {
    return {
      usedStorage: await dirsize(file_path),
      maxStorage: maxStorage,
    }
  })
  .use(auth)
  .post(
    "",
    async ({ body, set }) => {
      const { files, path: p = "/" } = body;
      const pathname = path.join(file_path, p);

      if (!fs.existsSync(pathname)) {
        fs.mkdirSync(pathname);
      } else {
        if (!fs.statSync(pathname).isDirectory()) {
          set.status = 400;
          return {
            msg: "Path is not a directory.",
          };
        }
      }
      const paths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(pathname, file.name);

        if (fs.existsSync(filePath)) {
          set.status = 400;
          return {
            msg: "File already exists.",
          };
        }

        await Bun.write(filePath, await file.arrayBuffer());
        paths.push("/" + path.relative(file_path, filePath));
      }

      return {
        msg: "Uploaded successfully.",
        paths,
      };
    },
    {
      body: t.Object({
        files: t.Files({
          multiple: true,
          maxItems: 20,
          minItems: 1,
          maxSize: 5 * 1024 * 1024, // 5MB
          accept: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml",
            "application/zip",
            "application/x-zip-compressed",
            "application/x-rar-compressed",
            "application/x-7z-compressed",
            "application/x-tar",
            "application/x-gzip",
            "application/x-bzip2",
            "application/x-7z-compressed",
            "application/pdf",
            "application/x-pdf",
          ],
        }),
        path: t.Optional(
          t.String({
            default: "/",
            error: validationDetail("Path is required."),
          })
        ),
      }),
      parse: ["multipart/form-data"],
    }
  )
  .delete(
    "",
    async ({ query, set }) => {
      const { path: _p } = query;
      let ps = (Array.isArray(_p) ? _p : [_p]).filter(Boolean);
      if (ps.length === 0) {
        set.status = 422;
        throw validationDetail("Path is required.");
      }
      const pathnames: string[] = [];
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const pathname = path.join(file_path, p);
        if (!pathname.startsWith(file_path)) {
          set.status = 400;
          return {
            msg: "Invalid path. Paths must be inside the upload directory.",
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
        if (fs.statSync(pathname).isDirectory()) {
          try {
            fs.rmdirSync(pathname, {
              recursive: true,

            });
            return {
              msg: "Deleted directory successfully.",
            };
          } catch (e) {
            set.status = 400;
            return {
              msg: "Invalid data.",
            };
          }
        }
        if (pathname && pathname.length > 5)
          pathnames.push(pathname);
      }

      for (let i = 0; i < pathnames.length; i++) {
        await Bun.file(pathnames[i]).delete();
      }
      return {
        msg: "Deleted file successfully.",
      };
    },
    {
      query: t.Object({
        path: t.Union([
          t.String({
            pattern: "^\/[^/]+(\/[^/]+)*$",
            error: validationDetail("Invalid path format. Path must start with '/' and follow valid directory or file path structure.")
          }),
          t.Array(t.String({
            pattern: "^\/[^/]+(\/[^/]+)*$",
            error: validationDetail("Invalid path format. Path must start with '/' and follow valid directory or file path structure.")
          }))
        ])
      })
    }
  )
  .put(
    "/rename",
    async ({ body, set }) => {
      const { path: p, name } = body;
      const pathname = path.join(file_path, p);

      if (!pathname.startsWith(file_path)) {
        set.status = 400;
        return {
          msg: "Invalid path. Paths must be inside the upload directory.",
        };
      }

      if (!fs.existsSync(pathname)) {
        set.status = 404;
        return {
          msg: "File or directory not found.",
        };
      }

      const dirBase = path.dirname(pathname);
      if (fs.existsSync(path.join(dirBase, name))) {
        set.status = 400;
        return {
          msg: "File or directory already exists.",
        };
      }

      fs.renameSync(pathname, path.join(dirBase, name));

      return {
        msg: "Renamed successfully.",
      };
    },
    {
      body: t.Object({
        path: t.String(),
        name: t.String(),
      }),
    }
  )
  .post(
    "copy",
    async ({ body, set }) => {
      let { oldPath, newPath } = body;
      const oldPathname = path.join(file_path, oldPath);
      let newPathname = path.join(file_path, newPath);

      if (!oldPathname.startsWith(file_path) || !newPathname.startsWith(file_path)) {
        set.status = 400;
        return {
          msg: "Invalid path. Paths must be inside the upload directory.",
        };
      }

      const invalidChars = /[<>:"|?*]/;
      if (invalidChars.test(path.basename(newPath))) {
        set.status = 400;
        return { msg: "Invalid characters in file name." };
      }
      if (!fs.existsSync(oldPathname)) {
        set.status = 400;
        return {
          msg: "File or directory not found.",
        };
      }

      while (fs.existsSync(newPathname)) {
        newPath = path.basename(newPath) + "_copy" + path.extname(newPath);
        newPathname = path.join(file_path, newPath);
      }
      if (fs.statSync(oldPathname).isDirectory()) {
        fs.mkdirSync(newPathname);
      } else {
        fs.copyFileSync(oldPathname, newPathname);
      }

      return {
        msg: "Copied successfully.",
        newPath: "/" + newPath.replace(file_path, ""),
        newName: path.basename(newPath) + path.extname(newPath),
      };
    },
    {
      body: t.Object({
        oldPath: t.String(),
        newPath: t.String(),
      }),
    }
  )
  .put(
    "/move",
    async ({ body, set }) => {
      const { oldPath, newPath } = body;
      const oldPathname = path.join(file_path, oldPath);
      const newPathname = path.join(file_path, newPath);
      // Check if paths are inside the base directory
      if (!oldPathname.startsWith(file_path) || !newPathname.startsWith(file_path)) {
        set.status = 400;
        return {
          msg: "Invalid path. Paths must be inside the upload directory.",
        };
      }

      if (!fs.existsSync(oldPathname)) {
        set.status = 404;
        return {
          msg: "Old file or directory not found.",
        };
      }

      const invalidChars = /[<>:"|?*]/;
      if (invalidChars.test(path.basename(newPath))) {
        set.status = 400;
        return { msg: "Invalid characters in file name." };
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
          msg: "Failed to move. "
        };
      }
    },
    {
      body: t.Object({
        oldPath: t.String(),
        newPath: t.String(),
      }),
    }
  )
