import type { Command } from "@/views/creator/services/DraftStorageService"

import {
  addQuestionElement,
  deleteQuestion,
  getSelectedElementPosition
} from "@/views/creator/config/element"
import { toRaw } from 'vue'

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
      const rawState = toRaw(state)
      const { elementIndex, pageIndex } = getSelectedElementPosition(rawState, payload.elementId)
      if (elementIndex !== undefined && pageIndex !== undefined) {
        // 获取被删除元素的信息
        const deletedElement = rawState.pages[pageIndex].elements[elementIndex]  
        elementType = deletedElement.type === "rating" 
            ? deletedElement.type + deletedElement.rateType 
            : deletedElement.type
        
        setAddParam(rawState, pageIndex, elementIndex)
      }
      
      // 执行删除操作
      const cloned = deleteQuestion(rawState, payload.elementId)
      
      return cloned
    },

    undo(state) {
      const rawState = toRaw(state) 
      const { cloned } = addQuestionElement(
        rawState, 
        elementType, 
        previousElementId,
        isSelectAPage,
        selectPageIndex
      )
      return cloned
    }
  }
}
