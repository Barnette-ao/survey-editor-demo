import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'


export function useSurveyId() {
  const route = useRoute()
  const storage = new SurveyStorageService()
  const surveyId = computed(() => {
    const id = route.params.surveyId
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid surveyId in route')
    }
    return id
  })
  
  watch(
    surveyId,
    (id) => {
      if (id) storage.setLastSurveyId(id)
    },
    { immediate: true }
  )

  return {
    surveyId,  
  }
}
