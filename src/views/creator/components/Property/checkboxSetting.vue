<template>
	<div class="checkbox-setting">
		<base-question-setting
			:element-id="element.id"
			v-model:advancedLogicText="choiceShowHideValue" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			:isOptionSetting="isOptionSetting" 
			@setLogic="emit('setLogic', props.element)"
		>
			<template #before-basic>
				<div class="section-content">
					<QuestionTypeSwitcher :quesitonTypeText="quesitonTypeText" 
						@update:questionType="(type) => emit('update:questionType', type)"
					/>
				</div>
			</template>
		</base-question-setting>

		<!-- 选项设置 -->
		<div class="setting-section" v-show='!isOptionSetting'>
			<div class="section-title">选项设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>选项随机排列</span>
					<el-switch v-model="randomOrder" />
				</div>
			</div>
		</div>

		<!-- 添加选项限制设置 -->
		<div class="setting-section" v-show='!isOptionSetting'>
			<div class="section-title">可选范围</div>
			<div class="section-content">
				<div class="limit-row">
					<div class="limit-item">
						<span>最少</span>
						<el-select v-model="minSelectedChoices" class="limit-select">
							<el-option v-for="n in element.choices.length" :key="`min-${n}`" :label="`${n}项`"
								:value="n" />
						</el-select>
					</div>
					<div class="limit-item">
						<span>最多</span>
						<el-select v-model="maxSelectedChoices" class="limit-select">
							<el-option v-for="n in element.choices.length" :key="`max-${n}`" :label="`${n}项`"
								:value="n" />
						</el-select>
					</div>
				</div>
			</div>
		</div>

		<!-- 单独选项设置 -->
		<div class="setting-section" v-show='isOptionSetting'>
			<div class="section-title">选项设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>在选项后增加填空框</span>
					<el-switch v-model="addInputAfterChoice" />
				</div>
				<div v-show="addInputAfterChoice">
					<div class="setting-item">
						<span>文本框类型</span>
						<el-select v-model="textboxType" @change="handleTextboxTypeChange">
							<el-option v-for="(item, index) in textOrTextareaList" :key="index" :label="item"
								:value="index" />
						</el-select>
					</div>
					<div class="setting-item">
						<span>是否必填</span>
						<el-switch v-model="isRequiredChoice" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'
import QuestionTypeSwitcher from '@/views/creator/components/Property/QuestionTypeSwitcher.vue'
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
	quesitonTypeText: {
		type: String,
		default: ""
	},
	isOptionSetting: {
		type: Boolean,
		default: false
	},
	selectedOptionIndex: {
		type: Number,
		default: -1
	}
})

const emit = defineEmits([
	'update:required',
	'update:showNumber',
	'setting-update',
	'update:questionType',
	'setLogic'
])

const { choiceShowHideValue } = useCommonComputed(props, emit)

const requiredValue = computed({
	get: () => props.element.isRequired,
	set: (value) => emit('update:required', value)
})

const showNumberValue = computed({
	get: () => props.showNumber,
	set: (value) => emit('update:showNumber', value)
})

const randomOrder = computed({
	get: () => (props.element.choicesOrder && props.element.choicesOrder == "random") || false,
	set: (value) => emit('setting-update', "choicesOrder", value)
})

const minSelectedChoices = computed({
	get: () => props.element.minSelectedChoices || 0,
	set: (value) => emit('setting-update', "minSelectedChoices", value)
})

const maxSelectedChoices = computed({
	get: () => props.element.maxSelectedChoices || 0,
	set: (value) => emit('setting-update', "maxSelectedChoices", value)
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

const addInputAfterChoice = computed({
	get: () => {
		if (props.selectedOptionIndex === -1) return
		return props.element.choices[props.selectedOptionIndex].showText || false
	},
	set: (value) => {
		emit('setting-update', 'choices', { showText: value })
	}
})

const isRequiredChoice = computed({
	get: () => {
		if (props.selectedOptionIndex === -1) return
		return props.element.choices[props.selectedOptionIndex].required || false
	},
	set: (value) => {
		emit('setting-update', 'choices', { required: value })
	}
})

const textOrTextareaList = ['单行文本', '多行文本']

const textboxType = computed(() => {
	if (props.selectedOptionIndex === -1) return
	return props.element.choices[props.selectedOptionIndex].textType === "text" ? 0 : 1
})

const handleTextboxTypeChange = (textboxTypeIndex) => {
	const textTypeValue = textboxTypeIndex === 1 ? "area" : "text"
	emit('setting-update', 'choices', { textType: textTypeValue })
};

</script>

<style scoped lang="scss">
@import '@/assets/styles/questionSetting.scss';

.section-content {
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;

		span {
			color: #606266;
			font-size: 14px;
		}
	}
}

:deep(.el-select) {
	width: 120px;
}

:deep(.el-segmented) {
	--el-segmented-item-selected-bg-color: white;
	--el-segmented-item-selected-color: rgb(33, 33, 33);
}

/* 添加选项限制相关样式 */

.limit-item {
	display: flex;
	align-items: center;
	margin: 8px 0;
}

.limit-item span {
	color: #606266;
	font-size: 14px;
	min-width: 40px;
}

.limit-select {
	width: 90px;
}

:deep(.limit-select .el-input__wrapper) {
	box-shadow: none !important;
}

:deep(.limit-select .el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #dcdfe6 !important;
}

:deep(.limit-select .el-input__wrapper:focus-within) {
	box-shadow: 0 0 0 1px #409EFF !important;
}
</style>