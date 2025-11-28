<template>
	<div class="scale-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			@setLogic="emit('setLogic', element)"
			v-model:advancedLogicText="choiceShowHideValue"   
		/>

		<!-- 选项设置 -->
		<div class="setting-section">
			<div class="section-title">量表设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>量级设置</span>
					<el-input-number v-model="rateMax" size="small" controls-position="right" />
				</div>
				<div class="setting-item">
					<span>起始数值</span>
					<el-input-number v-model="rateMin" size="small" controls-position="right" />
				</div>
				<div class="setting-item">
					<span>量级刻度</span>
					<el-input-number v-model="rateStep" size="small" controls-position="right" />
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

const rateMax = computed({
	get: () => props.element.rateMax || 5,
	set: (value) => emit('setting-update', 'rateMax', value)
})

const rateMin = computed({
	get: () => props.element.rateMin || 1,
	set: (value) => emit('setting-update', 'rateMin', value)
})

const rateStep = computed({
	get: () => props.element.rateStep || 1,
	set: (value) => emit('setting-update', 'rateStep', value)
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

.section-content .setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;
}

.section-content .setting-item span {
	color: #606266;
	font-size: 14px;
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
}

.setting-link:hover {
	color: #66b1ff;
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

:deep(.el-input-number) {
	width: 50px;
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

.setting-item .scaleStep {
	display: flex;
	align-items: center;
}

.scaleStep .stepItem {
	width: 30px;
	height: 20px;
	background-color: white;
	text-align: center;
	font-size: 12px;
	line-height: 20px;
	border: 1px solid #dcdfe6;
	cursor: pointer;
	color: #606266;
	transition: all 0.3s;
}

.scaleStep .stepItem.active {
	border-color: #409EFF;
	color: #409EFF;
}

.scaleStep .stepItem:hover {
	color: #409EFF;
}
</style>