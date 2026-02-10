import type { Ref } from 'vue'
import type { QuestionSettings } from '@/views/creator/types/questionnaire'
import { addQuestionElement,deleteQuestion } from "@/views/creator/config/element"

type SettingType = 'quickSetting' | 'questionSetting'

export function useElementCommands(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  settingType: Ref<SettingType>
) {
  const copyElement = (elementId: string, elementType: string) => {
    addQuestionElement(
      questionSettings.value,
      elementType,
      elementId
    )
    ElMessage.success('复制成功')
  }

  const deleteElement = (elementId: string) => {
    ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      const cloned = deleteQuestion(questionSettings.value, elementId)
      questionSettings.value = cloned

      if (elementId === currentQuestionId.value) {
        currentQuestionId.value = ''
        settingType.value = 'quickSetting'
      }

      ElMessage.success('删除成功')
    })
  }

  return {
    copyElement,
    deleteElement
  }
}
