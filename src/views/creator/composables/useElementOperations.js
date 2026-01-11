import {
  getPageAndElementIndexOfSelectElement,
  handleCopyElement,
  deleteQuestion,
  switchElementByType,
  removeLogicRulesOfDeletedRule,
} from "@/views/creator/config/handleElementAndPage";
import {
  generateUUID,
  formattedNumber,
} from "@/views/creator/config/helpers";

export function useElementOperations(questionSettings, currentQuestionId, currentElement) {

    // 统一处理元素更新
    const handleElementUpdate = (key, value) => {
        // 找到当前元素的索引
        const { pageIndex, elementIndex } = getPageAndElementIndexOfSelectElement(
            questionSettings,
            currentQuestionId.value
        );

        if (pageIndex !== undefined && elementIndex !== undefined) {
            // 直接修改源数据，确保响应式更新
            // 创建新对象保证引用变化
            const dragElement = questionSettings.value.pages[pageIndex].elements[elementIndex];
            // 如果value是数组，要通过创建新元素，替换旧元素来触发响应式更新视图
            if (Array.isArray(value)) {
                // 必须要删除旧元素的id,给它一个新的id，因为template中key绑定了id
                // 在diff算法中，key绑定了id，所以key相同，就会认为是同一个元素，不会触发更新视图
                // 所以必须要删除旧元素的id,给它一个新的id，
                // 不能在template中删除key = element.id，这样代码会失效。
                const { id:oldId, ...newElement } = dragElement;
                newElement[key] = value;
                const newId = generateUUID();
                newElement.id = newId;

                if (questionSettings.value.logicRules?.length) { 
                    // 更新选中题目的逻辑规则中的元素ID
                    questionSettings.value.logicRules = questionSettings.value.logicRules.map(rule => {
                        // 更新其显示逻辑中的id
                        if (rule.thenCondition.targetElementId === oldId && rule.thenCondition.action === "show") {
                            rule.thenCondition.targetElementId = newId;
                        }        
                        // 更新其跳转逻辑中的id
                        if (rule.thenCondition.action === "jump") {
                            rule.ifConditions = rule.ifConditions.map(ifCondition => {
                                ifCondition.elementId = ifCondition.elementId === oldId ? newId : ifCondition.elementId
                                return ifCondition;
                            });
                        }
            
                        return rule;
                    });
                }
      
                // currentQuestionId.value更新之后，计算属性currentElement的值也会更新，
                // 渲染视图需要currentElement，currentElement改变，就会触发视图更新,如果不更新
                // currentQuestionId.value，下一步执行之后，旧元素被删掉，原来的currentQuestionId没有了相应元素，
                // 那么currentElement的值为undefined
                // 这样渲染的时候会报错：Cannot read properties of undefined (reading 'isRequired')
                currentQuestionId.value = newId;

                // 替换元素并触发响应式更新
                questionSettings.value.pages[pageIndex].elements.splice(elementIndex, 1, newElement);
            }
            // 如果value是原始数据类型，那么直接修改源数据就可以触发响应式更新视图
            else {
                dragElement[key] = value;
            }
        }
    };  
  
  const handleSettingUpdate = (key, value) => {
    // 设置更新逻辑
    if (!currentElement.value) return;

    switch (key) {
        case "choicesOrder":
            currentElement.value.choicesOrder = value ? "random" : "none";
            break;
        case "questionsOrder":
            currentElement.value.questionsOrder = value ? "random" : "initial";
            break;
        case "choices":
            if (value.showText !== undefined) {
                currentElement.value.choices[selectedOptionIndex.value].showText = value.showText;
            } else if (value.textType !== undefined) {
                currentElement.value.choices[selectedOptionIndex.value].textType = value.textType;
            } else if (value.required !== undefined) {
                currentElement.value.choices[selectedOptionIndex.value].required = value.required;
            }
            break;
        default:
            currentElement.value[key] = value;
    }
  }
  
  // 切换题目类型
  // 根据被切换的题目元素生成新的题目元素，在被切换的题目元素的位置插入新的题目元素
  const handleQuestionTypeUpdate = (newType) => {
    // 题目类型切换逻辑
    const newElement = switchElementByType(newType, questionSettings, currentElement.value);

    const { elementIndex, pageIndex } = getPageAndElementIndexOfSelectElement(
        questionSettings,
        currentQuestionId.value
    );

    // 不能写成elementIndex && pageIndex
    // 因为elementIndex和pageIndex取0的时候，表达式的值为false
    if (elementIndex !== undefined && pageIndex !== undefined) {
        // 删除与被切换的题目元素关联的所有逻辑规则
        removeLogicRulesOfDeletedRule(questionSettings, currentQuestionId.value)
        // 替换元素并触发响应式更新
        questionSettings.value.pages[pageIndex].elements.splice(elementIndex, 1, newElement);
        // 更新当前选中的题目ID
        currentQuestionId.value = newElement.id;
    }
  }
  
  const handleCopy = (elementId, elementType) => {
    handleCopyElement(elementId, questionSettings, elementType);
    // 更新所有题目的序号
    formattedNumber(questionSettings.value);
    ElMessage.success("复制成功");
  };
  
  const handleDelete = (elementId) => {
    // 删除逻辑
    ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        deleteQuestionElement(elementId, questionSettings);
        // 更新所有题目的序号
        formattedNumber(questionSettings.value);
        ElMessage({
            type: "success",
            message: "删除成功",
        });
    });
  }

  const deleteQuestionElement = (elementId, questionSettings) => {
    const index = deleteQuestion(questionSettings, elementId);

    if (index && index !== -1 && elementId === currentQuestionId.value) {
        currentQuestionId.value = "";
        settingType.value = "quickSetting";
    }
  };
  
  return {
    handleElementUpdate,
    handleSettingUpdate,
    handleQuestionTypeUpdate,
    handleCopy,
    handleDelete
  }
}