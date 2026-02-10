import type { Command } from "@/views/creator/services/DraftStorageService"

import {
  addQuestionElement,
  deleteQuestion
} from "@/views/creator/config/element"

export function createAddQuestionCommand(payload: {
  selectedQuestionId: string
  elemntType:string
}): Command {
  let addedElementId:string 
  
  return {
    execute(state) {
      const { id:newElementId, cloned } = addQuestionElement(
        state, 
        payload.elemntType, 
        payload.selectedQuestionId
      )
      addedElementId = newElementId
      return cloned
    },

    undo(state) { 
      return deleteQuestion(
        state,
        addedElementId
      )
    },

    getMeta(){
        return {elementId:addedElementId}
    }
  }
}
