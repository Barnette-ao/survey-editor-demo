import type { Command } from "@/views/creator/services/DraftStorageService"
import type { RenderedItem } from '@/views/creator/types/design'

import { snapshot } from '@/views/creator/config/shared'
import { getSelectedElementPosition } from '@/views/creator/config/element'

// 拖拽命令的工厂函数
export function createMoveElementCommand(payload: {
  sourceId: string
  targetId: string
}): Command {

  let beforeSourcePos: { elementIndex: number; pageIndex: number} | null = null

  return {
    execute(state) {
      const rawState:any = snapshot(state)

      const {elementIndex:sourceElementIndex, pageIndex:sourcePageIndex } = 
        getSelectedElementPosition(rawState, payload.sourceId)
      let {elementIndex:targetElementIndex, pageIndex:targetPageIndex } = 
        getSelectedElementPosition(rawState, payload.targetId)

      // targetElement是页块，element -> page，语义是将element插入page[0]  
      if(targetElementIndex=== undefined && targetPageIndex){
        targetElementIndex = 0
      }  

      // 记录 undo 位置
      beforeSourcePos = { elementIndex:sourceElementIndex, pageIndex:sourcePageIndex }

      const element =
        rawState.pages[sourcePageIndex].elements[sourceElementIndex]

      // 1️⃣ 删除
      rawState.pages[sourcePageIndex].elements.splice(
        sourceElementIndex,
        1
      )

      // 如果 source 和 target 在同页，并且 source 在 target 前，
      // 删除后 targetIndex 要 -1
      if (
        sourcePageIndex === targetPageIndex &&
        sourceElementIndex < targetElementIndex
      ) {
        targetElementIndex -= 1
      }

      // 2️⃣ 插入
      rawState.pages[targetPageIndex].elements.splice(
        targetElementIndex,
        0,
        element
      )

      return rawState
    },

    undo(state) {
      if (!beforeSourcePos) return state

      const rawState:any = snapshot(state)

      const currentPos = getSelectedElementPosition(rawState, payload.sourceId)
      if (!currentPos.elementIndex || !currentPos.pageIndex) return rawState

      const element =
        rawState.pages[currentPos.pageIndex].elements[currentPos.elementIndex]

      // 删除当前位置
      rawState.pages[currentPos.pageIndex].elements.splice(
        currentPos.elementIndex,
        1
      )

      // 插回原位置
      rawState.pages[beforeSourcePos.pageIndex].elements.splice(
        beforeSourcePos.elementIndex,
        0,
        element
      )

      return rawState
    },

    getMeta() {
      return {
        sourceId: payload.sourceId,
        targetId: payload.targetId
      }
    }
  }
}