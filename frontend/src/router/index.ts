import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/LandingView.vue') },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/catalogo', component: () => import('../views/CatalogoView.vue') },
    { path: '/carrito', component: () => import('../views/CarritoView.vue') },
    {
      path: '/mis-compras',
      component: () => import('../views/MisComprasView.vue'),
      meta: { requiresAuth: true, roles: ['cliente'] },
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor', 'gerente'] },
    },
    {
      path: '/productos',
      component: () => import('../views/ProductosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'gerente', 'bodeguero'] },
    },
    {
      path: '/clientes',
      component: () => import('../views/ClientesView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor'] },
    },
    {
      path: '/ventas',
      component: () => import('../views/VentasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor', 'gerente'] },
    },
    {
      path: '/ventas/:id',
      component: () => import('../views/VentaDetalleView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor', 'gerente'] },
    },
    {
      path: '/compras',
      component: () => import('../views/ComprasView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'gerente', 'bodeguero'] },
    },
    {
      path: '/compras/:id',
      component: () => import('../views/CompraDetalleView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'gerente', 'bodeguero'] },
    },
    {
      path: '/reportes/productos-no-vendidos',
      component: () => import('../views/ProductosNoVendidosView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor', 'gerente'] },
    },
    {
      path: '/reportes/clientes-sobre-promedio',
      component: () => import('../views/ClientesSobrePromedioView.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'vendedor', 'gerente'] },
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
    if (auth.rol === 'bodeguero') return '/productos'
    if (auth.rol === 'admin' || auth.rol === 'vendedor' || auth.rol === 'gerente') return '/dashboard'
    return '/login'
  }
})

export default router
