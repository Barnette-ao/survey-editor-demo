import { createRouter, createWebHistory } from 'vue-router'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'

const surveyStorageService = new SurveyStorageService() 

const routes = [
  {
    path: '/',
    name: 'entry',
    component: () => import('@/views/entry/index.vue')
  },
  {
    path: '/editor/:surveyId',
    component: () => import('@/views/creator/index.vue'), // SurveyEditor 壳子
    // 兜底如果手动修改了id，给出null,0,或者别的不合格的surveyId
    beforeEnter: (to) => {
      const surveyId = to.params.surveyId

      if (!surveyId || typeof surveyId !== "string" ) {
        return { name: 'entry' }
      }
      // 只能打开已有的问卷，不能随意创建问卷
      if(!surveyStorageService.exists(surveyId)){
        return { name: 'entry' }
      }
    },
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
