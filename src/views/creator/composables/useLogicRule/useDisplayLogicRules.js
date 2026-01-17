export function useDisplayLogicRules(props, allElements, getDefaultRule) {  
  // displayedLogicRules是依赖于filteredRules的
  // displayedLogicRules完全可以做计算属性，但是因为我在changeIfCoditionElement直接用displayedLogicRules修改值，
  // 这违反了计算属性的
  // displayedLogicRules如果是计算属性，那么不能直接修改计算属性的值
  const displayedLogicRules = ref([]);
  
  // 提取初始化逻辑为函数
  const initializeDisplayedLogicRules = (logicRules,logicClass) => {
    if (!logicRules) {
      return;
    }

    const validRules = logicRules
       // 深拷贝logicRules,避免修改validRules污染logicRules，
	   // 比如当logicRules=props.questionSettings.logicRules
      .map(rule => JSON.parse(JSON.stringify(rule)))
	  //过滤目标题目不存在（被删除）的逻辑规则
	  .filter(rule => {
        const targetId = rule.thenCondition.targetElementId;
        if (!targetId || targetId === 'complete') return true;
        return allElements.value.some(element => element.id === targetId);
      })
	  //过滤掉不属于当前类型的逻辑规则
      .filter(rule => {
        if (logicClass === 'skipLogic') {
          return rule.thenCondition.action === 'jump' &&
                 rule.ifConditions.some(ifrule => ifrule.elementId === props.element.id);
        } else {
          return ['show', 'hide'].includes(rule.thenCondition.action) &&
                 rule.thenCondition.targetElementId === props.element.id;
        }
      });
      // 已有逻辑规则中没有符合要求的，则显示一条默认逻辑规则单元
      if (validRules.length === 0) {
        const defaultRule = getDefaultRule();
        displayedLogicRules.value = [defaultRule];
      }
      //反之，则显示这些逻辑规则 
      else {
        displayedLogicRules.value = validRules;
      }
      console.log("init displayedLogicRules.value",
        displayedLogicRules.value)
  };

  const getDisplayRuleProp = (ruleIndex, prop) => {
    return displayedLogicRules.value[ruleIndex][prop]
  }

  const getDisplayRuleIfElementProp = (ruleIndex, conditionIndex, prop) => {
    return displayedLogicRules.value[ruleIndex].ifConditions[conditionIndex][prop]
  }

  const setDisplayRuleIfElementProp = (ruleIndex, conditionIndex, prop, value) => {
    displayedLogicRules.value[ruleIndex].ifConditions[conditionIndex][prop] = value
  }

  const getDeletedDisplayRule = (index) => {
    return displayedLogicRules.value.splice(index, 1)[0]
  }

  const isDisplayRuleEmpty = () => {
    return displayedLogicRules.value.length === 0
  }

  // 改变如果条件从句的题目元素，如果条件题目可以重复，所以不会执行检测逻辑规则合理的方法
  const changeIfCoditionElement = (elementId, ruleIndex, index) => {
    // 改变如果条件的题目，则重置选择状态
    setDisplayRuleIfElementProp(ruleIndex,index,'state',"")
    // 重置题目的id
    setDisplayRuleIfElementProp(ruleIndex,index, 'elementId', elementId)
  }

  // 改变如果条件从句的条件选择状态
  const changeIfCoditionState = (state, ruleIndex, index) => {
    // 设置条件选择状态
    console.log("changeIfCoditionState执行这里")
    setDisplayRuleIfElementProp(ruleIndex,index,'state',state)
    // 重置选项选择下拉框
    setDisplayRuleIfElementProp(ruleIndex,index,'choiceIndex','')
  }

  // 对于可以设置跳转逻辑的题目
  // 在设置跳转逻辑时，禁用索引即该跳转逻辑对象中所有
  // 如果条件分支题目中具有最大的索引题目的索引
  // 获取设置跳转逻辑时的禁用索引
  const getMaxConditionIndex = (ruleIndex) => {
    let maxIndex = -1;
    (displayedLogicRules.value[ruleIndex]?.ifConditions ?? []).forEach(
      ifCondition => {
        const index = allElements.value.findIndex(
          element => ifCondition.elementId === element.id
        );
        maxIndex = Math.max(maxIndex, index);
    });
    console.log("maxIndex",maxIndex)
    return maxIndex;
  };



  return {
    displayedLogicRules,
    initializeDisplayedLogicRules,
    getDisplayRuleProp,
    getDeletedDisplayRule,
    setDisplayRuleIfElementProp,
    getDisplayRuleIfElementProp,
    isDisplayRuleEmpty,
    changeIfCoditionElement,
    changeIfCoditionState,
    getMaxConditionIndex
  }
}