import { v4 as uuidv4 } from 'uuid'

export function useLogicClass(props, TEXT_TYPES) {
  // 私有版本
  const logicClass = ref('skipLogic');
  
  const thenActionText = computed(() => 
    logicClass.value === 'skipLogic' ? "跳转" : "显示")
  
  const thenText = computed(() => 
    logicClass.value === 'skipLogic' ? "，否则正常进入下一题" : "。")

  const getDefaultRule = () => {
    return {
        id: uuidv4(),
        ifConditions: [{
            elementId: logicClass.value === 'skipLogic' ? props.element.id : "",
            state: '',
            choiceIndex: "",
            score: "",
        }],
        thenCondition: {
            action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
            targetElementId: logicClass.value === 'skipLogic' ? '' : props.element.id
        }
    };
  };

  const initLogicClass = () => {
    logicClass.value = TEXT_TYPES.includes(props.element.type) 
        ? 'visibleLogic' 
        : 'skipLogic';
  }

  const resetLogicClass = () => {
    logicClass.value = 'skipLogic' 
  }

  // 只读logicClass + setter 等价于el-radiogroup中的v-model
  return {
    logicClass,
    thenActionText,
    thenText,
    getDefaultRule,
    initLogicClass,
    resetLogicClass
  }
}

//model-value="logicClass" @update:model-value="setLogicClass"