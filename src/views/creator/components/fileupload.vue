<template>
	<base-question :element="element" :show-question-number="showNumber">
		<template #options>
			<!-- 文件上传区域 -->
			<div class="upload-container">
				<div class="upload-area">
					<el-icon class="upload-icon">
						<Plus />
					</el-icon>
					<div class="upload-text">点击或拖拽文件到此处上传</div>
				</div>
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { computed } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'

const emit = defineEmits(['update'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showNumber: {
		type: Boolean,
		default: true
	}
})

// 文件上传这个题型不做了

</script>

<style scoped>
.upload-container {
	margin-left: 40px;
	width: 60%;
}

.upload-area {
	border: 1px dashed #dcdfe6;
	border-radius: 4px;
	padding: 30px 0;
	text-align: center;
	background-color: #f5f7fa;
	cursor: default;
}

.upload-icon {
	font-size: 28px;
	color: #909399;
	margin-bottom: 8px;
}

.upload-text {
	color: #606266;
	font-size: 14px;
	margin-bottom: 4px;
}

.upload-tip {
	color: #909399;
	font-size: 12px;
}
</style>