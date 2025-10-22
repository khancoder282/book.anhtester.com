export function createBlackListToken() {
  // Map để lưu token và thời điểm hết hạn
  const blackListToken = new Map<string, number>();

  // Hàm dọn dẹp token hết hạn định kỳ
  function cleanup() {
    const now = Date.now() / 1000;
    for (const [token, exp] of blackListToken.entries()) {
      if (exp <= now) {
        blackListToken.delete(token);
      }
    }
  }

  // Dọn dẹp mỗi 5 phút
  setInterval(cleanup, 5 * 60 * 1000).unref();

  return {
    /**
     * Thêm token vào blacklist.
     * @param token Token JWT cần thu hồi
     */
    add: (token: string) => {
      const payload = JSON.parse(atob(token.split(".")[1]));
      blackListToken.set(token, payload.exp);
    },

    /**
     * Kiểm tra token có bị thu hồi hay chưa.
     */
    has: (token: string) => blackListToken.has(token),

    /**
     * Xóa thủ công 1 token khỏi blacklist.
     */
    delete: (token: string) => blackListToken.delete(token),

    /**
     * Dọn toàn bộ danh sách (nếu cần).
     */
    clear: () => blackListToken.clear(),

    /**
     * Dọn thủ công các token hết hạn (nếu muốn trigger bằng tay).
     */
    cleanup,
  };
}
