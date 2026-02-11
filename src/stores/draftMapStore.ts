import { DraftStorageService } from '@/views/creator/services/DraftStorageService'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'

export const useDraftMapStore = defineStore('draftMap', () => {
  const draftMap = shallowReactive(new Map<string, DraftStorageService>())
  let opened:boolean

  function getDraft(surveyIdRef: ComputedRef<string>) {
    const id = surveyIdRef.value

    if (!draftMap.has(id)) {
      opened = false
      const storage = new SurveyStorageService()
      const draft = new DraftStorageService(storage, surveyIdRef)
      draftMap.set(id, draft)
    }
    opened = true
    return draftMap.get(id)!
  }

  // 该函数一定与getDraft函数有时序上的耦合，必然是getDraft在前，hasOpened在后
  function hasOpened(){
    return opened 
  }

  return {
    getDraft,
    hasOpened
  }
})

