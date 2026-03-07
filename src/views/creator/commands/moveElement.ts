import type { Command } from "@/views/creator/services/DraftStorageService"
import type { RenderedItem } from '@/views/creator/types/design'

import { snapshot } from '@/views/creator/utils/shared'
import { findElementPosition,findTargetPosition } from '@/views/creator/utils/element'

// 拖拽命令的工厂函数
export function createMoveElementCommand(payload: {
  sourceId: string
  targetId: string
}): Command {

  let beforeSourcePos: { elementIndex: number; pageIndex: number} | null = null

  return {
    execute(state) {
      const rawState:any = snapshot(state)
  
      const {
        elementIndex:sourceElementIndex, 
        pageIndex:sourcePageIndex 
      } = findElementPosition(rawState, payload.sourceId)
      const {
        elementIndex:targetElementIndex, 
        pageIndex:targetPageIndex 
      } = findTargetPosition(rawState, payload.targetId)
    
      // 记录 undo 位置
      beforeSourcePos = { elementIndex:sourceElementIndex, pageIndex:sourcePageIndex }
      
      const element =
        rawState.pages[sourcePageIndex].elements[sourceElementIndex]
      // 1️⃣ 删除
      rawState.pages[sourcePageIndex].elements.splice(
        sourceElementIndex,
        1
      )
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
      const currentPos = findElementPosition(rawState, payload.sourceId)
      if (currentPos.elementIndex === undefined 
        || currentPos.pageIndex === undefined) 
        return rawState

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
    }
  }
}