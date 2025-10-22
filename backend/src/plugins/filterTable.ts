export function filterTable(search: string | undefined, cols: string[] = []) {
  if (!search) return undefined;
  return isJSONString(search)
    ? JSON.parse(search)
    : {
        OR: cols.map((col) => ({ [col]: { contains: search } })),
      };
}

function isJSONString(str: string): boolean {
  if (typeof str !== "string") return false;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}
