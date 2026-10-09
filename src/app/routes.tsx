import { Navigate, type RouteObject } from 'react-router';

import { ConvertPage, JobPage } from '@/features/convert';

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
      { path: 'convert', element: <ConvertPage /> },
      { path: 'convert/jobs/:jobId', element: <JobPage /> },
      { path: 'review', element: <PlaceholderPage title="Review" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
