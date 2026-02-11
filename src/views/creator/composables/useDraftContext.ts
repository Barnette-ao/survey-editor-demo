import { useSurveyId } from "@/views/creator/composables/useSurveyId";
import { useDraftMapStore } from '@/stores/draftMapStore'

export function useDraftContext() {
  const { surveyId } = useSurveyId()
  const draftMapStore = useDraftMapStore()
  
  const draft:any = draftMapStore.getDraft(surveyId) 
  if(!draftMapStore.hasOpened()){
    draft.openWithRunningState()
  }
  
  const draftState = computed(() => draft.draftState.value);

  return {
    draft,
    draftState
  }
}

