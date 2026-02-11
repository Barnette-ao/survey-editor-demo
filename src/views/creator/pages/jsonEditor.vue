<template>
  <div class="jsonEditor">
    <div class="topblock"></div>
    <div class="jsonEditorBox">
        <customerJsonEditor 
            :modelValue="jsonString" 
            @update:modelValue="onJsonChange" 
            :language="language"
            @editor-mounted="editorMounted"
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
import { useSurveyId } from "@/views/creator/composables/useSurveyId";

import * as monaco from 'monaco-editor'
const { draftState } = useDraftContext()
const surveyJSON = draftState 
const jsonString = ref<string>(JSON.stringify(surveyJSON.value, null, 2))
const language = ref('json')

const editorMounted = (editor: monaco.editor.IStandaloneCodeEditor) => {
  //  console.log('editor实例加载完成', editor)
}

// 先初始化 questionSettings
const { validationState, validate } = useSurveyValidation()
function onJsonChange(newValue: string) {
  try {
    const result = validate(newValue)
    
    if (!result.ok) {
        return
    }

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