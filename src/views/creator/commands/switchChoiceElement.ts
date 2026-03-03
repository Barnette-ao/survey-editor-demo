import type { Command } from "@/views/creator/services/DraftStorageService"
import { switchChoiceQuestion, findElementById } from "@/views/creator/config/element"
import { snapshot } from '@/views/creator/config/shared'

export function createSwitchChoiceElementCommand(payload: {
  sourceElementId: string
  targetType: string
}): Command {
  let targetElementIdByExecute: string = ""
  let targetElementIdByUndo: string = ""
  let sourceElement: any = null
  
  return {
    execute(state) {
      const rawState = snapshot(state)
      // 保存旧元素用于undo，同时作为switchChoiceQuestion的参数
      sourceElement = findElementById(payload.sourceElementId, rawState)
      if (sourceElement) {
        sourceElement = structuredClone(sourceElement)
      }
      
      const { id, cloned } = switchChoiceQuestion(
        rawState,
        payload.sourceElementId,
        sourceElement,
        payload.targetType
      )
      targetElementIdByExecute = id
      return cloned
    },

    undo(state) {
      const rawState = snapshot(state)
      if (!sourceElement) return rawState
      // 切换回原来的类型
      const { id , cloned } = switchChoiceQuestion(
        rawState,
        targetElementIdByExecute,
        sourceElement,
        sourceElement.type
      )
      targetElementIdByUndo = id
      return cloned
    },

    getExecuteMeta(){
      return {
        effect: 'switch-active-element',
        payload: {
          activeElementId: targetElementIdByExecute
        }
      } 
    },

    getUndoMeta(){
      return {
        effect: 'switch-active-element',
        payload: {
          activeElementId: targetElementIdByUndo
        }
      } 
    }
  }
}
