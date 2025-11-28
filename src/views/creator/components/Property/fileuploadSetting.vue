<template>
	<div class="fileupload-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:advancedLogicText="choiceShowHideValue" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			@setLogic="emit('setLogic', element)" 
		/>

		<div class="setting-section">
			<div class="section-content">
				<div class="setting-item">
					<span>单个文件最大限制</span>
					<el-input-number v-model="byteLimit" size="small" :min="0" controls-position="right" />
					<span>Byte</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'
import { useCommonComputed } from '@/views/creator/utils/commonComputed'

const props = defineProps({
	element: {
		type: Object,
		required: true
	},
	showNumber: {
		type: Boolean,
		default: true
	},
	showNumberItem: {
		type: Boolean,
		required: true
	},
})

const emit = defineEmits(['update:required', 'update:showNumber', 'setting-update', 'setLogic'])

const { choiceShowHideValue } = useCommonComputed(props, emit)


const requiredValue = computed({
	get: () => props.element.isRequired,
	set: (value) => emit('update:required', value)
})

const showNumberValue = computed({
	get: () => props.showNumber,
	set: (value) => emit('update:showNumber', value)
})

const byteLimit = computed({
	get: () => props.element.maxSize || 0,
	set: (value) => emit('setting-update', "maxSize", value)
})

const isAddSubDescriptionValue = computed({
	get: () => {
		return props.element.showSubDescription || false
	},
	set: (value) => {
		emit('setting-update', 'showSubDescription', value)
		if (!value) {
			emit('setting-update', 'description', '')
		}
	}
})

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

:deep(.el-input-number) {
	width: 40px;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
	display: none;
	border: none;
	background: none;
}

:deep(.el-input-number:hover .el-input-number__decrease),
:deep(.el-input-number:hover .el-input-number__increase) {
	display: flex;
}

:deep(.el-input-number:hover .el-input__wrapper) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

:deep(.el-input-number .el-input__wrapper) {
	padding: 0 4px;
}

:deep(.el-input-number .el-input__inner) {
	text-align: left;
	padding-left: 6px;
}
</style>