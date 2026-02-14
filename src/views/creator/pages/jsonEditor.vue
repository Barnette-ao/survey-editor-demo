<template>
  <div class="jsonEditor">
    <div class="topblock"></div>
    <div class="jsonEditorBox">
        <customerJsonEditor 
            :modelValue="jsonString"  
            :language="language"
            @blur="onJsonBlur"

        />
    </div>
    <SurveySchemaErrorPanel
        :errors="validationState.surveyErrors"
        :visible="validationState.hasSurveySchemaError"
        @close="validationState.hasSurveySchemaError = false"
    />
    <div class="bottomBlock"></div> 
  </div>
</template>

<script setup lang='ts'>
import SurveySchemaErrorPanel from '@/views/creator/components/SurveySchemaErrorPanel.vue'
import customerJsonEditor from '@/views/creator/components/customerJsonEditor.vue'
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { useSurveyValidation } from '@/views/creator/composables/useSurveyValidation'
import { useDraftActions } from "@/views/creator/composables/useDraftAction";

const jsonString = ref<string>("")
const language = ref('json')
let stateChangeFromJSON:boolean = false; // 是否在JSON编辑器页修改了draftState
const { draftState } = useDraftContext()
watch(
  draftState,
  (next) => {
    if(stateChangeFromJSON) return 
    jsonString.value = JSON.stringify(next, null, 2)
  },
  { immediate: true, deep: true }
) 


const { validationState, validate } = useSurveyValidation()
const { replaceDraftState } = useDraftActions()
function onJsonBlur(newValue: string) {
  try {
    const result = validate(newValue)
    if (!result.ok) { return }
    
    stateChangeFromJSON = true
    const parsednNwValue = JSON.parse(newValue)
    replaceDraftState(parsednNwValue)
  } catch {
    // JSON 错误时不更新 surveyJson
  }
}



</script>


<style scoped lang="scss">
.jsonEditor{
    .topblock{
        width:100%;
        height:64px;
    }

    .jsonEditorBox{
        margin-top: 2px;
        height: calc(100vh);
        overflow-y: auto;

        &::-webkit-scrollbar {
            display: none;
        }
    }
    .bottomBlock{
        width:100%;
        height:10px;
    }
}

</style>