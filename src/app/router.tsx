import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { BackofficeLayout } from '@/layouts/BackofficeLayout'
import { PrivateRoute } from '@/shared/router/PrivateRoute'
import { Home } from '@/pages/public/Home'
import { DesarrolloDetalle } from '@/pages/public/DesarrolloDetalle'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { BackofficeHomePage } from '@/features/home/pages/BackofficeHomePage'
import { DesarrollosListPage } from '@/features/desarrollo/pages/DesarrollosListPage'
import { DesarrolloFormPage } from '@/features/desarrollo/pages/DesarrolloFormPage'
import { ContenidoPage } from '@/features/contenido/pages/ContenidoPage'
import { WebPage } from '@/features/hero/pages/WebPage'
import { ConsultasPage } from '@/features/consultas/pages/ConsultasPage'
import { ROUTES } from '@/shared/router/routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'desarrollos/:slug', element: <DesarrolloDetalle /> },
    ],
  },
  {
    path: ROUTES.backofficeLogin,
    element: <LoginPage />,
  },
  {
    path: ROUTES.backoffice,
    element: <PrivateRoute />,
    children: [
      {
        element: <BackofficeLayout />,
        children: [
          { index: true, element: <BackofficeHomePage /> },
          { path: 'desarrollos', element: <DesarrollosListPage /> },
          { path: 'desarrollos/nuevo', element: <DesarrolloFormPage /> },
          { path: 'desarrollos/:id/editar', element: <DesarrolloFormPage /> },
          { path: 'contenido', element: <ContenidoPage /> },
          { path: 'web', element: <WebPage /> },
          { path: 'consultas', element: <ConsultasPage /> },
        ],
      },
    ],
  },
])
