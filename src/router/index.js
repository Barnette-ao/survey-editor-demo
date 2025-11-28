import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/QuestionnaireList.vue')
  },
  {
    path: '/creator',
    name: 'Creator',
    component: () => import('../views/creator/index.vue')
  },
  {
    path: '/creator/:id',
    name: 'CreatorEdit',
    component: () => import('../views/creator/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
