import type { Command } from "@/views/creator/services/DraftStorageService"
import { snapshot } from "@/views/creator/config/shared"
import { findPageIndexById,resolveTargetPageIndex } from "@/views/creator/config/element"

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

      // 删除 source page
      rawState.pages.splice(sourceIndex, 1)

      // 修正 targetIndex（删除影响 index）
      let insertIndex = targetIndex

      if (sourceIndex < targetIndex) {
        insertIndex -= 1
      }

      // 插入 page
      rawState.pages.splice(insertIndex, 0, page)

      return rawState
    },

    undo(state) {

      if (originalIndex === null) return state

      const rawState:any = snapshot(state)

      const currentIndex =
        findPageIndexById(rawState, payload.sourcePageId)

      if (currentIndex === -1) return rawState

      const page = rawState.pages[currentIndex]

      // 删除当前位置
      rawState.pages.splice(currentIndex, 1)

      // 插回原位置
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
