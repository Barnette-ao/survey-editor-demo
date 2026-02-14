<template>
  <div ref="jsonEditBox" class="jsonEditBox"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { editorProps } from '@/views/creator/types/monacoEditorType'

// props / emits
const props = defineProps(editorProps)
const emit = defineEmits<{
  (e: 'blur', value: string): void
}>()

const jsonEditBox = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const init = () => {
  // JSON validation is enabled by default when the JSON worker is loaded via vite-plugin-monaco-editor
  // No need to configure diagnostics manually in Monaco 0.55+
  
  editor = monaco.editor.create(jsonEditBox.value!, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    ...props.options,
  })

  editor.onDidBlurEditorText(() => {
    const value = editor!.getValue()
    emit('blur', value)
  });
}

// modelValue -> editor

/** 
 * 因为不在是不在是v-model，这个监听的目的是
 * 用户点击「清空 JSON」
 * 用户切换问卷 / 切换版本 
 * 用户粘贴一整份 JSON（外部操作）
 * 用户点「重置为模板」
 * 这不是编辑，是“替换”。
*/
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor) return
    const value = editor.getValue()
    if (newValue !== value) {
      editor.setValue(newValue)
    }
  }
)

// options -> editor
watch(
  () => props.options,
  (newValue) => {
    editor?.updateOptions(newValue)
  },
  { deep: true }
)

// language -> editor
watch(
  () => props.language,
  (newValue) => {
    if (editor?.getModel()) {
      monaco.editor.setModelLanguage(editor.getModel()!, newValue)
    }
  }
)

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  editor?.dispose()
  editor = null
})

</script>

<style scoped>
.jsonEditBox {
  width: 100%;
  height: 100%;
}
</style>
