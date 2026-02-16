<template>
	<base-question :element="element" :show-question-number="showNumber">
		<template #options>
			<!-- 签名区域 -->
			<div class="sign-container">
				<div class="sign-area">
					<div class="sign-box">
						<div class="sign-placeholder">{{ element.placeholder }}</div>
					</div>
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


</script>

<style scoped lang="scss">
.sign-container {
	margin-left: 40px;
	width: 60%;
	// padding: 0 40px;
}

.sign-area {
	border: 1px dashed #dcdfe6;
	border-radius: 4px;
	padding: 20px;
	background-color: #f5f7fa;
}

.sign-box {
	position: relative;
	min-height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sign-placeholder {
	color: #909399;
	font-size: 14px;
	text-align: center;
}
</style>