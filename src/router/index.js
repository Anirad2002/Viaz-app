import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/onboarding' },
  { path: '/onboarding', component: () => import('../views/OnboardingView.vue'), meta: { layout: 'blank' } },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { layout: 'app' } },
  { path: '/scans', component: () => import('../views/ScansView.vue'), meta: { layout: 'app' } },
  { path: '/scans/:id', component: () => import('../views/ScanDetailView.vue'), meta: { layout: 'app' } },
  { path: '/reports', component: () => import('../views/ReportsView.vue'), meta: { layout: 'app' } },
  { path: '/reports/:id', component: () => import('../views/ReportDetailView.vue'), meta: { layout: 'app' } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
