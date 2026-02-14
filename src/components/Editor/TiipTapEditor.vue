<template>
  <div class="tiptap-editor">
    <!-- 工具栏（简化版） -->
    <div class="toolbar">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.action"
        @click="btn.action"
        :class="{ active: btn.isActive?.() }"
        :title="btn.title"
      >
        {{ btn.icon }}
      </button>
    </div>

    <!-- 编辑器内容 -->
    <EditorContent
      class="editor-content"
      :editor="editor"
    />
  </div>
</template>

<script setup>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { TextStyleKit } from '@tiptap/extension-text-style'

const props = defineProps({
  modelValue: { 
    type: String, 
    default: '' 
  }
})

const emit = defineEmits(['focus', 'blur'])

const editor = ref(null)

// 创建编辑器
onMounted(() => {
  console.log("props.modelValue",props.modelValue)
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyleKit
    ],
    content: props.modelValue,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none',
      }
    },
    onUpdate: ({ editor }) => {
      const currentHtml = editor.getHTML()
    },
    onFocus: ({ editor }) => emit('focus'),
    onBlur: ({ editor }) => {
      const finalHTML = editor.getHTML()
      emit('blur', finalHTML) // 保存修改
    }
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// 工具栏按钮
const toolbarButtons = [
  {
    icon: 'H1',
    title: '标题1',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 })
  },
  {
    icon: 'B',
    title: '加粗',
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold')
  },
  {
    icon: 'Red',
    title: '红色',
    action: () => editor.value?.chain().focus().setColor('#ff0000').run()
  },
  {
    icon: '14',
    title: '小字号',
    action: () => editor.value?.chain().focus().setFontSize('14px').run()
  }
]


</script>

<style scoped>
.tiptap-editor {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.toolbar {
  position: absolute;
  top: -30px;
  left: 0;
  display: flex;
  gap: 4px;
  padding: 5px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar button {
  width: 50px;
  padding: 0px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 15px;
}

.toolbar button.active {
  background: #e9ecef;
}

</style>