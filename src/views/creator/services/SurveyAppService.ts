import { useDraftMapStore } from '@/stores/draftMapStore'

export class SurveyAppService {
  private draft

  constructor(surveyId:ComputedRef) {
    const draftMapStore = useDraftMapStore()
    this.draft = draftMapStore.getDraft(surveyId)
  }

  getDraft() {
    return this.draft
  }

  loadRunningState() {
    return this.draft.openWithRunningState()
  }

  loadStorageState() {
    return this.draft.openWithStorageState()
  }

  // Design组件，预览页面，草稿态 -> 确定态
  commitRuntimeNow() {
    this.draft.commitRuntime()
  }
  
  // JSON编辑器页面，草稿态 -> 确定态
  commitStorageNow() {
    this.draft.commitStorage()
  }
}
