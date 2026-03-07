import type { Command } from "@/views/creator/services/DraftStorageService"
import {
  insertElement,
  deleteQuestion,
  findElementPosition
} from "@/views/creator/utils/element"
import { snapshot } from '@/views/creator/utils/shared'

export function createDeleteQuestionCommand(payload: {
  elementId: string
}): Command {
  let deletedElement : any
  let deletedElementIndex:string
  let deletedPageIndex:string

  return {
    execute(state:any) {
      const rawState = snapshot(state)
      const { elementIndex, pageIndex } = findElementPosition(rawState, payload.elementId)
      if (elementIndex !== undefined && pageIndex !== undefined) {
        // 获取被删除元素的信息
        deletedElement = rawState.pages[pageIndex].elements[elementIndex]  
        deletedElementIndex = elementIndex
        deletedPageIndex = pageIndex
      }

      // 执行删除操作
      const cloned = deleteQuestion(rawState, payload.elementId)
      
      return cloned
    },

    undo(state) {
      const rawState = snapshot(state) 
      const cloned = insertElement(
        rawState,
        deletedElement,
        deletedPageIndex,
        deletedElementIndex
      )
     
      return cloned
    }
  }
}
