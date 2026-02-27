import type { Command } from "@/views/creator/services/DraftStorageService"
import { deletePage,findPageIndexById } from "@/views/creator/config/page"
import { snapshot } from '@/views/creator/config/shared'

export function createDeletePageCommand(payload: {
  pageId: string
}): Command {
  let deletedPage: any = null
  let prePageElementLen:number
  let pageIndex:number

  return {
    execute(state: any) {
      const rawState = snapshot(state)
      // 保存被删除页面的信息用于undo
      pageIndex = findPageIndexById(rawState, payload.pageId)
      if(pageIndex === -1) return rawState

      deletedPage = structuredClone(rawState.pages[pageIndex])
      prePageElementLen = rawState.pages[pageIndex - 1].elements.length
      
      const cloned = deletePage( rawState, pageIndex)
      return cloned
    },

    undo(state: any) {
      const rawState = snapshot(state)
      // 将前一页中execute操作加入的题目全部删除，无论删除的是非空也还是空页都可以收敛于这一句
      rawState.pages[pageIndex - 1].elements.splice(prePageElementLen)
      // 在原位置插入被删除的页面
      rawState.pages.splice(pageIndex, 0, deletedPage)
      return rawState
    }
  }
}
