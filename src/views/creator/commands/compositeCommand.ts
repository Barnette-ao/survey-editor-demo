import type { Command } from "@/views/creator/services/DraftStorageService"

export function createCompositeCommand(commands: Command[]): Command {
  return {
    execute(state: any) {
      // 按顺序执行每个命令
      return commands.reduce(
        (newState, command) => command.execute(newState), 
        state
      );
    },
    
    undo(state: any) {
      // 按倒序撤销每个命令
      return [...commands]
        .reverse()
        .reduce(
            (newState, command) => command.undo(newState), 
            state
        );
    }
  }
}