import type { Command } from "@/views/creator/services/DraftStorageService"
import { updateSurveyProp } from "@/views/creator/config/survey"
import type { QuestionSettings } from "@/views/creator/types/questionnaire"

export function createUpdateSurveyPropCommand<K extends keyof QuestionSettings>(payload: {
  key: K
  value: QuestionSettings[K]
}): Command {
  let oldValue: any = null
  
  return {
    execute(state: any) {
      const frozenValue = structuredClone(payload.value)
      
      // 保存旧值用于undo
      if (state) {
        oldValue = structuredClone((state as any)[payload.key])
      }

      // 执行更新操作
      const result = updateSurveyProp(
        state,
        payload.key,
        frozenValue
      )
      
      return result.cloned
    },

    undo(state: any) {
      const result = updateSurveyProp(
        state,
        payload.key,
        oldValue
      )
      
      return result.cloned
    }
  }
}
