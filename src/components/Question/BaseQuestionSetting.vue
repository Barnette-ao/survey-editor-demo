<template>
	<div class="question-setting">
		<!-- 整题设置部分 -->
		<div class="setting-section" v-show="!editorStore.isOptionSetting">
			<div class="section-title">整题设置</div>
			<div class="section-content">
				<!-- 基础设置插槽 - 放在最前面的设置项 -->
				<slot name="before-basic"></slot>

				<!-- 默认的必答和显示序号设置 -->
				<div class="setting-item" v-show="showIsRequired">
					<span>此题必答</span>
					<el-switch v-model="required" />
				</div>
				<div class="setting-item" v-show="showNumberItem">
					<div class="item-with-icon">
						<span>显示序号</span>
					</div>
					<el-switch v-model="showQuestionNumber" />
				</div>

				<!-- 基础设置后的插槽 - 放在必答和显示序号之后的设置项 -->
				<slot name="after-basic"></slot>

				<!-- 逻辑设置始终在最后 -->
				<div class="setting-item">
					<div class="item-with-icon">
						<span>逻辑设置</span>
					</div>
					<div class="setting-link" @click="handleLogicSetting">设置</div>
				</div>
				<div class="setting-item" v-show="showSubDescription">
					<div class="item-with-icon">
						<span>题干说明</span>
					</div>
					<el-switch v-model="isAddSubDescription" />
				</div>
			</div>
		</div>

		<slot></slot>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { useCurrentElement } from "@/views/creator/composables/useCurrentElement"
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { useEditorStore } from "@/stores/editorContextStore";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";

const props = defineProps({
	showSubDescription: {
		type: Boolean,
		default: true,
	},
	showIsRequired: {
		type: Boolean,
		default: true,
	},
});

const editorStore = useEditorStore()
const { draftState } = useDraftContext()
const { currentElement } = useCurrentElement(draftState)
const { 
	applyElementPropChange,
	applySetSubDescriptionFalse 
} = useDraftActions()

const showNumberItem = computed(() => currentElement.hideNumber !== undefined)

const required = computed({
	get: () => currentElement.value.isRequired,
	set: (value) => {
		applyElementPropChange({
			questionId:editorStore.currentQuestionId,
			key: "isRequired",
			value
		})
	}
});

const showQuestionNumber = computed({
	get: () => currentElement.value.showNumber,
	set: (value) => {
		applyElementPropChange({
			questionId:editorStore.currentQuestionId,
			key: "showNumber",
			value
		})
	},
});

const isAddSubDescription = computed({
	get: () => {
		return currentElement.value.showSubDescription || false
	},
	set: (value) => {
		applyElementPropChange({
			questionId:editorStore.currentQuestionId,
			key: "showSubDescription",
			value
		})
		if (!value) {
			applySetSubDescriptionFalse({
				questionId:editorStore.currentQuestionId,
				key: "showSubDescription",
				value
			},{
				questionId:editorStore.currentQuestionId,
				key: "description",
				value:''
			})
		}
	}
})

const handleLogicSetting = () => {
	editorStore.openLogicDialog()
};

</script>

<style scoped lang="scss">
.setting-section {
	margin-bottom: 20px;
}

.section-title {
	font-size: 15px;
	font-weight: bold;
	color: #333;
	padding-bottom: 10px;
	border-bottom: 1px solid #ebeef5;
}

.section-content {
	border-bottom: 1px solid #ebeef5;
	margin-bottom: 10px;

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

.item-with-icon {
	display: flex;
	align-items: center;
	gap: 4px;
}

.setting-link {
	color: #409eff;
	cursor: pointer;
	font-size: 14px;

	&:hover {
		color: #66b1ff;
	}
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}

.optionSetting {
	margin-top: 10px;
}

.advanceLogicSetting{
	margin: 8px 0 5px 0;
	.itemText{
		margin-bottom: 8px;
		color: #606266;
		font-size: 14px;
	}
}
</style>
