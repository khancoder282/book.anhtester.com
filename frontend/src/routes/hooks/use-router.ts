import { useMemo } from 'react';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export function useRouter() {
  const navigate = useNavigate();

  const router = useMemo(
    () => ({
      back: (href?: string) => window.history.length > 1 ? navigate(-1) : navigate(href ?? "/", { viewTransition: true }),
      forward: () => navigate(1),
      refresh: () => navigate(0),
      push: (href: string) => navigate(href, { viewTransition: true }),
      replace: (href: string) => navigate(href, { replace: true, viewTransition: true }),
    }),
    [navigate]
  );

  return router;
}
