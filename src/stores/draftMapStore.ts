import { DraftStorageService } from '@/views/creator/services/DraftStorageService'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'

export const useDraftMapStore = defineStore('draftMap', () => {
  const draftMap = shallowReactive(new Map<string, DraftStorageService>())

  function getDraft(surveyIdRef: ComputedRef<string>) {
    const id = surveyIdRef.value

    if (!draftMap.has(id)) {
      const storage = new SurveyStorageService()
      const draft = new DraftStorageService(storage, surveyIdRef)
      draftMap.set(id, draft)
    }
    return draftMap.get(id)!
  }

  return {
    getDraft
  }
})

