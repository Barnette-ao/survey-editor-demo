import type { Command } from "@/views/creator/services/DraftStorageService"
import { deletePage } from "@/views/creator/config/page/delete"
import { snapshot } from '@/views/creator/config/shared'

export function createDeletePageCommand(payload: {
  pageIndex: number
}): Command {
  let deletedPage: any = null
  let deletedPageElements: any[] = []
  
  return {
    execute(state: any) {
      const rawState = snapshot(state)
      // 保存被删除页面的信息用于undo
      if (payload.pageIndex >= 0 && payload.pageIndex < rawState.pages.length) {
        deletedPage = structuredClone(rawState.pages[payload.pageIndex])
        deletedPageElements = deletedPage.elements || []
      }
      
      // 执行删除页面操作
      const cloned = deletePage(
        rawState,
        rawState.pages[payload.pageIndex],
        payload.pageIndex
      )
      
      return cloned
    },

    undo(state: any) {
      // 在原位置插入被删除的页面
      const rawState = snapshot(state)
      if (deletedPage) {
        rawState.pages.splice(
          payload.pageIndex, 
          0, 
          structuredClone(deletedPage)
        )
      }
      
      return structuredClone(rawState)
    }
  }
}
