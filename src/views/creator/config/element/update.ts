import { getSelectedElementPosition, findElementById } from '@/views/creator/config/element'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule'
import { getSwitchTargetElement } from '@/views/creator/config/element'
import { generateUUID } from '@/views/creator/config/shared'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

/**
 * 切换选择题类型
 * @param questionSettings - 问卷设置对象
 * @param sourceElementId - 要切换的原题目ID
 * @param sourceElement - 原题目对象
 * @param targetType - 切换后的目标题型
 * @returns 包含新元素ID和克隆后的问卷设置
 */
export const switchChoiceQuestion = (
    questionSettings: any,
    sourceElementId: string,
    sourceElement: any,
    targetType: string
) => {
    const cloned = structuredClone(questionSettings)   
    const targetElement = getSwitchTargetElement(
        targetType,
        cloned,
        sourceElement
    ) as QuestionElement
    replaceElement(cloned, sourceElementId, targetElement)

    return { id: targetElement.id, cloned }
}


/**
 * 更新元素属性
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要更新的题目ID
 * @param key - 要更新的属性键
 * @param value - 要更新的属性值
 * @returns 包含新元素ID（如果有）和克隆后的问卷设置
 */
export const updateElementProp = <K extends keyof QuestionElement>(
    questionSettings: any,
    questionId: string,
    key: K,
    value: QuestionElement[K]
) => {
    const cloned = structuredClone(questionSettings)
    const element = findElementById(questionId, cloned)
    if (!element) return { cloned }
    
    ;(element as any)[key] = value
    return { cloned }
}

/**
 * 更新元素属性,
 * 给element中有choices的属性用
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要更新的题目ID
 * @param choiceIndex - 具体choices item的索引
 * @param key - 要更新的属性键
 * @param value - 要更新的属性值
 * @returns 包含新元素ID（如果有）和克隆后的问卷设置
 */
export const updateChoiceProp = <K extends keyof QuestionElement>(
    questionSettings: any,
    questionId: string,
    choiceIndex:number,
    key: K,
    value: QuestionElement[K]
) => {
    const cloned = structuredClone(questionSettings)
    const element = findElementById(questionId, cloned)
    if (!element) return { cloned }

    const choice = element.choices[choiceIndex]
    if (!choice) return { cloned }
    // 数据结构choices:[{value:"xxx",...},{value:"sss",...},...]
    if (typeof choice === "object"){
        ;(choice as any)[key] = value
    }
    // 数据结构choices:["xxx","sss"]
    else{
        ;(choice as any) = value
    }

    return { cloned }
}

/**
 * 更新元素属性,
 * 给element中有choices的属性用
 * 用于拖拽选项更新视图
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要更新的题目ID
 * @param key - choices，其值定义为choices
 * @param value - 要更新的属性值
 * @returns 包含新元素ID（如果有）和克隆后的问卷设置
 */
export const replaceChoiceByNewId = <K extends keyof QuestionElement>(
    questionSettings: any,
    questionId: string,
    key: K,
    value: QuestionElement[K]
) => {
    const cloned = structuredClone(questionSettings)
    
    const element = findElementById(questionId, cloned)
    if (!element) return { cloned }
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
    syncLogicRuleWithNewId(cloned, oldId, newElement)
    // 用newElement替换questionId所表示的题目
    replaceElement(cloned, questionId, newElement)
    return { id: newElement.id, cloned }
}

/**
 * 同步新ID到逻辑规则
 * @param questionSettings - 问卷设置对象
 * @param oldId - 旧的元素ID
 * @param newElement - 新的元素对象
 */
const syncLogicRuleWithNewId = (
    questionSettings: any,
    oldId: string,
    newElement: QuestionElement
) => {
    if (questionSettings.logicRules?.length) {
        // 更新选中题目的逻辑规则中的元素ID
        questionSettings.logicRules = questionSettings.logicRules.map((rule: any) => {
            // 更新其显示逻辑中的id
            if (
                rule.thenCondition.action === "show" &&
                rule.thenCondition.targetElementId === oldId
            ) {
                rule.thenCondition.targetElementId = newElement.id
            }
            
            // 更新其跳转逻辑中的id
            if (rule.thenCondition.action === "jump") {
                rule.ifConditions = rule.ifConditions.map((cond: any) => {
                    cond.elementId =
                        cond.elementId === oldId ? newElement.id : cond.elementId
                    return cond
                })
            }
            return rule
        })
    }
}

/**
 * 替换指定位置的元素
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要替换的题目ID
 * @param newElement - 新的元素对象
 */
export const replaceElement = (
    questionSettings: any,
    questionId: string,
    newElement: QuestionElement
) => {
    const { 
        pageIndex, 
        elementIndex 
    } = getSelectedElementPosition( questionSettings, questionId)

    if (pageIndex !== undefined && elementIndex !== undefined){
        deleteLogicRulesById(questionSettings, questionId)
        questionSettings.pages[pageIndex].elements.splice(
            elementIndex,
            1,
            newElement
        )
    }
}

