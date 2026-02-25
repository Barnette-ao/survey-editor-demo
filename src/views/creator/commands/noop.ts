import type { Command } from "@/views/creator/services/DraftStorageService"

export const createNoopCommand = (): Command => {
  return {
    execute(state) {
      return state
    },
    undo(state) {
      return state
    }
  }
}