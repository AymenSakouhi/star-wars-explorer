import { createBrowserRouter } from 'react-router-dom'
import { ErrorFallback } from '@/app/error-fallback'
import { RootLayout } from '@/app/layout/root-layout'
import { ResourceDetailPage } from '@/features/resource-detail/resource-detail-page'
import { ResourceListPage } from '@/features/resource-list/resource-list-page'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ':resource', element: <ResourceListPage /> },
      { path: ':resource/:id', element: <ResourceDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
