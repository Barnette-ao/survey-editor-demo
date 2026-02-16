<template>
	<base-question :element="element" :show-question-number="showNumber">
		<template #options>
			<!-- 输入框 -->
			<div class="input-container">
				<el-input :type="type" v-model="inputValue" :placeholder="placeholder" :disabled="true" />
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { ref } from 'vue'
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
	},
	type: {
		type: String,
		default: "text"
	}
})


const placeholder = computed(() => props.element.placeholder || '请输入')


const inputValue = ref('')
</script>

<style scoped>
/* 输入框样式 */
.input-container {
	margin-left: 40px;
	width: 60%;
}

.input-container :deep(.el-input.is-disabled .el-input__inner) {
	cursor: default
}
</style>