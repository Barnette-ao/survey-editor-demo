import type { Command } from "@/views/creator/services/DraftStorageService"
import { snapshot } from "@/views/creator/config/shared"
import { resolveTargetPageIndex } from "@/views/creator/config/element"
import { findPageIndexById } from "@/views/creator/config/page"

export function createMovePageCommand(payload: {
  sourcePageId: string
  targetPageId: string
}): Command {

  // undo 时需要知道原始位置
  let originalIndex: number | null = null

  return {
    execute(state) {
      const rawState:any = snapshot(state)
      const sourceIndex = findPageIndexById(rawState, payload.sourcePageId)
      const targetIndex = resolveTargetPageIndex(rawState, payload.targetPageId)
      if (sourceIndex === -1 || targetIndex === -1) {
        return rawState
      }

      // 保存 undo 信息
      originalIndex = sourceIndex

      const page = rawState.pages[sourceIndex]
      rawState.pages.splice(sourceIndex, 1)
      rawState.pages.splice(targetIndex, 0, page)

      return rawState
    },

    undo(state) {
      const rawState:any = snapshot(state)
      if (originalIndex === null) return rawState
      const currentIndex = findPageIndexById(rawState, payload.sourcePageId)
      if (currentIndex === -1) return rawState

      const page = rawState.pages[currentIndex]
      rawState.pages.splice(currentIndex, 1)
      rawState.pages.splice(originalIndex, 0, page)

      return rawState
    },

    getMeta() {
      return {
        sourcePageId: payload.sourcePageId,
        targetPageId: payload.targetPageId
      }
    }

  }
}
