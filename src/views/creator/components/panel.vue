<template>
	<base-question :element="element" :hideLeftSection="true">
		<template #options>
			<!-- 面板内容 -->
			<div class="panel-content">
				<div class="panel-text">{{ panelText }}</div>
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { ref } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'

const emit = defineEmits(['click', 'copy', 'delete'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
})

const panelText = '在此处从工具箱中删除问题'


</script>

<style scoped>
/* 面板内容样式 */
.panel-content {
	width: 60%;
	border: 1px dashed #dcdfe6;
	border-radius: 4px;
	padding: 40px 40px;
	background-color: #f5f7fa;
	cursor: default;
	min-height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.panel-text {
	color: #606266;
	font-size: 16px;
}
</style>