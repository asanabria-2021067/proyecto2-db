import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/catalogo', component: () => import('../views/CatalogoView.vue') },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor'] },
    },
    {
      path: '/productos',
      component: () => import('../views/ProductosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor'] },
    },
    {
      path: '/clientes',
      component: () => import('../views/ClientesView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor'] },
    },
    {
      path: '/ventas',
      component: () => import('../views/VentasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor'] },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }
  if (to.meta.roles && !(to.meta.roles as string[]).includes(auth.rol)) {
    if (auth.rol === 'cliente') return '/catalogo'
    return '/login'
  }
})

export default router
