import type { Command } from "@/views/creator/services/DraftStorageService"
import { updateElementProp, findElementById } from "@/views/creator/config/element"
import type { QuestionElement } from "@/views/creator/types/questionnaire"

export function createUpdateElementPropCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  key: K
  value: QuestionElement[K]
}): Command {
  let oldValue: any = null
  let oldElementId: string = ""
  let newElementId: string = ""
  
  return {
    execute(state: any) {
      // 保存新值  
      // payload.value可能是对象，如果执行该函数后，马上再修改payload.value，
      // 因为payload.value是个引用对象，所以value值会动态更新，但预期获得的值
      // 就是触发函数的那一刻的值，之后的值不再发生变化，所以对该值进行深拷贝
      // 以保存其值
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, state)
      if (element) {
        oldValue = structuredClone((element as any)[payload.key])
        oldElementId = element.id
      }

      // 执行更新操作
      const result = updateElementProp(
        state,
        payload.questionId,
        payload.key,
        frozenValue
      )
      // 如果返回了新的ID（数组情况），记录下来
      if (result?.id) {
        newElementId = result.id
      }
      
      return result?.cloned || state
    },

    undo(state: any) {
      // 使用新的ID（如果有）或原ID来恢复旧值
      const targetId = newElementId || oldElementId
      
      const result = updateElementProp(
        state,
        targetId,
        payload.key,
        oldValue
      )
      
      return result?.cloned || state
    },

    getMeta() {
      return {
        newElementId
      }
    }
  }
}
