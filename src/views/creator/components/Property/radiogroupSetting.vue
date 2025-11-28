<template>
	<div class="radiogroup-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			:isOptionSetting="isOptionSetting"
			@setLogic="emit('setLogic', element)"
			v-model:advancedLogicText="choiceShowHideValue" 	
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
						<el-select v-model="textboxType" class="limit-select" @change="handleTextboxTypeChange">
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
import { ref, computed } from 'vue'
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
</style>