import type { Command } from "@/views/creator/services/DraftStorageService"
import { snapshot } from "@/views/creator/config/shared"
import { handleLogicRulesUpdate } from "@/views/creator/config/logicRule"

export function createReplaceLogicStateCommand(
    saveLogicObj:any 
): Command {
  let previousState: any = null
  let nextState: any = null
  return {
    execute(state) {
      const rawSetting = snapshot(state)
      previousState = structuredClone(rawSetting)
      nextState = handleLogicRulesUpdate(saveLogicObj, rawSetting)
      return nextState
    },

    undo() {
      return structuredClone(previousState)
    },
  }
}