<template>
	<div class="question-setting">
		<!-- 整题设置部分 -->
		<div class="setting-section" v-show="!isOptionSetting">
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

				<div class="advanceLogicSetting">
					<div class="itemText">
						<span>高级逻辑设置</span>
					</div>
					<el-input
						v-model="localAdvancedLogicText"
						style="width: 100%"
						:rows="3"
						type="textarea"
						@blur="handleAdvancedLogicBlur"
					/>
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

const props = defineProps({
	required: {
		type: Boolean,
		default: true,
	},
	showNumber: {
		type: Boolean,
		default: true,
	},
	showNumberItem: {
		type: Boolean,
		default: true,
	},
	isAddSubDescription: {
		type: Boolean,
		default: false,
	},
	showSubDescription: {
		type: Boolean,
		default: true,
	},
	showIsRequired: {
		type: Boolean,
		default: true,
	},
	isOptionSetting: {
		type: Boolean,
		default: false,
	},
	elementId: {  
		type: String,
		required: true
	},
	advancedLogicText: {
		type: String,
		default: ''
	}
});

const emit = defineEmits([
	"update:required",
	"update:showNumber",
	"update:isAddSubDescription",
	"setLogic",
	"update:advancedLogicText"      
]);

const required = computed({
	get: () => props.required,
	set: (value) => emit("update:required", value),
});

const showQuestionNumber = computed({
	get: () => props.showNumber,
	set: (value) => {
		emit("update:showNumber", value);
	},
});

const isAddSubDescription = computed({
	get: () => props.isAddSubDescription,
	set: (value) => emit("update:isAddSubDescription", value),
});



const handleLogicSetting = () => {
	emit('setLogic')
};

const localAdvancedLogicText = ref('')

watch(() => props.advancedLogicText, (newVal) => {
  localAdvancedLogicText.value = newVal || ''
}, { immediate: true })

const handleAdvancedLogicBlur = () => {
  emit("update:advancedLogicText", localAdvancedLogicText.value)
}

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
