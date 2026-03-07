import type { Command } from "@/views/creator/services/DraftStorageService"

import {
  addQuestionElement,
  deleteQuestion
} from "@/views/creator/utils/element"
import { snapshot } from '@/views/creator/utils/shared'

export function createAddQuestionCommand(payload: {
  selectedQuestionId: string
  elementType:string
  isCurrentQuestionAPage:boolean
  selectedPageIndex:number
}): Command {
  let addedElementId:string 
  
  return {
    execute(state) {
      const rawState = snapshot(state)
      const { id:newElementId, cloned } = addQuestionElement(
        rawState, 
        payload.elementType, 
        payload.selectedQuestionId,
        payload.isCurrentQuestionAPage,
        payload.selectedPageIndex
      )
      addedElementId = newElementId
      return cloned
    },

    undo(state) {
      const rawState = snapshot(state) 
      return deleteQuestion(
        rawState,
        addedElementId
      )
    },

    getExecuteMeta(){
      return {
        effect: 'create-active-element',
        payload: {
          activeElementId: addedElementId
        }
      } 
    },

    getUndoMeta(){
      return {
        effect: 'create-active-element',
        payload: {
          activeElementId: payload.selectedQuestionId
        }
      } 
    }
  }
}
