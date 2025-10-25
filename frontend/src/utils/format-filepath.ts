export function formatFilePath(path?: string) {
  return path ? `/api/file?path=${path}` : '';
}
