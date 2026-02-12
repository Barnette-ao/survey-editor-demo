import type { Command } from "@/views/creator/services/DraftStorageService"
import { updateElementProp, updateChoiceProp, replaceChoiceByNewId, findElementById } from "@/views/creator/config/element"
import type { QuestionElement } from "@/views/creator/types/questionnaire"

export function createUpdateElementPropCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  key: K
  value: QuestionElement[K]
}): Command {
  let oldValue: any = null
  let oldElementId: string = ""
  
  return {
    execute(state: any) {
      // 保存新值  
      // payload.value可能是对象，如果执行该函数后，马上再修改payload.value，
      // 因为payload.value是个引用对象，所以value值会动态更新，但预期获得的值
      // 就是触发函数的那一刻的值,之后的值不再发生变化，所以对该值进行深拷贝
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
      
      return result.cloned
    },

    undo(state: any) {
      const result = updateElementProp(
        state,
        oldElementId,
        payload.key,
        oldValue
      )
      
      return result.cloned
    }
  }
}


export function createUpdateChoicePropCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  choiceIndex: number
  key: K
  value: QuestionElement[K]
}): Command {
  let oldValue: any = null
  let oldElementId: string = ""
  
  return {
    execute(state: any) {
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, state)
      if (element) {
        const choice = element.choices?.[payload.choiceIndex]
        if (choice) {
          if (typeof choice === "object") {
            oldValue = structuredClone((choice as any)[payload.key])
          } else {
            oldValue = structuredClone(choice)
          }
        }
        oldElementId = element.id
      }

      // 执行更新操作
      const result = updateChoiceProp(
        state,
        payload.questionId,
        payload.choiceIndex,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const result = updateChoiceProp(
        state,
        oldElementId,
        payload.choiceIndex,
        payload.key,
        oldValue
      )
      
      return result.cloned
    }
  }
}

// 在我重构拖拽时这个函数一定要改，现在只是摆在这里
export function createDragChoiceCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  key: K
  value: QuestionElement[K]
}): Command {
  let oldValue: any = null
  let oldElementId: string = ""
  let newElementId: string = ""
  
  return {
    execute(state: any) {
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, state)
      if (element) {
        oldValue = structuredClone((element as any)[payload.key])
        oldElementId = element.id
      }

      // 执行更新操作
      const result = replaceChoiceByNewId(
        state,
        payload.questionId,
        payload.key,
        frozenValue
      )
      
      if (result.id) {
        newElementId = result.id
      }
      
      return result.cloned
    },

    undo(state: any) {
      const result = replaceChoiceByNewId(
        state,
        newElementId || oldElementId,
        payload.key,
        oldValue
      )
      
      return result.cloned
    },

    getMeta() {
      return {
        newElementId
      }
    }
  }
}
