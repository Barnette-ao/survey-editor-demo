import { DraftStorageService } from '@/views/creator/services/DraftStorageService'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'

export const useDraftMapStore = defineStore('draftMap', () => {
  const draftMap = shallowReactive(new Map())

  function getDraft(surveyIdRef:ComputedRef) {
    const surveyId = surveyIdRef.value
    if (!draftMap.has(surveyId)) {
      const storage = new SurveyStorageService()
      const draft = new DraftStorageService(storage, surveyIdRef)
      draftMap.set(surveyId, draft)
    }
    return draftMap.get(surveyId)
  }

  return { getDraft }
})
