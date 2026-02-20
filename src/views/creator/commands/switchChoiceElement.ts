import type { Command } from "@/views/creator/services/DraftStorageService"
import { switchChoiceQuestion, findElementById } from "@/views/creator/config/element"
import { snapshot } from '@/views/creator/config/shared'

export function createSwitchChoiceElementCommand(payload: {
  sourceElementId: string
  targetType: string
}): Command {
  let targetElementId: string = ""
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
      targetElementId = id
      return cloned
    },

    undo(state) {
      const rawState = snapshot(state)
      // 切换回原来的类型
      if (sourceElement) {
        const { cloned } = switchChoiceQuestion(
          rawState,
          targetElementId,
          sourceElement,
          sourceElement.type
        )
        return cloned
      }
      return rawState
    },

    getMeta() {
      return { elementId: targetElementId }
    }
  }
}
