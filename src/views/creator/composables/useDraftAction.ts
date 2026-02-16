import { 
    createUpdateElementPropCommand,
    createUpdateChoicePropCommand,
    createUpdateItemPropCommand,
    createUpdateSurveyPropCommand,
    createAddPageCommand,
    createAddQuestionCommand,
    createDeleteQuestionCommand
} from "@/views/creator/commands";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { useRoute } from "vue-router";

export function useDraftActions() {
  const { draft } = useDraftContext()
  const route = useRoute()  

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

  function applyAddPage(payload:any){
    const cmd = createAddPageCommand(payload)
    draft.applyOperation(cmd)
  }

  function applyAddElement(payload:any){ 
    const cmd = createAddQuestionCommand(payload)
    const UIContext = draft.applyOperation(cmd)
    return UIContext
  }

  function applyDeleteElement(payload:any){
    const cmd = createDeleteQuestionCommand(payload)
    const UIContext = draft.applyOperation(cmd)
    return UIContext
  }

  function applyUndo(){
    if (route.name === 'editor-json') {
      draft.undoBaseSnapshot()
    } else {
      draft.undoBaseOperation()
    }
  }

  function applyRedo(){
    if (route.name === 'editor-json') {
      draft.redoBaseSnapshot()
    } else {
      draft.redoBaseOperation()
    }
  }

  function applyCommit(){
    draft.commitRuntime()
  }

  function replaceDraftState(snapshot:any){
    draft.replaceState(snapshot)
  }

  return {
    applyElementPropChange,
    applyChoicePropChange,
    applyItemPropChange,
    applySurveyPropChange,
    applyUndo,
    applyRedo,
    applyCommit,
    applyAddPage,
    applyAddElement,
    replaceDraftState,
    applyDeleteElement,
  }
}
