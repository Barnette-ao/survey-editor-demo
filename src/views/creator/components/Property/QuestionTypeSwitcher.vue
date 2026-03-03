<template>
  <div class="setting-item">
    <span>切换题型</span>
    <el-select :model-value="currentTypeIndex"  @change="handleQuestionTypeChange">
      <el-option 
        v-for="(item, index) in switchQuestionTypeList" 
        :key="index" 
        :label="item"
        :value="index" 
      />
    </el-select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { useEditorStore } from "@/stores/editorContextStore";

const props = defineProps({
  quesitonTypeText: String,
})

const editorStore = useEditorStore()
const switchQuestionTypeList = ['单选', '多选', '下拉']

const typeMapping = {
  '单选': 'radiogroup',
  '多选': 'checkbox', 
  '下拉': 'dropdown'
}


const currentTypeIndex = computed(() => {
  return switchQuestionTypeList.findIndex(el => el === props.quesitonTypeText)
})

const { applySwitchChoiceElement } = useDraftActions()
const handleQuestionTypeChange = (selectedTypeIndex) => {
  const type = typeMapping[switchQuestionTypeList[selectedTypeIndex]]
  applySwitchChoiceElement({
    sourceElementId: editorStore.currentQuestionId,
    targetType:type 
  })
}
</script>

<style scoped lang="scss">
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.setting-item span {
  color: #606266;
  font-size: 14px;
}

:deep(.el-select) {
  width: 120px;
}
</style>