export const routes = [
  {
    path: '/',
    component: () => import('../views/DeskView.vue'),
    name: 'Desk'
  },
  {
    path: '/:app',
    component: () => import('../views/AppView.vue'),
    name: 'App'
  },
  // Page, Report, Dashboard routes - must be before generic /:app/:doctype
  {
    path: '/:app/page/:page',
    component: () => import('../views/PageView.vue'),
    name: 'PageView'
  },
  {
    path: '/:app/report/:report',
    component: () => import('../views/ReportView.vue'),
    name: 'ReportView'
  },
  {
    path: '/:app/dashboard/:dashboard',
    component: () => import('../views/DashboardView.vue'),
    name: 'DashboardView'
  },
  {
    path: '/:app/workspace/:workspace',
    component: () => import('../views/WorkspaceView.vue'),
    name: 'WorkspaceView'
  },
  {
    path: '/:app/module/:module',
    component: () => import('../views/ModuleView.vue'),
    name: 'ModuleView'
  },
  {
    path: '/:app/:doctype',
    component: () => import('../views/ListView.vue'),
    name: 'ListView'
  },
  {
    path: '/:app/:doctype/new',
    component: () => import('../views/FormView.vue'),
    name: 'NewForm'
  },
  {
    path: '/:app/:doctype/:name',
    component: () => import('../views/FormView.vue'),
    name: 'EditForm'
  },
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    name: 'Login'
  },
  {
    path: '/reset-password',
    component: () => import('../views/ResetPasswordView.vue'),
    name: 'ResetPassword'
  },
  {
    // catch all unmatched routes
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFound.vue'),
    name: 'NotFound'
  }
]