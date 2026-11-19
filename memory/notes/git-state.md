# Trạng thái git

Ghi lúc 2026-11-20.

- Remote có 2 nhánh: `origin/main`, `origin/deploy-vps`. Đang làm trên **`deploy-vps`** (local track `origin/deploy-vps`).
- **Stash** `stash@{0}` "bun.lock changes from bun install" được tạo trên `main`. Nó chỉ chứa dòng `"configVersion": 0` mà bun 1.4.5 tự thêm vào `backend/bun.lock` và `frontend/bun.lock`, không quan trọng, có thể `git stash drop`.

## Thay đổi chưa commit trên `deploy-vps`

| File | Thay đổi |
|---|---|
| `frontend/vite.config.ts` | Thêm proxy `/swagger` sang `http://localhost:4566` |
| `frontend/src/components/fields/password-field.tsx` | Đổi tên hàm bên trong `forwardRef` thành `PasswordFieldInner` để qua ESLint `no-shadow` |
| `CLAUDE.md` | Mới |
| `memory/` | Mới (thư mục này) |
| `.claude/launch.json` | Mới, cấu hình dev server cho browser pane của Claude |
| `.mcp.json`, `.claude/playwright-mcp-config.json` | Mới, cấu hình Playwright MCP và Appium MCP |
| `capabilities.json` | Chưa track. File của user (có từ 2026-11-12), `.mcp.json` dùng làm `CAPABILITIES_CONFIG` cho Appium |

File bị gitignore nên không hiện trong git, nhưng cần có trên máy: `backend/.env`, `backend/public/` (bản build frontend), `backend/upload/`.
