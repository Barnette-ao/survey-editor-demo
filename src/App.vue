<template>
  <router-view />
</template>

<script setup>
// import { ref, onMounted } from 'vue'
// // import SurveyEditor from '@/views/creator/index.vue'
// // import SurveyEntry from '@/views/entry/index.vue'
// import { SurveyStorageService} from '@/views/creator/services/SurveyStorageService'
// import { generateUUID } from '@/views/creator/config/helpers'


// const appService = new SurveyStorageService()

// /**
//  * 应用级模式
//  * entry | editing
//  */
// const modeType = ref('entry')


// /**
//  * Entry：新建问卷
//  */
// const handleCreateSurvey = (newSurveyId) => {
//   const id = generateUUID()
//   appService.setActiveSurveyId(id)
//   modeType.value = 'editing'
// }

// /**
//  * Entry：打开已有问卷
//  */
// const handleOpenSurvey = (id) => {
//   appService.setActiveSurveyId(id)
//   modeType.value = 'editing'
// }

// /**
//  * Editor：退出编辑器
//  */
// const handleExitEditor = () => {
//   modeType.value = 'entry'
//   appService.setActiveSurveyId("")
// }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}
</style>
