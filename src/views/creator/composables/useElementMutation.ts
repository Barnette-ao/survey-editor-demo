import type { Ref } from 'vue'
import type {
  QuestionSettings,
  QuestionElement,
} from '@/views/creator/types/questionnaire'
import { 
  replaceElement,findElementById 
} from '@/views/creator/config/element'
import { generateUUID } from '@/views/creator/config/shared'

export function useElementMutation(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>
) {
  // 统一更新题目元素字段
  const updateElementField = <
    K extends keyof QuestionElement
  >(
    key: K,
    value: QuestionElement[K]
  ) => {
    
    const element = findElementById(currentQuestionId.value, questionSettings.value)
    if(!element) return  
    // 数组 → 触发强制替换
    // 如果value是数组，要通过创建新元素，替换旧元素来触发响应式更新视图
    if (Array.isArray(value)) {
      // 必须要删除旧元素的id,给它一个新的id，因为template中key绑定了id
      // 在diff算法中，key绑定了id，所以key相同，就会认为是同一个元素，不会触发更新视图
      // 所以必须要删除旧元素的id,给它一个新的id，
      // 不能在template中删除key = element.id，这样代码会失效。
      const { id: oldId, ...rest } = element
      
      const newElement: QuestionElement = {
        ...(rest as QuestionElement),
        id: generateUUID(),
        [key]: value,
      }

      // 同步逻辑规则
      syncNewIdWithLogicRule(questionSettings)
      // 用newElement替换currentQuestionId所表示的题目
      replaceElement(
        questionSettings.value,
        currentQuestionId.value,
        newElement
      )
      // currentQuestionId.value更新之后，计算属性currentElement的值也会更新，
      // 渲染视图需要currentElement，currentElement改变，就会触发视图更新,如果不更新
      // currentQuestionId.value，下一步执行之后，旧元素被删掉，原来的currentQuestionId没有了相应元素，
      // 那么currentElement的值为undefined
      // 这样渲染的时候会报错：Cannot read properties of undefined (reading 'isRequired')
      currentQuestionId.value = newElement.id
    } 
    else {
      ;(element as any)[key] = value
    }
  }

  const syncNewIdWithLogicRule = (questionSettings:any) => {
    if (questionSettings.value.logicRules?.length) {
        // 更新选中题目的逻辑规则中的元素ID
        questionSettings.value.logicRules =
          questionSettings.value.logicRules.map(rule => {
            // 更新其显示逻辑中的id
            if (
              rule.thenCondition.action === "show" &&
              rule.thenCondition.targetElementId === oldId
            ) {
              rule.thenCondition.targetElementId = newElement.id
            }

            // 更新其跳转逻辑中的id
            if (rule.thenCondition.action === "jump") {
              rule.ifConditions = rule.ifConditions.map(cond => {
                cond.elementId =
                  cond.elementId === oldId ? newElement.id : cond.elementId
                return cond
              })
            }
            return rule
          })
      }
  }

  return {
    updateElementField
  }
}
