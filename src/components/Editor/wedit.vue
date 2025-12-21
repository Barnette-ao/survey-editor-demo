<template>
  <div style="background: none">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="width: 100%; height: auto"
      :defaultHtml="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onBlur="handleBlur"
      ref="editor"
    />
  </div>
</template>

<script>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onBeforeUnmount, ref, watch, nextTick } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useEditorStore } from "@/stores/editorStore";

export default {
  components: { Editor, Toolbar },
  props: {
    placeholder: {
      type: String,
      default: () => "请输入内容",
    },
    modelValue: {
      type: String,
      default: "",
    },
    toolbarConfig: {
      type: [Object],
      default: () => {},
    },
    handleUpdate: {
      type: Function,
      default: () => {},
    },
    wangEditorId: {
      type: String,
      required: true,
    },
    blur: {
      type: Function,
      default: () => {},
    },
  },
  setup(props, { emit }) {

    if(props.wangEditorId === "surveyName"){
      console.log("props.modelValue",props.modelValue)
    }
    
    const editorStore = useEditorStore();
    const editorRef = ref(null);
    console.log("editorStore.getContent(props.wangEditorId)",editorStore.getContent(props.wangEditorId))
    const valueHtml = ref(
      editorStore.getContent(props.wangEditorId) || props.modelValue || ""
    );
    const editorConfig = {
      MENU_CONF: {},
      placeholder: props.placeholder,
    };
    // 禁用上传图片功能（暂时不需要后端支持）
    editorConfig.MENU_CONF["uploadImage"] = {
      // 自定义上传
      customUpload: async (file, insertFn) => {
        // 暂时不支持上传，可以后续添加
        console.warn('图片上传功能暂未配置');
      },
    };
    
    // 禁用上传视频功能（暂时不需要后端支持）
    editorConfig.MENU_CONF["uploadVideo"] = {
      // 自定义上传
      customUpload: async (file, insertFn) => {
        // 暂时不支持上传，可以后续添加
        console.warn('视频上传功能暂未配置');
      },
    };

    // 初始化时调整高度
    const handleCreated = (editor) => {
      editorRef.value = editor;

      //nextTick(movetoEnder); // 编辑器创建完成后调整高度
      setTimeout(() => {
        movetoEnder();
      }, 100);
    };
    const movetoEnder = () => {
      editorRef.value.move(editorRef.value.getText().length);
    };
    
    const handleBlur = (editor) => {
      const content = editor.getHtml();
      // 保存修改后的编辑器内容
      editorStore.setContent(props.wangEditorId, content);
      useEditorStore().clearActiveEditor();
      props.blur(content);
      if (editor == null) return;
      editor.destroy();
    };

    onBeforeUnmount(() => {
      const editor = editorRef.value;

      if (editor == null) return;
      editor.destroy();
    });

    return {
      editorRef,
      valueHtml,
      mode: "simple",
      editorConfig,
      handleCreated,
      handleBlur,

      toolbarConfig: props.toolbarConfig,
    };
  },
};
</script>
