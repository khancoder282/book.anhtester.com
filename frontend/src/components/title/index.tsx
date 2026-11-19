import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

function reactNodeToText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join('');
  if (typeof node === 'object' && node && 'props' in node)
    return reactNodeToText((node as any).props.children);
  return '';
}

/**
 * Tiêu đề tab của trang. Chạy sau tiêu đề mặc định theo route (`useRouteTitle` trong app.tsx),
 * nên phụ thuộc cả pathname để luôn ghi đè lại khi đổi route.
 */
export default function Title({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const text = reactNodeToText(children);

  useEffect(() => {
    document.title = text;
  }, [text, pathname]);

  return null;
}
