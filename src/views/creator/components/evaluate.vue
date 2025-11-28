<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@click="$emit('click')" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		@setLogic="element => emit('setLogic', element)">
		<template #options>
			<!-- 评分内容 -->
			<div class="evaluate-content">
				<div class="score-list">
					<img v-for="n in 5" :key="n" :src="`/images/questionnaire/${n}score.png`" class="score-image" />
				</div>
			</div>

			<!-- 评分说明 -->
			<div class="scale-labels">
				<span class="left-label">非常不满意</span>
				<span class="right-label">非常满意</span>
			</div>
		</template>
	</base-question>
</template>

<script setup>
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


const handleTitleChange = (newvalue) => {
	emit('update', 'title', newvalue)
}
</script>

<style scoped>
/* 保持评分内容样式不变 */
.evaluate-content {
	margin-left: 40px;
	padding-bottom: 16px;
	width: 60%;
}

.score-list {
	margin-left: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.score-image {
	width: 30px;
	height: 30px;
	cursor: default;
}

/* 评分说明样式 */
.scale-labels {
	display: flex;
	justify-content: space-between;
	color: #606266;
	font-size: 14px;
	width: 60%;
	padding: 0 16px;
}

.left-label {
	margin-left: 10px;
	/* 微调位置以对齐第一个图片 */
}

.right-label {
	margin-right: -65px;
	/* 微调位置以对齐最后一个图片 */
}
</style>