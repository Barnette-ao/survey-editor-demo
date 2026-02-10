import type { Command } from "@/views/creator/services/DraftStorageService"
import { addPage } from "@/views/creator/config/page"
import { deletePage } from "@/views/creator/config/page"

export function createAddPageCommand(payload: {
  selectedQuestionId: string
  pageIndex: number
  isPageSelected: boolean
}): Command {
  let addedPageIndex: number = -1
  let deletedPage: any = null
  
  return {
    execute(state: any) {
      // 记录添加前的页面数量，用于确定新页面的索引
      const pageCountBefore = state.pages.length
      
      // 执行添加页面操作
      const cloned = addPage(
        state,
        payload.selectedQuestionId,
        payload.pageIndex,
        payload.isPageSelected
      )
      
      // 确定新添加的页面索引
      const pageCountAfter = cloned.pages.length
      if (pageCountAfter > pageCountBefore) {
        // 找到新添加的页面索引
        // 根据不同的添加逻辑，新页面可能在不同位置
        if (payload.selectedQuestionId === "" && !payload.isPageSelected) {
          // 在最后添加
          addedPageIndex = pageCountAfter - 1
        } else if (payload.isPageSelected) {
          // 在指定页面前添加
          addedPageIndex = payload.pageIndex + 1
        } else {
          // 在选中元素后添加或分割页面
          addedPageIndex = payload.pageIndex + 1
        }
      }
      
      return cloned
    },

    undo(state: any) {
      // 删除添加的页面
      if (addedPageIndex >= 0 && addedPageIndex < state.pages.length) {
        deletedPage = state.pages[addedPageIndex]
        const cloned = deletePage(state, deletedPage, addedPageIndex)
        return cloned
      }
      return state
    }
  }
}
