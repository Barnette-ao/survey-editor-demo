import { createRouter, createWebHistory } from 'vue-router'
import SurveyEntry from '@/views/entry/index.vue'
import SurveyEditor from '@/views/creator/index.vue'

const routes = [
  {
    path: '/',
    name: 'entry',
    component: () => import('@/views/entry/index.vue')
  },
  {
    path: '/editor/:surveyId',
    name: 'editor',
    component: () => import('@/views/creator/index.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
