<template>
	<base-question :element="element" :show-question-number="showNumber" @click="$emit('click')"
		@copy="id => emit('copy', id)" @delete="id => emit('delete', id)">
		<template #options>
			<!-- 输入框 -->
			<div class="input-container">
				<el-input type="textarea" v-model="inputValue" :placeholder="placeholder" :disabled="true" />
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'

const emit = defineEmits(['click', 'copy', 'delete', 'update'])

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

// const questionTitle = computed(() => props.element.title || props.element.name)
const placeholder = computed(() => props.element.placeholder || '请输入')

const inputValue = ref('')

const handleQuestionTitleChange = (newValue) => {
	emit("update", "title", newValue)
}
</script>

<style scoped>
/* 输入框样式 */
.input-container {
	margin-left: 40px;
	width: 60%;
}

.input-container :deep(.el-textarea.is-disabled .el-textarea__inner) {
	cursor: default
}
</style>