import fs from "fs";
import path from "path";

/** Absolute path of the upload directory (`backend/<FILEDIR>`). */
export const UPLOAD_ROOT = path.resolve(process.cwd(), Bun.env.FILEDIR || "upload");

/** Is `p` the directory `parent` itself or somewhere inside it? Both must be absolute + resolved. */
export const isInsideOf = (p: string, parent: string) =>
  p === parent || p.startsWith(parent.endsWith(path.sep) ? parent : parent + path.sep);

/**
 * Resolve a path sent by a client (e.g. "/folder/a.png") against `root`.
 * Returns the absolute path, or `null` when the path is not acceptable:
 * NUL / control characters, Windows drive letters or UNC paths ("C:\..", "\\server"),
 * or anything that ends up outside `root` after `..` segments are resolved.
 * Backslashes are treated as separators on every OS so "..\\x" is caught on Linux too.
 * The input must already be URL-decoded exactly once by the caller.
 */
export function resolveInside(root: string, userPath: string | undefined | null): string | null {
  if (typeof userPath !== "string") return null;
  if (/[\u0000-\u001f]/.test(userPath)) return null;
  const unified = userPath.replace(/\\/g, "/");
  if (/^[a-zA-Z]:/.test(unified) || unified.startsWith("//")) return null;
  // Remaining "drive letter" anywhere (e.g. "/C:/x") is never valid in this app
  if (/(^|\/)[a-zA-Z]:/.test(unified)) return null;
  const relative = unified.replace(/^\/+/, "");
  const resolved = path.resolve(root, relative);
  return isInsideOf(resolved, root) ? resolved : null;
}

/** Resolve a client path inside the upload directory (see `resolveInside`). */
export const resolveUpload = (userPath: string | undefined | null) =>
  resolveInside(UPLOAD_ROOT, userPath);

/** Path relative to the upload directory, always with "/" separators and a leading "/". */
export const toClientPath = (absolute: string) =>
  "/" + path.relative(UPLOAD_ROOT, absolute).split(path.sep).join("/");

/**
 * A single file or folder name (no directories). Rejects empty names, "." and "..",
 * path separators, characters Windows does not allow and control characters.
 */
export function isValidName(name: string | undefined | null): boolean {
  if (typeof name !== "string") return false;
  const n = name.trim();
  if (!n || n.length > 255) return false;
  if (n === "." || n === "..") return false;
  if (/[\u0000-\u001f<>:"/\\|?*]/.test(n)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Upload whitelist: decided by the file CONTENT (magic bytes) + extension,
// never by the Content-Type the client declares.
// ---------------------------------------------------------------------------

type Kind = { ext: string[]; mime: string; match: (b: Uint8Array) => boolean };

const startsWith = (b: Uint8Array, sig: number[], offset = 0) =>
  b.length >= offset + sig.length && sig.every((v, i) => b[offset + i] === v);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

const KINDS: Kind[] = [
  { ext: [".jpg", ".jpeg"], mime: "image/jpeg", match: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  {
    ext: [".png"],
    mime: "image/png",
    match: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    ext: [".gif"],
    mime: "image/gif",
    match: (b) => startsWith(b, ascii("GIF87a")) || startsWith(b, ascii("GIF89a")),
  },
  {
    ext: [".webp"],
    mime: "image/webp",
    match: (b) => startsWith(b, ascii("RIFF")) && startsWith(b, ascii("WEBP"), 8),
  },
  { ext: [".bmp"], mime: "image/bmp", match: (b) => startsWith(b, ascii("BM")) },
  { ext: [".pdf"], mime: "application/pdf", match: (b) => startsWith(b, ascii("%PDF-")) },
  {
    ext: [".zip"],
    mime: "application/zip",
    match: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) || startsWith(b, [0x50, 0x4b, 0x05, 0x06]),
  },
  {
    ext: [".rar"],
    mime: "application/vnd.rar",
    match: (b) => startsWith(b, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]),
  },
  {
    ext: [".7z"],
    mime: "application/x-7z-compressed",
    match: (b) => startsWith(b, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
  },
  { ext: [".gz", ".tgz"], mime: "application/gzip", match: (b) => startsWith(b, [0x1f, 0x8b]) },
  { ext: [".bz2"], mime: "application/x-bzip2", match: (b) => startsWith(b, ascii("BZh")) },
  { ext: [".tar"], mime: "application/x-tar", match: (b) => startsWith(b, ascii("ustar"), 257) },
];

/** Extensions accepted by `POST /api/file` (content must match the extension). */
export const ALLOWED_UPLOAD_EXT = KINDS.flatMap((k) => k.ext);

/** Human readable list for messages / Swagger. */
export const ALLOWED_UPLOAD_TEXT = ALLOWED_UPLOAD_EXT.map((e) => e.slice(1)).join(", ");

/**
 * Check an uploaded file: extension must be in the whitelist and the first bytes
 * must be that format. SVG, HTML, JS... are never accepted (they can carry scripts).
 */
export async function isAllowedUpload(file: File): Promise<boolean> {
  const ext = path.extname(file.name).toLowerCase();
  const kind = KINDS.find((k) => k.ext.includes(ext));
  if (!kind) return false;
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  return kind.match(head);
}

/**
 * Extensions a renamed / moved / copied FILE may end up with: the upload whitelist
 * plus text formats already present in the seed data and the built-in "$image-404.svg".
 * Serving is safe for all of them (see `serveFile`), this only stops e.g. "a.png" -> "a.html".
 */
export const ALLOWED_KEEP_EXT = [...ALLOWED_UPLOAD_EXT, ".txt", ".csv", ".md", ".svg"];

// ---------------------------------------------------------------------------
// Serving a stored file safely (used by GET /view-file/* and GET /api/file?path=<file>)
// ---------------------------------------------------------------------------

/** Raster images are shown inline; everything else is sent as a download. */
const INLINE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
};

/** Non-inline types that keep a meaningful Content-Type (still sent as attachment). */
const ATTACHMENT_TYPES: Record<string, string> = {
  // <img src="x.svg"> still renders: browsers ignore Content-Disposition for sub-resources,
  // and CSP `sandbox` blocks scripts if someone opens the SVG directly.
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
  ".gz": "application/gzip",
  ".tgz": "application/gzip",
  ".bz2": "application/x-bzip2",
  ".tar": "application/x-tar",
};

/** Content-Type a stored file is served with (HTML/JS/XML/unknown -> octet-stream). */
export function servedContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return INLINE_TYPES[ext] ?? ATTACHMENT_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Build the response for a file inside the upload directory:
 * - `Content-Type` from the extension (never "text/html"), `X-Content-Type-Options: nosniff`
 * - `Content-Disposition: attachment` for anything that is not a raster image
 * - `Content-Security-Policy: default-src 'none'; sandbox` so even a file opened directly
 *   cannot run scripts on this origin (and so cannot read the accessToken in localStorage).
 */
export function serveFile(absPath: string): Response {
  const ext = path.extname(absPath).toLowerCase();
  const inline = ext in INLINE_TYPES;
  const name = path.basename(absPath);
  const headers: Record<string, string> = {
    "Content-Type": servedContentType(absPath),
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
  };
  return new Response(Bun.file(absPath), { headers });
}

/** Total size in bytes of every regular file under `dir` (symlinks are not followed). Works on Windows and Linux. */
export async function dirSize(dir: string): Promise<number> {
  let total = 0;
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await dirSize(full);
    } else if (entry.isFile()) {
      try {
        total += (await fs.promises.stat(full)).size;
      } catch {
        // file removed while walking: ignore
      }
    }
  }
  return total;
}
