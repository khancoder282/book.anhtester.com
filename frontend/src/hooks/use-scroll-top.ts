import { useState, useEffect, useCallback } from 'react';

type ScrollElement = HTMLElement | Window | null;

export function useScrollTop(element?: React.RefObject<HTMLElement | null>) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    const target: ScrollElement = element?.current || window;

    if (!target) return;

    const scrollTop = 'scrollY' in target ? target.scrollY : target.scrollTop;
    const innerHeight = 'innerHeight' in target ? target.innerHeight : target.clientHeight;
    // const scrollHeight =
    //   target instanceof Window ? target.document.documentElement.scrollHeight : target.scrollHeight;

    const hasScrolledPastHalf = scrollTop > innerHeight / 2;
    // const hasEnoughContentLeft = scrollHeight - scrollTop - innerHeight > innerHeight / 3;

    setShowScrollTop(hasScrolledPastHalf);
  }, [element]);

  useEffect(() => {
    const target = element?.current || window;
    if (target) target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [handleScroll, element]);

  return [showScrollTop, handleScroll] as const;
}
