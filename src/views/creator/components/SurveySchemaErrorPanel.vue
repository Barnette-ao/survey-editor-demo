<template>
  <transition name="el-fade-in">
    <el-card
      v-if="visible && errors.length > 0"
      class="survey-error-panel"
      shadow="always"
    >
      <template #header>
        <div class="panel-header">
          <span class="title">
            <el-icon color="#f56c6c"><WarningFilled /></el-icon>
            Survey 结构错误
          </span>
          <el-button
            size="small"
            text
            @click="$emit('close')"
          >
            关闭
          </el-button>
        </div>
      </template>

      <el-scrollbar max-height="240px">
        <ul class="error-list">
          <li
            v-for="(err, index) in errors"
            :key="index"
            class="error-item"
          >
            <el-icon color="#f56c6c"><CircleCloseFilled /></el-icon>
            <div class="error-content">
              <div class="message">{{ err.message }}</div>
              <div v-if="err.path" class="path">
                {{ err.path }}
              </div>
            </div>
          </li>
        </ul>
      </el-scrollbar>
    </el-card>
  </transition>
</template>

<script setup lang="ts">
import { WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useSurveyValidation } from '@/views/creator/composables/useSurveyValidation'
import type { SurveySchemaError } from '@/views/creator/composables/useSurveyValidation'


defineProps<{
  errors: SurveySchemaError[]
  visible: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
.survey-error-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 360px;
  z-index: 2000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #f56c6c;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.error-content {
  flex: 1;
}

.message {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
</style>
