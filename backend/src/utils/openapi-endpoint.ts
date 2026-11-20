/**
 * Swagger (Scalar) hiện tên API (`detail.summary`) làm tiêu đề, còn method + đường dẫn chỉ nằm trong khung code mẫu.
 * Scalar không có tuỳ chọn hiện cả hai, nên chèn dòng `METHOD /api/...` vào đầu mô tả của mọi API (2026-11-21).
 * Gọi một lần sau khi đã đăng ký hết route; tài liệu OpenAPI được sinh lúc có request đầu tiên tới /swagger/json.
 */
type RouteLike = {
  method: string;
  path: string;
  hooks?: { detail?: { hide?: boolean; description?: string } };
};

export function showEndpointInDocs(routes: readonly RouteLike[]) {
  for (const route of routes) {
    const detail = route.hooks?.detail;
    if (!detail || detail.hide || !route.path.startsWith("/api/")) continue;
    const endpoint = `\`${route.method.toUpperCase()} ${route.path.replace(/:([^/]+)/g, "{$1}")}\``;
    const description = detail.description ?? "";
    // Một object `detail` có thể dùng chung cho nhiều route: không chèn hai lần
    if (description.startsWith(endpoint)) continue;
    detail.description = description ? `${endpoint}\n\n${description}` : endpoint;
  }
}
