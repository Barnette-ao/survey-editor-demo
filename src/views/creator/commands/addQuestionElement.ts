import type { Command } from "@/views/creator/services/DraftStorageService"

import {
  addQuestionElement,
  deleteQuestion
} from "@/views/creator/config/element"
import { toRaw } from 'vue'

export function createAddQuestionCommand(payload: {
  selectedQuestionId: string
  elemntType:string
}): Command {
  let addedElementId:string 
  
  return {
    execute(state) {
      const rawState = toRaw(state)
      const { id:newElementId, cloned } = addQuestionElement(
        rawState, 
        payload.elemntType, 
        payload.selectedQuestionId
      )
      addedElementId = newElementId
      return cloned
    },

    undo(state) {
      const rawState = toRaw(state) 
      return deleteQuestion(
        rawState,
        addedElementId
      )
    },

    getMeta(){
        return {elementId:addedElementId}
    }
  }
}
