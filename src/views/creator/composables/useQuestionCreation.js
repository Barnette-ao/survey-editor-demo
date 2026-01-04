import {
  addQuestionElement,
  addPage,
} from "@/views/creator/config/handleElementAndPage";

export function useQuestionCreation(questionSettings, currentQuestionId, pageIndex, isCurrentQuestionAPage) {
  
    const handleQuestionTypeClick = (elementType) => {
        // 题目创建逻辑
        if (elementType == "page") {
            addPage(
            questionSettings,
            currentQuestionId.value,
            pageIndex.value,
            isCurrentQuestionAPage.value
            );
        } else {
            // 当前选中的题目改为新添加的题目
            currentQuestionId.value = addQuestionElement(questionSettings, elementType, currentQuestionId.value);
        }
    }
  
  const handleStructrueChange = (isStructrueChanged) => {
    questionSettings.questionsOnPageMode = isStructrueChanged
        ? "questionPerPage"
        : "standard";
  };
  
  return {
    handleQuestionTypeClick,
    handleStructrueChange
  }
}