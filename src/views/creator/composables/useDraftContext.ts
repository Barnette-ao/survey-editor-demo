import { debounce } from "lodash-es"
import { useSurveyId } from "@/views/creator/composables/useSurveyId";
import { useDraftMapStore } from '@/stores/draftMapStore'
import { DraftStorageService } from "../services/DraftStorageService";
import { onMounted, onUnmounted } from "vue";

export function useDraftContext() {
  const { surveyId } = useSurveyId()
  const draftMapStore = useDraftMapStore()
  
  const draft:DraftStorageService = draftMapStore.getDraft(surveyId) 
  draft.open()
  
  const draftState = computed(() => draft.draftState.value);

  const saveDraft = debounce(() => {
    draft.saveDraft()
  }, 500)

  watch(
    () => draftState.value,
    () => {
      saveDraft()
    },
    { deep: true }
  )

  // 浏览器刷新/关闭时保存草稿
  const handleBeforeUnload = () => {
    draft.saveDraft()
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    draft,
    draftState
  }
}

