import type { Command } from "@/views/creator/services/DraftStorageService"
import { addPage,deletePage,findPageIndexById } from "@/views/creator/utils/page"
import { snapshot } from '@/views/creator/utils/shared'

export function createAddPageCommand(payload: {
  selectedQuestionId: string
  pageIndex: number
  isPageSelected: boolean
}): Command {
  let newPageId: string
  
  return {
    execute(state: any) {
      const rawState = snapshot(state)
      // 执行添加页面操作
      const pageInfo = addPage(
        rawState,
        payload.selectedQuestionId,
        payload.pageIndex,
        payload.isPageSelected
      )    
      
      newPageId = pageInfo.newPageId!  
      return pageInfo.cloned
    },

    undo(state: any) {
      const rawState = snapshot(state)
      const newPageIndex = findPageIndexById(rawState, newPageId)
      const cloned = deletePage(rawState, newPageIndex)
      return cloned
    }
  }
}
