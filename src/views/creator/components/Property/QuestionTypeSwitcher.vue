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

const props = defineProps({
  quesitonTypeText: String
})

const emit = defineEmits(['update:questionType'])

const switchQuestionTypeList = ['单选', '多选', '下拉']

const typeMapping = {
  '单选': 'radiogroup',
  '多选': 'checkbox', 
  '下拉': 'dropdown'
}

/**
 * 根据我的梳理，切换题目视图更新的逻辑顺序如下：
 * currentTypeIndex计算属性依赖于props.quesitonTypeText，
 * quesitonTypeText绑定计算属性getCurrentElementTypeText，
 * getCurrentElementTypeText依赖于计算属性currentElement，
 * 计算属性currentElement依赖于currentElementId。
 * 然后切换题型，触发update:questionType事件，
 * 事件的处理方法最后会修改currentElementId，从而完成视图更新。
 * 这是一个典型的响应式数据流
 * 
 * 我还没有找到一个还好的简化方法来简化这个响应数据流。
 */

const currentTypeIndex = computed(() => {
  return switchQuestionTypeList.findIndex(el => el === props.quesitonTypeText)
})

const handleQuestionTypeChange = (selectedTypeIndex) => {
  emit('update:questionType', typeMapping[switchQuestionTypeList[selectedTypeIndex]])
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