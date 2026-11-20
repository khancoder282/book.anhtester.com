# Trạng thái git

Cập nhật 2026-11-21.

- Remote có 2 nhánh: `origin/main`, `origin/deploy-vps`, **trùng nhau** từ 2026-11-21. Làm và commit trên **`deploy-vps`** (local track `origin/deploy-vps`); push thì đẩy cả hai: `git push origin deploy-vps && git push origin deploy-vps:main`. Chi tiết: [main-vs-deploy-vps.md](main-vs-deploy-vps.md).
- **Stash** `stash@{0}` "bun.lock changes from bun install" được tạo trên `main` cũ. Nó chỉ chứa dòng `"configVersion": 0` mà bun 1.4.5 tự thêm vào `backend/bun.lock` và `frontend/bun.lock`, không quan trọng, có thể `git stash drop`.
- `capabilities.json` là file của user, `.mcp.json` dùng làm `CAPABILITIES_CONFIG` cho Appium.

File bị gitignore nên không hiện trong git, nhưng cần có trên máy: `backend/.env`, `backend/public/` (bản build frontend), `backend/upload/`.
