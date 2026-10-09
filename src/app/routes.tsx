import type { RouteObject } from 'react-router';

import { HomePage, ProtocolPage, UploadsPage } from '@/features/protocols';

import { AppLayout } from './AppLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

/** Every page of the app. Features add their routes here. */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'uploads', element: <UploadsPage /> },
      { path: 'protocols/:protocolId', element: <ProtocolPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
