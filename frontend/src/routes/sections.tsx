import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { CheckAuth } from './components/check-auth';
import { renderFallback } from './components/fallback';

// ----------------------------------------------------------------------

const DashboardLayout = lazy(() => import('src/layouts/dashboard'));
// ----------------------------------------------------------------------

const routesSection: RouteObject[] = [
  {
    element: (
      <CheckAuth fallback={renderFallback()}>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </CheckAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/user-management" replace />,
      },
      {
        path: 'user-management',
        Component: lazy(() => import('src/pages/user-mgt')),
      },
      {
        path: 'user-management/my-profile',
        Component: lazy(() => import('src/pages/user-mgt/profile')),
      },
      {
        path: 'file-management',
        Component: lazy(() => import('src/pages/file-mgt')),
      },
      {
        path: 'book-management',
        Component: lazy(() => import('src/pages/book-mgt')),
      },
      {
        path: 'book-management/handle',
        Component: lazy(() => import('src/pages/book-mgt/add-page')),
      },
      {
        path: 'book-management/detail/:slug',
        Component: lazy(() => import('src/pages/book-mgt/detail')),
      },
      {
        path: 'promotion-book-management',
        Component: lazy(() => import('src/pages/promotions-mgt/page')),
      },
      {
        path: 'promotion-book-management/handle',
        Component: lazy(() => import('src/pages/promotions-mgt/handle')),
      },
    ],
  },
  {
    path: 'test',
    Component: lazy(() => import('src/pages/test')),
  },
  {
    path: 'sign-up',
    Component: lazy(() => import('src/pages/user-mgt/sign-up')),
  },
  {
    path: 'sign-in',
    Component: lazy(() => import('src/pages/sign-in')),
  },
  { path: '*', Component: lazy(() => import('src/pages/not-found-view/index')) },
];

export default routesSection;
