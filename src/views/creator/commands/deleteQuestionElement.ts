import type { Command } from "@/views/creator/services/DraftStorageService"

import {
  addQuestionElement,
  deleteQuestion,
  getSelectedElementPosition
} from "@/views/creator/config/element"

export function createDeleteQuestionCommand(payload: {
  elementId: string
}): Command {
  let previousElementId: string 
  let selectPageIndex: number = -1
  let isSelectAPage : boolean = false
  let elementType: string

  const setAddParam = (state:any, pageIndex:number, elementIndex:number) => {
    const isFirstElement = elementIndex > 0 ? false : true
    if(isFirstElement){
        selectPageIndex = pageIndex
        isSelectAPage = true
    }else{
        previousElementId = state.pages[pageIndex].elements[elementIndex - 1].id
    }
  }
  
  return {
    execute(state:any) {
      const { elementIndex, pageIndex } = getSelectedElementPosition(state, payload.elementId)
      if (elementIndex !== undefined && pageIndex !== undefined) {
        // 获取被删除元素的信息
        const deletedElement = state.pages[pageIndex].elements[elementIndex]  
        elementType = deletedElement.type === "rating" 
            ? deletedElement.type + deletedElement.rateType 
            : deletedElement.type
        
        setAddParam(state, pageIndex, elementIndex)
      }
      
      // 执行删除操作
      const cloned = deleteQuestion(state, payload.elementId)
      
      return cloned
    },

    undo(state) { 
      const { id, cloned } = addQuestionElement(
        state, 
        elementType, 
        previousElementId,
        isSelectAPage,
        selectPageIndex
      )
      return cloned
    }
  }
}
