<template>
  <div
    class="editor-wrapper"
    :class="{ active: isEditing }"
    @click.stop="handleWrapperClick"
  >
    <div class="mainblock">
      <div class="choiceBtn">
        <slot name="choiceIcon"></slot>
      </div>
      <Editor
        v-if="isEditing"
        :modelValue="wangEditorValue"
        :wangEditorId="editorId"
        class="editable active"
        @focus="handleFocus"
        :blur="handleBlur"
        v-bind="editorProps"
        :toolbarConfig="toolbarConfig"
      />
      <div v-else class="editable">
        <div v-html="displayText"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Editor from "@/components/Editor/wedit.vue"; // 导入你封装的 wangEditor 组件
import { useEditorStore } from "@/stores/editorStore";
import { isOnlyBr } from "@/views/creator/config/helpers";

const toolbarConfig = ref({
  toolbarKeys: ["headerSelect", "bold", "color", "uploadImage", "fontSize", "fullScreen"],
});

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  targetObject: {
    type: Object,
    default: () => ({}),
  },
  targetKey: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: "100%",
  },
  editorId: {
    type: String,
    required: true,
  },
  isEditable: {
    type: Boolean,
    default: false,
  }
});


const editorStore = useEditorStore();

// 计算属性：判断当前组件是否处于编辑状态
const isEditing = computed(() => {
  return !props.isEditable && editorStore.activeEditorId === props.editorId;
});

// 显示在 div 中的文本
const displayText = computed(() => {
  if(props.editorId === "surveyName"){
    console.log("custom props.modelValue",props.modelValue)
  }

  return props.modelValue || "请输入内容";
});

// 编辑器的配置
const editorProps = {
  modelValue: props.modelValue,
  placeholder: "",
  toolbarConfig: toolbarConfig.value,
};

// 当 div 获取焦点时，切换到编辑器
const handleFocus = () => {
  editorStore.setActiveEditor(props.editorId);
};

// 当编辑器失去焦点时，切换回 div
const handleBlur = (value) => {
  const content = formatContent(props.targetKey, value);
  editorStore.setContent(props.editorId, content);
  props.targetObject[props.targetKey] = content;
};

const wangEditorValue = computed(() => {
  return editorStore.getContent(props.editorId) || props.modelValue || "";
});

// 获取内容
const formatContent = (key, value) => {
  if (isOnlyBr(value)) {
    return "";
  } else if (key == "zh-cn") {
    return value;
  }
  return value.match(/<\/?p>/g) ? value.replace(/<\/?p>/g, "") : value;
};

// 点击 wrapper 时激活编辑器
const handleWrapperClick = () => {
  if (isEditing.value) return;
  editorStore.setActiveEditor(props.editorId);
};

// 全局点击事件处理
const handleGlobalClick = (e) => {
  if (!e.target.closest(".editor-wrapper")) {
    editorStore.clearActiveEditor();
  }
};

onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick);
});
</script>

<style lang="scss">
.w-e-text-container {
  background-color: #f8f9fb !important;
  padding: 0 !important;
  // min-height: 200px !important;
  /* 保证最小编辑区域高度 */
}


.editor-wrapper {
  min-height: 30px;
  border-radius: 4px;
  width: 80%;
  display: flex;
  flex-direction: column;
  padding-left: 5px;
  // align-items: center;
  position: relative;
  /* 关键：恢复相对定位 */

  .editable {
    //	padding: 0px 0px 0px 10px;
    line-height: 1.5em;
    min-height: 30px;
    //min-width: v-bind(width);
    border-radius: 0.3em;
    transition: all 0.2s ease-in-out;
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    display: flex;
    align-items: center;
  }

  cursor: pointer;
  //border: 1px solid transparent;

  &:hover {
    border: 1px dashed rgb(170, 170, 170);
  }

  &.active {
    background-color: rgb(248, 249, 251);
  }

  .active {
    border: none;
    padding: 5px;
  }

  .active:hover {
    border: none;
  }

  .choiceBtn {
    margin-left: 10px;
  }

  /* 非全屏状态工具栏样式 */
  .w-e-toolbar {
    position: absolute;
    top: -52px;
    left: 0px;
    
    /* 留出边距 */
    z-index: 100;
    background: white;
    border-radius: 4px 4px 0 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 5px 10px;
  }

  /* 全屏模式覆盖样式 */
  .w-e-full-screen-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: white;
    padding: 20px;

    /* 全屏时工具栏样式 */
    .w-e-toolbar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      z-index: 10000 !important;
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 10px 20px;
    }

    /* 全屏时编辑区域 */
    .w-e-text-container {
      height: calc(100vh - 60px) !important;
      /* 减去工具栏高度 */
      margin-top: 60px;
      /* 留出工具栏空间 */
    }
  }
}

.choiceBtn {
  margin-right: 10px;
}



.mainblock {
  margin-left: -10px;
  display: flex;
  align-items: center;
}
</style>
