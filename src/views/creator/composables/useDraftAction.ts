import { 
    createUpdateElementPropCommand,
    createUpdateChoicePropCommand 
} from "@/views/creator/commands";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";

export function useDraftActions() {
  const { draft } = useDraftContext()

  function applyElementPropChange(payload:any) {
    const cmd = createUpdateElementPropCommand(payload)
    draft.applyOperation(cmd)
  }

  function applyChoicePropChange(payload:any) {
    const cmd = createUpdateChoicePropCommand(payload)
    draft.applyOperation(cmd)
  }

  return {
    applyElementPropChange,
    applyChoicePropChange
  }
}
