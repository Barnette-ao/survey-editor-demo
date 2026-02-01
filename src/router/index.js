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
    component: () => import('@/views/creator/index.vue'), // SurveyEditor 壳子
    props: true,
    children: [
      {
        path: '',
        redirect: { name: 'editor-design' },
      },
      {
        path: 'design',
        name: 'editor-design',
        component: () => import('@/views/creator/pages/design.vue'),
      },
      {
        path: 'preview',
        name: 'editor-preview',
        component: () => import('@/views/creator/pages/preview.vue'),
      },
      {
        path: 'json',
        name: 'editor-json',
        component: () => import('@/views/creator/pages/jsonEditor.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
