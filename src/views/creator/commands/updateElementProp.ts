import type { Command } from "@/views/creator/services/DraftStorageService"
import { 
  updateElementProp, 
  updateChoiceProp, 
  updateElementField,
  findElementById,
  updateItemProp 
} from "@/views/creator/utils/element"
import type { QuestionElement } from "@/views/creator/types/questionnaire"
import { snapshot } from '@/views/creator/utils/shared'


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
      const rawState = snapshot(state)
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
      const rawState = snapshot(state)
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
      const rawState = snapshot(state)
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
      const result = updateItemProp(
        rawState,
        payload.questionId,
        payload.itemIndex,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const rawState = snapshot(state)
      const result = updateItemProp(
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
      const rawState = snapshot(state)
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
      const rawState = snapshot(state)
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


export function createUpdateElementCommand<K extends keyof QuestionElement>(payload: {
  questionId: string
  key: K
  value: QuestionElement[K]
}): Command {
  const questionId = payload.questionId
  const key = payload.key

  // 新值固定
  const newValue = structuredClone(payload.value)

  // 旧值在第一次 execute 时确定
  let oldValue: QuestionElement[K] | null = null
  let hasCapturedOldValue = false

  return {
    execute(state: any) {
      const rawState = snapshot(state)

      const element = findElementById(questionId, rawState)
      if (!element) return rawState

      // 只在第一次执行时保存旧值,因为该函数一般会执行两次，第一次是在用户例行操作的时候
      // 第二次是在用户撤销之后，点击恢复操作时，而点击恢复操作时不需要记录旧值
      if (!hasCapturedOldValue) {
        oldValue = structuredClone((element as any)[key])
        hasCapturedOldValue = true
      }

      // 返回新的 state（不改变 id）
      return updateElementField(
        rawState,
        questionId,
        key,
        newValue
      )
    },

    undo(state: any) {
      if (!oldValue) return state

      const rawState = snapshot(state)

      return updateElementField(
        rawState,
        questionId,
        key,
        oldValue
      )
    }
  }
}


/**
 * 创建更新所有元素特定属性的可逆命令
 * @param payload - 包含要更新的属性键和值
 * @returns Command 对象，支持 execute 和 undo 操作
 */
export function createUpdateAllElementCommand<K extends keyof QuestionElement>(payload: {
  key: K
  value: QuestionElement[K]
}): Command {
  const key = payload.key

  // 新值固定
  const newValue = structuredClone(payload.value)

  // 旧值映射：存储每个元素的旧值 { elementId: oldValue }
  let oldValuesMap: Map<string, QuestionElement[K]> = new Map()
  let hasCapturedOldValues = false

  return {
    execute(state: any) {
      const rawState = snapshot(state)

      // 只在第一次执行时保存所有元素的旧值
      if (!hasCapturedOldValues) {
        rawState.pages.forEach((page: any) => {
          page.elements.forEach((element: any) => {
            if (element && element.type !== 'html' && element.id) {
              oldValuesMap.set(element.id, structuredClone(element[key]))
            }
          })
        })
        hasCapturedOldValues = true
      }

      // 更新所有元素的指定属性
      return {
        ...rawState,
        pages: rawState.pages.map((page: any) => ({
          ...page,
          elements: page.elements.map((el: QuestionElement) => ({
            ...el,
            [key]: newValue
          }))
        }))
      }
    },

    undo(state: any) {
      const rawState = snapshot(state)

      // 恢复所有元素的旧值
      return {
        ...rawState,
        pages: rawState.pages.map((page: any) => ({
          ...page,
          elements: page.elements.map((el: QuestionElement) => {
            const oldValue = oldValuesMap.get(el.id)
            return oldValue !== undefined
              ? { ...el, [key]: oldValue }
              : el
          })
        }))
      }
    }
  }
}
