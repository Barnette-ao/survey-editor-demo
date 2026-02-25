import type { Command } from "@/views/creator/services/DraftStorageService"
import { createMoveElementCommand } from "@/views/creator/commands/moveElement"
import { createMovePageCommand } from "@/views/creator/commands/movePage"
import { createNoopCommand } from "@/views/creator/commands/noop"


export function createMoveCommand(payload: {
  sourceId: string
  targetId: string
  sourceType: 'page' | 'element'
}): Command {

  const { sourceId, targetId, sourceType } = payload
 
  // 防御性编程，避免移到自己
  if (sourceId === targetId) {
    return createNoopCommand()
  }

  if (sourceType === 'element') {
    return createMoveElementCommand({
      sourceId,
      targetId
    })
  }

  if (sourceType === 'page') {
    return createMovePageCommand({
      sourcePageId: sourceId,
      targetPageId: targetId
    })
  }

  return createNoopCommand()
}