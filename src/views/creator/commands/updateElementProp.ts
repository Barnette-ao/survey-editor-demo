import type { Command } from "@/views/creator/services/DraftStorageService"
import { updateElementProp, updateChoiceProp, replaceChoiceByNewId, findElementById } from "@/views/creator/config/element"
import type { QuestionElement } from "@/views/creator/types/questionnaire"
import { toRaw } from 'vue'


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
      const rawState = toRaw(state)
      const frozenValue = structuredClone(payload.value)
    
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, rawState)
      if (element) {
        oldValue = structuredClone((element as any)[payload.key])
        oldElementId = element.id
      }

      // 执行更新操作
      const result = updateElementProp(
        rawState,
        payload.questionId,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const rawState = toRaw(state)
      const result = updateElementProp(
        rawState,
        oldElementId,
        payload.key,
        oldValue
      )
      
      return result.cloned
    }
  }
}

export function createUpdateItemPropCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  itemIndex: number
  key: K
  value: QuestionElement[K]
}): Command {
  let oldValue: any = null
  let oldElementId: string = ""
  
  return {
    execute(state: any) {
      const rawState = toRaw(state)
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, rawState)
      if (element) {
        const item = element.items?.[payload.itemIndex]
        if (item) {
          oldValue = structuredClone((item as any)[payload.key])
        }
        oldElementId = element.id
      }

      // 执行更新操作
      const result = updateChoiceProp(
        rawState,
        payload.questionId,
        payload.itemIndex,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const rawState = toRaw(state)
      const result = updateChoiceProp(
        rawState,
        oldElementId,
        payload.itemIndex,
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
      const rawState = toRaw(state)
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, rawState)
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
        rawState,
        payload.questionId,
        payload.choiceIndex,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const rawState = toRaw(state)
      const result = updateChoiceProp(
        rawState,
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
export function createUpdateChoicesCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  key: K
  value: QuestionElement[K]
}): Command {
  //structuredClone的参数不能是proxy类型，所以payload.value一定要是原始类型    
  let oldValue: any = null
  let currentElementId = payload.questionId
  const frozenValue = structuredClone(payload.value)
  const key = payload.key 

  return {
    execute(state: any) {
      const rawState = toRaw(state)
      
      // 保存旧值用于undo
      const element = findElementById(payload.questionId, rawState)
      if (element) {
        oldValue = structuredClone((element as any)[payload.key])
      }

      // 执行更新操作
      const result = replaceChoiceByNewId(
        rawState,
        currentElementId,
        key,
        frozenValue
      )
      if (result.id) currentElementId = result.id
      return result.cloned
    },

    undo(state: any) {
      const rawState = toRaw(state)
      const result = replaceChoiceByNewId(
        rawState,
        currentElementId,
        key,
        oldValue
      )
      if (result.id) currentElementId = result.id
      return result.cloned
    },

    getMeta() {
      return {
        elementId:currentElementId
      }
    }
  }
}
