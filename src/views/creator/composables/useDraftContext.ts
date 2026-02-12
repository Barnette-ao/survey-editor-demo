import { useSurveyId } from "@/views/creator/composables/useSurveyId";
import { useDraftMapStore } from '@/stores/draftMapStore'
import { DraftStorageService } from "../services/DraftStorageService";

export function useDraftContext() {
  const { surveyId } = useSurveyId()
  const draftMapStore = useDraftMapStore()
  
  const draft:DraftStorageService = draftMapStore.getDraft(surveyId) 
  if(!draftMapStore.hasOpened()){
    draft.openWithRunningState()
  }
  
  const draftState = computed(() => draft.draftState.value);

  return {
    draft,
    draftState
  }
}

