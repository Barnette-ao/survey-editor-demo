<template>
	<div class="radiogroup-setting">
		<base-question-setting>
			<template #before-basic>
				<div class="section-content">
					<QuestionTypeSwitcher :quesitonTypeText="quesitonTypeText" 
						@update:questionType="(type) => emit('update:questionType', type)"
					/>
				</div>
			</template>
		</base-question-setting>

		<!-- 选项设置 -->
		<div class="setting-section" v-show='!editorStore.isOptionSetting'>
			<div class="section-title">选项设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>选项随机排列</span>
					<el-switch v-model="randomOrder" />
				</div>
			</div>
		</div>
		<!-- 单独选项设置 -->
		<div class="setting-section" v-show='editorStore.isOptionSetting'>
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
import { useCurrentElement } from "@/views/creator/composables/useCurrentElement"
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { useEditorStore } from "@/stores/editorContextStore";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";


const props = defineProps({
	element: {
		type: Object,
		required: true
	},
	quesitonTypeText: {
		type: String,
		default: ""
	},
})

const emit = defineEmits([
	'setting-update',
	'update:questionType',
])

const editorStore = useEditorStore()
const { draftState } = useDraftContext()
const { currentElement } = useCurrentElement(draftState)
const { applyElementPropChange,applyChoicePropChange } = useDraftActions()

const randomOrder = computed({
	get: () => (currentElement.value.choicesOrder === "random") || false,
	set: (value) => {
		const choicesOrderValue = value ? 'random' : 'none'
		applyElementPropChange({
			questionId:editorStore.currentQuestionId,
			key: "choicesOrder",
			value : choicesOrderValue
		}) 
	}
})


const addInputAfterChoice = computed({
	get: () => {
		if (editorStore.selectedOptionIndex === -1) return
		return props.element.choices[editorStore.selectedOptionIndex].showText || false
	},
	set: (value) => {
		applyChoicePropChange({
			questionId: editorStore.currentQuestionId,
			choiceIndex: editorStore.selectedOptionIndex,
			key: "showText",
			value,
		})
	}
})

const isRequiredChoice = computed({
	get: () => {
		if (editorStore.selectedOptionIndex === -1) return
		return props.element.choices[editorStore.selectedOptionIndex].required || false
	},
	set: (value) => {
		applyChoicePropChange({
			questionId: editorStore.currentQuestionId,
			choiceIndex: editorStore.selectedOptionIndex,
			key: "required",
			value,
		})
	}
})

const textOrTextareaList = ['单行文本', '多行文本']

const textboxType = computed(() => {
	if (editorStore.selectedOptionIndex === -1) return
	return props.element.choices[editorStore.selectedOptionIndex].textType === "text" ? 0 : 1
})

const handleTextboxTypeChange = (textboxTypeIndex) => {
	const textTypeValue = textboxTypeIndex === 1 ? "area" : "text"
	applyChoicePropChange({
		questionId: editorStore.currentQuestionId,
		choiceIndex: editorStore.selectedOptionIndex,
		key: "textType",
		value:textTypeValue,
	})
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