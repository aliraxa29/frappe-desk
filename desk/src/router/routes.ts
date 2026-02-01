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
  {
    path: '/:app/:doctype',
    component: () => import('../views/ListView.vue'),
    name: 'ListView'
  },
  {
    path: '/:app/:doctype([A-Za-z][A-Za-z0-9\\s-]*)/new-:hash',
    component: () => import('../views/FormView.vue'),
    name: 'NewForm'
  },
  {
    path: '/:app/:doctype([A-Za-z][A-Za-z0-9\\s-]*)/:name',
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