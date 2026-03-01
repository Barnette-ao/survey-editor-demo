<template>
	<div class="instruction-setting">
		<base-question-setting
			:element-id="element.id" 
			:showIsRequired = "false"
			:showSubDescription="false" 
		/>
	</div>
</template>

<script setup>
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'

const props = defineProps({
	element: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['setLogic'])
</script>

<style scoped lang="scss">
@import '@/assets/styles/questionSetting.scss';

.section-content {
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		/* border-bottom: 1px solid #ebeef5; */

		span {
			color: #606266;
			font-size: 14px;
		}
	}
}

.item-with-icon {
	display: flex;
	align-items: center;
	gap: 4px;
}

.help-icon {
	color: #909399;
	cursor: pointer;
}

.setting-link {
	color: #409eff;
	cursor: pointer;
	font-size: 14px;

	&:hover {
		color: #66b1ff;
	}
}

:deep(.el-select) {
	width: 120px;
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}

:deep(.el-segmented) {
	--el-segmented-item-selected-bg-color: white;
	--el-segmented-item-selected-color: rgb(33, 33, 33);
}
</style>