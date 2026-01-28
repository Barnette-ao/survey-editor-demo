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
import SurveyStorageService from '@/views/creator/services/SurveyStorageService'
import { useSurveyValidation } from '@/views/creator/composables/useSurveyValidation'


const surveyJSON = ref<object>({})
const jsonString = ref<string>(JSON.stringify(surveyJSON.value, null, 2))
const language = ref('json')

const editorMounted = (editor: monaco.editor.IStandaloneCodeEditor) => {
   console.log('editor实例加载完成', editor)
}

const storageService = new SurveyStorageService()

onMounted(() => {   
  surveyJSON.value = storageService.loadForJsonEditor(1)
  jsonString.value = JSON.stringify(surveyJSON.value, null, 2)
})

const { validationState, validate } = useSurveyValidation()
function onJsonChange(newValue: string) {
  console.log("实时修改之后数据传递到了这里")
  try {
    const result = validate(newValue)
    console.log("校验结果", result)
    // debugger

    if (!result.ok) {
        showErrors(result.errors) // 永远安全
        return
    }

    storageService.saveFromJsonEditor(result.data)
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