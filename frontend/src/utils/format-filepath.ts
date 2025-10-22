export function formatfilePath(path?: string) {
  return path ? `/api/file?path=${path}` : '';
}
