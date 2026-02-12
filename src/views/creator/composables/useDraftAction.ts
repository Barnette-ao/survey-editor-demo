import { 
    createUpdateElementPropCommand,
    createUpdateChoicePropCommand,
    createUpdateItemPropCommand,
    createUpdateSurveyPropCommand
} from "@/views/creator/commands";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";

export function useDraftActions() {
  const { draft } = useDraftContext()

  function applySurveyPropChange(payload:any) {
    const cmd = createUpdateSurveyPropCommand(payload)
    draft.applyOperation(cmd)
  }
  
  function applyElementPropChange(payload:any) {
    const cmd = createUpdateElementPropCommand(payload)
    draft.applyOperation(cmd)
  }

  function applyChoicePropChange(payload:any) {
    const cmd = createUpdateChoicePropCommand(payload)
    draft.applyOperation(cmd)
  }

  function applyItemPropChange(payload:any) {
    const cmd = createUpdateItemPropCommand(payload)
    draft.applyOperation(cmd)
  }

  function onChoiceValueChange(choiceIndex:number, elementId:string){
      return (value:string) =>{
            applyChoicePropChange({
                questionId: elementId,
                choiceIndex: choiceIndex,
                key: "value",
                value: value,
            })
      }
  }

  return {
    applyElementPropChange,
    applyChoicePropChange,
    onChoiceValueChange,
    applyItemPropChange,
    applySurveyPropChange
  }
}
