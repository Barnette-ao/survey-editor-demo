import type { Ref } from 'vue'
import type { QuestionSettings } from '@/views/creator/types/questionnaire'
import { addQuestionElement } from "@/views/creator/config/element/create"
import {
  deleteQuestion
} from '@/views/creator/config/handleElementAndPage'
import { formattedNumber } from '@/views/creator/config/helpers'

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
    formattedNumber(questionSettings.value)
    ElMessage.success('复制成功')
  }

  const deleteElement = (elementId: string) => {
    ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      const index = deleteQuestion(questionSettings, elementId)

      formattedNumber(questionSettings.value)

      if (index !== -1 && elementId === currentQuestionId.value) {
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
