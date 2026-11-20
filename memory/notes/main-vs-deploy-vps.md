# `main` và `deploy-vps`

**Từ 2026-11-21 hai nhánh trùng nhau.** `main` được fast-forward lên `deploy-vps` (commit `1f57f34`), và từ đó mỗi lần push đều đẩy cả hai: `git push origin deploy-vps && git push origin deploy-vps:main`. Vẫn commit trên `deploy-vps`, không commit trực tiếp trên `main`. Push `main` bị từ chối (không fast-forward) thì hỏi user, không force push.

## Lịch sử: `main` cũ (trước 2026-11-21)

`main` cũ chỉ có 2 commit (`Initial commit`, `first commit`). Gặp clone / tài liệu cũ dựa trên bản đó thì nhớ các khác biệt:

| Mục | `main` cũ | `deploy-vps` |
|---|---|---|
| Cổng backend, target proxy của Vite | 4544 | **4566** |
| Output build frontend | `../../public` (ra ngoài repo) | `../backend/public` |
| `.env.example` | `SECRET`, `DATABASE_URL="file:./dev.db"` (sai) | `JWT_SECRET`, MySQL |
| Script build/start | Không có | `build`, `build:client`, `build:server`, `start` |
