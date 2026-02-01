import { useRoute } from 'vue-router'
import { SurveyStorageService} from '@/views/creator/services/SurveyStorageService'

export function useSurveyContext() {
  const route = useRoute()
  const storage = new SurveyStorageService()

  const surveyId = computed(() => {
    return route.params.surveyId as string
  })

  function loadInitialRawSettings() {
    if (!surveyId.value) {
      throw new Error("surveyId missing in route")
    }

    // 兜底策略在这里
    const DEFAULT_COUNT = 1

    return storage.loadRawSettings(
      DEFAULT_COUNT,
      surveyId.value
    )
  }

  function saveFromJsonEditor(storageSettings: unknown) {
    storage.saveFromJsonEditor(surveyId.value, storageSettings)
  }

  function saveRuntimeSettings(runtimeSettings: unknown) {
    storage.saveRuntimeSettings(surveyId.value, runtimeSettings)
  }

  // 顺手做一次同步，用于刷新恢复
  watch(
    surveyId,
    (id) => {
      if (id) storage.setLastSurveyId(id)
    },
    { immediate: true }
  )

  return {
    surveyId,
    loadInitialRawSettings,
    saveFromJsonEditor,
    saveRuntimeSettings
  }
}
