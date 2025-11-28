<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@click="$emit('click')" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		:editorId="`title-${element.id}`" @setLogic="element => emit('setLogic', element)">
		<template #options>
			<!-- 评分量表 -->
			<div class="scale-content">
				<!-- 评分选项 -->
				<div class="scale-options">
					<div class="score-list">
						<div v-for="value in scaleValues" :key="value" class="score-item">
							<div class="score-circle">{{ value }}</div>
						</div>
					</div>
				</div>

				<!-- 评分说明 -->
				<div class="scale-labels">
					<span class="left-label">非常不满意</span>
					<span class="right-label">非常满意</span>
				</div>
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { computed } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'

const emit = defineEmits(['click', 'copy', 'delete', 'update', 'setLogic'])

const props = defineProps({
	showNumber: {
		type: Boolean,
		default: true
	},
	element: {
		type: Object,
		default: () => { }
	},
	logicRuleNum: {
		type: Number,
		default: 0
	},
})


const scaleValues = computed(() => {
	const values = []

	const rateMin = props.element.rateMin || 1
	const rateMax = props.element.rateMax || 5
	const rateStep = props.element.rateStep || 1

	for (let i = rateMin; i <= rateMax; i += rateStep) {
		values.push(i)
	}
	return values
})



</script>

<style scoped>
/* 评分量表样式 */
.scale-content {
	margin-left: 40px;
	padding: 16px 0 0 0;
	width: 60%;
}

.scale-options {
	margin-bottom: 8px;
}

.score-list {
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 0 10px;
}

.score-item {
	display: flex;
	justify-content: center;
	align-items: center;
}

.score-circle {
	width: 30px;
	height: 30px;
	border: 1px solid #dcdfe6;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #606266;
	font-size: 14px;
	cursor: default;
}

/* 评分说明样式 */
.scale-labels {
	display: flex;
	justify-content: space-between;
	color: #606266;
	font-size: 14px;
}

.left-label {
	margin-left: -8px;
	/* 微调位置以对齐第一个单选框 */
}

.right-label {
	margin-right: 0px;
	/* 微调位置以对齐最后一个单选框 */
}
</style>