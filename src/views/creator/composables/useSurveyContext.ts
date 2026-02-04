import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'
import { DraftStorageService } from '@/views/creator/services/DraftStorageService'

export function useSurveyContext() {
  const route = useRoute()
  const storage = new SurveyStorageService()

  const surveyId = computed(() => {
    const id = route.params.surveyId
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid surveyId in route')
    }
    return id
  })

  const draft = new DraftStorageService(storage, surveyId)

  function loadRunningState() {
    return draft.openWithRunningState()
  }

  function loadStorageState() {
    return draft.openWithStorageState()
  }

  function saveRuntimeNow(runtimeSettings: unknown) {
    // draft.replaceState(runtimeSettings)
  }

  function saveFromJsonEditorNow(storageSettings: unknown) {
    draft.replaceState(storageSettings)
  }

  // 明确的确定态入口
  function commitRuntimeNow() {
    draft.commitRuntime()
  }

  function commitStorageNow() {
    draft.commitStorage()
  }

  watch(
    surveyId,
    (id) => {
      if (id) storage.setLastSurveyId(id)
    },
    { immediate: true }
  )

  return {
    surveyId,
    draft,
    loadRunningState,
    loadStorageState,
    saveRuntimeNow,
    saveFromJsonEditorNow,
    commitRuntimeNow,
    commitStorageNow
  }
}
