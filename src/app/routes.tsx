import { Navigate, type RouteObject } from 'react-router';

import { AppLayout } from './AppLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

/** Every page of the app. Features add their routes here. */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/convert" replace /> },
      { path: 'convert', element: <PlaceholderPage title="Convert" /> },
      { path: 'review', element: <PlaceholderPage title="Review" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
