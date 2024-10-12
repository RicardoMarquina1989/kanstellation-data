import { lazy } from 'react'

// ** Document title
const TemplateTitle = '%s - KO.Date'

// ** Default Route
const DefaultRoute = '/login'

// ** Merge Routes
const Routes = [
  {
    path: '/incidents',
    component: lazy(() => import('../../views/IncidentsPage'))
  },
  {
    path: '/incident',
    component: lazy(() => import('../../views/IncidentDetailPage'))
  },
  {
    path: '/connections',
    component: lazy(() => import('../../views/ConnectionsPage'))
  },
  {
    path: '/my-data',
    component: lazy(() => import('../../views/MyDataPage'))
  },
  {
    path: '/my-data-table',
    component: lazy(() => import('../../views/MyDataTablePage'))
  },
  {
    path: '/my-data-table-column',
    component: lazy(() => import('../../views/MyDataTableColumnPage'))
  },
  {
    path: '/login',
    component: lazy(() => import('../../views/Login')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/register',
    component: lazy(() => import('../../views/Register')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/forgot-password',
    component: lazy(() => import('../../views/ForgotPassword')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/verify-email',
    component: lazy(() => import('../../views/VerifyEmail')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/reset-password',
    component: lazy(() => import('../../views/ResetPassword')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/two-step-verify',
    component: lazy(() => import('../../views/TwoStepVerify')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout'
  }
]

export { DefaultRoute, TemplateTitle, Routes }
