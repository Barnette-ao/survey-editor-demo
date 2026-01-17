import { CHOICE_TYPES } from "@/views/creator/utils/logicRuleUI.js"

export function useLogicRuleElements(
    allIfElement, 
    getDisplayRuleIfElementProp,
    isDisplayRuleEmpty
) { 
    // 核心 computed：获取逻辑规则元素
    // 计算属性，获取特定逻辑规则的如果条件的题目元素
    const getLogicRuleElement = computed(() => {
        return (ruleIndex, index) => {
            // console.log("ruleIndex, index",ruleIndex, index)
            // console.log("isDisplayRuleEmpty()",isDisplayRuleEmpty())
            // 显示逻辑规则为空
            if (isDisplayRuleEmpty()) {
                console.log("执行到这里getLogicRuleElement")
                return {}
            }
        
            // 显示的逻辑规则非空
            const filterElement = allIfElement.value.find((element) => 
                element.id === getDisplayRuleIfElementProp(ruleIndex,index,'elementId')
            )
            
            return filterElement || {} 
        }
    })

    // 判断是否需要显示选项类题型的第三个下拉框
    const shouldShowChoiceSelect = computed(() => {
        return (ruleIndex, index, state) => {
            const element = getLogicRuleElement.value(ruleIndex, index);
            
            if (!element) return false;
            
            return CHOICE_TYPES.includes(element.type) && 
                ['selected', 'notBeSelected'].includes(state);
        }    
    }) 

    // 判断是否需要显示分数下拉框
    const shouldShowScoreSelect = computed(()=> {
        return (ruleIndex, index, state) => {
            const element = getLogicRuleElement.value(ruleIndex, index);

            if (!element || element.type !== 'rating') return false;
            
            return ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state);
        };
    }) 

    // 获取选择类题型的下拉列表选项文字
    const getLabelOfChoiceSelected = (choice) => {
        return typeof choice === 'object' && choice !== null ? choice.value : choice
    }

    // 获取量表类题型的分数下拉框的表项
    const getScoreOptions = computed(() => {
        return (ruleIndex, index) => {
            const element = getLogicRuleElement.value(ruleIndex, index)

            if (!element || element.type !== 'rating') return [];

            const values = []

            const rateMin = element.rateMin || 1
            const rateMax = element.rateMax || 5
            const rateStep = element.rateStep || 1

            let count = 1
            for (let i = rateMin; i <= rateMax; i += rateStep) {
                values.push({
                    label: i, value: count++
                })
            }
            return values
        }
    })

    // 辅助函数：判断是否为 checkbox
    const isCheckbox = computed(() => {
        return (ruleIndex, index) => { 
            const element = getLogicRuleElement.value(ruleIndex, index);
            return element && element.type === 'checkbox';
        }
    });

    return {
        getLogicRuleElement,
        shouldShowChoiceSelect,
        shouldShowScoreSelect, 
        getLabelOfChoiceSelected,
        getScoreOptions,
        isCheckbox
    };
}