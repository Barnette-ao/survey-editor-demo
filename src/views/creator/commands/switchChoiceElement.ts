import type { Command } from "@/views/creator/services/DraftStorageService"
import { switchChoiceQuestion, findElementById } from "@/views/creator/config/element"

export function createSwitchChoiceElementCommand(payload: {
  sourceElementId: string
  targetType: string
}): Command {
  let targetElementId: string = ""
  let sourceElement: any = null
  
  return {
    execute(state) {
      // 保存旧元素用于undo，同时作为switchChoiceQuestion的参数
      sourceElement = findElementById(payload.sourceElementId, state)
      if (sourceElement) {
        sourceElement = structuredClone(sourceElement)
      }
      
      const { id, cloned } = switchChoiceQuestion(
        state,
        payload.sourceElementId,
        sourceElement,
        payload.targetType
      )
      targetElementId = id
      return cloned
    },

    undo(state) {
      // 切换回原来的类型
      if (sourceElement) {
        const { cloned } = switchChoiceQuestion(
          state,
          targetElementId,
          sourceElement,
          sourceElement.type
        )
        return cloned
      }
      return state
    },

    getMeta() {
      return { elementId: targetElementId }
    }
  }
}
