import type { Command } from "@/views/creator/services/DraftStorageService"
import { deletePage } from "@/views/creator/config/page/delete"

export function createDeletePageCommand(payload: {
  pageIndex: number
}): Command {
  let deletedPage: any = null
  let deletedPageElements: any[] = []
  
  return {
    execute(state: any) {
      // 保存被删除页面的信息用于undo
      if (payload.pageIndex >= 0 && payload.pageIndex < state.pages.length) {
        deletedPage = structuredClone(state.pages[payload.pageIndex])
        deletedPageElements = deletedPage.elements || []
      }
      
      // 执行删除页面操作
      const cloned = deletePage(
        state,
        state.pages[payload.pageIndex],
        payload.pageIndex
      )
      
      return cloned
    },

    undo(state: any) {
      // 在原位置插入被删除的页面
      if (deletedPage) {
        state.pages.splice(payload.pageIndex, 0, structuredClone(deletedPage))
      }
      
      return structuredClone(state)
    }
  }
}
