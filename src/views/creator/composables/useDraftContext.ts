import { debounce } from "lodash-es"
import { useSurveyId } from "@/views/creator/composables/useSurveyId";
import { useDraftMapStore } from '@/stores/draftMapStore'
import { DraftStorageService } from "../services/DraftStorageService";

export function useDraftContext() {
  const { surveyId } = useSurveyId()
  const draftMapStore = useDraftMapStore()
  
  const draft:DraftStorageService = draftMapStore.getDraft(surveyId) 
  draft.open()
  
  const draftState = computed(() => draft.draftState.value);

  const saveDraft = debounce(() => {
    draft.save()
  }, 500)

  watch(
    () => draftState.value,
    () => {
      saveDraft()
    },
    { deep: true }
  )

  return {
    draft,
    draftState
  }
}

