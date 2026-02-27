import type { Command } from "@/views/creator/services/DraftStorageService"
import { updateSurveyProp } from "@/views/creator/config/survey"
import type { QuestionSettings } from "@/views/creator/types/questionnaire"
import { snapshot } from '@/views/creator/config/shared'

export function createUpdateSurveyPropCommand<K extends keyof QuestionSettings>(payload: {
  key: K
  value: any
}): Command {
  let oldValue: any = null
  let hasCapturedOldValue = false

  return {
    execute(state: any) {
      const rawState = snapshot(state)
      const frozenValue = structuredClone(payload.value)

      // 保存旧值用于undo
      if (rawState && !hasCapturedOldValue) {
        oldValue = structuredClone((rawState as any)[payload.key])
        hasCapturedOldValue = true
      }
      // 执行更新操作
      const result = updateSurveyProp(
        rawState,
        payload.key,
        frozenValue
      )
      return result.cloned
    },

    undo(state: any) {
      const rawState = snapshot(state)
      const result = updateSurveyProp(
        rawState,
        payload.key,
        oldValue
      )
      
      return result.cloned
    }
  }
}
