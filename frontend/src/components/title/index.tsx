import { useEffect } from 'react';

function reactNodeToText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join('');
  if (typeof node === 'object' && node && 'props' in node)
    return reactNodeToText((node as any).props.children);
  return '';
}

export default function Title({ children }: React.PropsWithChildren) {
  useEffect(() => {
    document.title = reactNodeToText(children);
  }, [children]);

  return null;
}
