<template>
	<el-dialog v-model="dialogVisible" title="逻辑设置" width="800px" @open="openDialog" @close="closeDialog"
		style="max-height: 600px; overflow: auto ;">
		<!-- 上部分 -->
		<div class="logic-header">
			<div class="logic-title">
				<el-radio-group v-model="logicClass" >
					<el-radio-button label="跳转逻辑" value="skipLogic" v-if="canSetLogic(element.type)" />
					<el-radio-button label="显示逻辑" value="visibleLogic" :disabled="isFistElement"/>
				</el-radio-group>
			</div>
			<div class="logic-actions" v-if="logicClass === 'skipLogic'">
				<el-button type="primary" @click="addLogicRule">
					添加逻辑设置
				</el-button>
			</div>
		</div>

		<!-- 下部分 -->
		<div class="logic-content">
			<div v-for="(rule, ruleIndex) in displayedLogicRules" :key="ruleIndex" class="logic-rule"
				@click="clickLogicRule(ruleIndex)">
				<!-- 添加删除按钮 -->
				<div class="delete-rule">
					<el-button class="btn" @click="removeLogicRule(ruleIndex)">
						<el-icon color="red">
							<CircleCloseFilled />
						</el-icon>
					</el-button>
				</div>

				<!-- 如果条件组 -->
				<div class="if-conditions">
					<div v-for="(condition, index) in rule.ifConditions" :key="index" class="content">
						<div class="condition-row additional-condition">
							<!-- 第一行如果条件分句，如果开头-->
							<div v-if="index == 0">
								<span class="condition-label if">如果</span>
							</div>
							<!-- 第二行至第N行如果条件分句，或者开头 -->
							<div v-else>
								<!-- 第三行至第N行的条件连接词禁止修改，与第二行的条件连接词保持一致 -->
								<el-select v-model="condition.connector" :disabled="index > 1" style="width: 60px">
									<el-option label="或" value="or" />
									<el-option label="且" value="and" />
								</el-select>
							</div>
							<!-- 如果条件题目元素 -->
							<el-select v-model="condition.elementId" placeholder="请选择"
								@change="changeIfCoditionElement($event, ruleIndex, index)"
								@visible-change="getDiabledIndex($event, ruleIndex, element.type)">
								<el-option v-for="(element, index) in allIfElement" :key="element.id"
									:label="element.title" :value="element.id"
									:disabled="logicClass !== 'skipLogic' && index > disabledIndex" />
							</el-select>
							<!-- 如果条件选择状态 -->
							<el-select v-model="condition.state" placeholder="请选择" style="width: 100px"
								@change="changeIfCoditionState($event, ruleIndex, index)">
								<el-option
									v-for="state in getConditionStatesByType(getLogicRuleElement(ruleIndex, index))"
									:key="state.value" :label="state.label" :value="state.value" />
							</el-select>

							<!-- 选项选择框 -->
							<template v-if="shouldShowChoiceSelect(ruleIndex, index, condition.state)">
								<el-select v-model="condition.choiceIndex" :multiple="isCheckbox(ruleIndex, index)" collapse-tags placeholder="请选择选项"
									style="width: 240px">
									<el-option v-for="(choice, choiceIndex) in (getLogicRuleElement(ruleIndex, index) as any)?.choices"
										:key="choiceIndex" :label="getLabelOfChoiceSelected(choice)" :value="choiceIndex" />
								</el-select>
							</template>

							<!-- 分数选择框 -->
							<template v-if="shouldShowScoreSelect(ruleIndex, index, condition.state)">
								<el-select v-model="condition.score" placeholder="分数" style="width: 100px">
									<el-option v-for="option in getScoreOptions(ruleIndex, index)" :key="option.value"
										:label="option.label" :value="option.value" />
								</el-select>
							</template>

							<el-button class="btn" @click="addIfCondition(rule)">
								<el-icon color="#4873ff">
									<CirclePlus />
								</el-icon>
							</el-button>
							<el-button class="btn" @click="removeIfCondition(rule, index)" v-show="index > 0">
								<el-icon color="#f19e97">
									<Remove />
								</el-icon>
							</el-button>
						</div>
					</div>
				</div>

				<el-divider border-style="dashed" />

				<!-- 则条件组 -->
				<div class="then-conditions">
					<div class="thenContent">
						<div class="condition-row">
							<span class="condition-label">则</span>
							<span class="thenaction-label">{{ thenActionText }}</span>
							<span v-if="logicClass !== 'skipLogic'">本题</span>
							<el-select v-else 
								v-model="rule.thenCondition.targetElementId" 
								placeholder="选择题目"
								@visible-change="getDiabledIndex($event, ruleIndex, element.type)"
							>
								<el-option v-for="(element, targetElementIndex) in allTargetElements" 
								    :key="element.id"
									:label="'title' in element ? element.title : element.id" 
									:value="element.id"
									:disabled="targetElementIndex <= disabledIndex" 
								/>
							</el-select>

							<span>{{ thenText }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="cancelSave">取消</el-button>
				<el-button type="primary" @click="saveLogicSettings">
					保存
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang = "ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, watch,isProxy } from 'vue';
import { 
	isDefaultRule, 
	isEqual, 
	isCompleteRule
} from "@/views/creator/utils/logicRule";
import { initializeDisplayedLogicRules } from "@/views/creator/utils/logicRule/create"
import { useHistory} from "@/views/creator/composables/useLogicRule/useHistory"
import { useElementData} from "@/views/creator/composables/useLogicRule/useElementData"
import { useLogicClass } from "@/views/creator/composables/useLogicRule/useLogicClass"
import { useDisplayLogicRules } from "@/views/creator/composables/useLogicRule/useDisplayLogicRules"
import { useLogicRuleElements } from "@/views/creator/composables/useLogicRule/useLogicRuleElements"
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { getConditionStatesByType } from "@/views/creator/utils/logicRuleUI"
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { snapshot } from "@/views/creator/utils/shared"
import { useEditorStore } from "@/stores/editorContextStore";

import type { 
  QuestionElement, 
  LogicRule 
} from '@/views/creator/types/questionnaire'

const props = defineProps<{
  visible: boolean,
  element: QuestionElement | null
}>()

const editorStore = useEditorStore()
const { draftState } = useDraftContext()
const { applyReplaceLogicState } = useDraftActions()
const { 
	addUniqueHistoryItems, 
	filterHistoryBy, 
	removeHistoryItem,
	resetHistory 
} = useHistory()

const TEXT_TYPES = ['html', 'panel', 'signaturepad', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment'];
const displayedLogicRules = ref<LogicRule[]>([])

// draftState一定要将其作为参数传入，而不是draftState.value
// 否则当用户关闭修改draftState时，不能同步更新allElements
// 这也给了一个启示，allElements依赖于draftState，
// 而draftState是一个外来变量，非自身局部变量，所以需要可以保持同步更新。 
const {
	allElements,
	allIfElement,
	allTargetElements,
	isFistElement,
	getCurrentElementIndex,
} = useElementData(props, draftState, TEXT_TYPES)


const canSetLogic = (type: string): boolean => !TEXT_TYPES.includes(type)

const {
	logicClass,
    thenActionText,
    thenText,
	getDefaultRule,
	initLogicClass,
	resetLogicClass,
} = useLogicClass(props, TEXT_TYPES)

const {
    getDisplayRuleProp,
	getDeletedDisplayRule,
	getDisplayRuleIfElementProp,
	isDisplayRuleEmpty,
	changeIfCoditionElement,
	changeIfCoditionState,
	getMaxConditionIndex
} = useDisplayLogicRules(
	allElements.value, 
	displayedLogicRules
)

const {
	getLogicRuleElement,
	shouldShowChoiceSelect,
	shouldShowScoreSelect, 
	getLabelOfChoiceSelected,
	getScoreOptions,
	isCheckbox,
} = useLogicRuleElements(allIfElement.value, getDisplayRuleIfElementProp, isDisplayRuleEmpty)

// 控制对话框显示
const dialogVisible = computed<boolean>(() => props.visible);

// ✅ 监听 draftState.value 的变化，自动处理题目删除
watch([
	() => props.element, 
	() => draftState.value.logicRules, 
	() => logicClass.value,
  ], 
  ([newElement, newRules, newLogicClass]) => {
	if (!newElement) return
	
	const validRules = initializeDisplayedLogicRules(
		newElement,
		newRules, 
		newLogicClass,
		allElements.value
	)

	// 已有逻辑规则中没有符合要求的，则显示一条默认逻辑规则单元
	if (validRules.length === 0) {	
      const defaultRule = getDefaultRule()	
	  displayedLogicRules.value = [defaultRule!]
    } else {
      displayedLogicRules.value = validRules
    }
  }, 
{ immediate: true});


const openDialog = () : void => {
	initLogicClass()
	const validRules = initializeDisplayedLogicRules(
		props.element!,
		draftState.value.logicRules, 
		logicClass.value,
		allElements.value
	)

	// 已有逻辑规则中没有符合要求的，则显示一条默认逻辑规则单元
	if (validRules.length === 0) {
      const defaultRule = getDefaultRule()
      displayedLogicRules.value = [defaultRule!]
    } else {
      displayedLogicRules.value = validRules
    }
	console.log("逻辑规则模块的打开弹框的显示规则",
		displayedLogicRules.value)	
}

// 用户点击过的逻辑规则数组 
const clickLogicRule = (ruleIndex: number) : void => {
  const ruleId = getDisplayRuleProp(ruleIndex, "id");
  addUniqueHistoryItems(ruleId)
};
// 对用户点击过的数组进行分类，新插入的逻辑规则和修改过的逻辑规则
// 这个方法一定要在保存按钮的事件处理方法中执行
// 输出新插入的，修改过的，非默认的完整的逻辑规则的ID数组
const classifyHistory = (currentTypeRules : LogicRule[]) : { 
  newLogicRulesId: string[] 
  updatedLogicRulesId: string[] 
} => {
	// 1. 获取当前逻辑类型的历史记录
	const currentTypeHistory = filterHistoryBy(
		id => currentTypeRules.some(rule => rule.id === id)
	);
	
	// 2. 处理空历史记录
	if (currentTypeHistory.length === 0) {
		return { newLogicRulesId: [], updatedLogicRulesId: [] };
	}
	
	// 3. 获取已保存的规则ID（按当前逻辑类型）
	const savedRulesOfType = filterRulesByType(
		draftState.value.logicRules ?? [], 
		logicClass.value
	);
	const savedRuleIds = savedRulesOfType.map(rule => rule.id);
	
	// 4. 分类新插入的规则
	const newLogicRulesId = currentTypeHistory
		.filter(id => !savedRuleIds.includes(id));
	
	// 5. 分类修改的规则
	const updatedLogicRulesId = currentTypeHistory
		.filter(id => !newLogicRulesId.includes(id))
		.filter(id => {
			const currentRule = currentTypeRules.find(r => r.id === id);
			const originalRule = savedRulesOfType.find(r => r.id === id);
			return originalRule && !isEqual(originalRule, currentRule);
		});
	
	return { newLogicRulesId, updatedLogicRulesId }
}

// 删除整个逻辑规则
const deletedLogicRulesId = ref<string[]>([])
const removeLogicRule = (index : number) => {
	ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		// 在UI对相框中删除
		const deletedRule = getDeletedDisplayRule(index);
		// ?? []：当前面结果为 null 或 undefined 时，返回空数组
		// 确保settedlogicRulesId不会出现 undefined，返回值始终是数组
		const settedlogicRulesId = (draftState.value.logicRules ?? []).map(rule => rule.id);
		if (settedlogicRulesId.includes(deletedRule.id)) {
			deletedLogicRulesId.value.push(deletedRule.id)
		}else {
			removeHistoryItem(deletedRule.id)
		}
	
		ElMessage({
			type: "success",
			message: "删除成功",
		});
	});

};

// 添加新的逻辑规则
const addLogicRule = () : void => {
	const defaultRule = getDefaultRule()
	// 添加新的逻辑规则后，默认逻辑规则可以显示，无论原来选择了任何题型
	displayedLogicRules.value.push(defaultRule!)
};



// 控制是否需要计算禁用索引
const shouldCalculateDisabled = ref<boolean>(false)
const currentRuleIndex = ref<number>(-1)
const currentType = ref<string>('')

const getDiabledIndex = (visible : boolean, ruleIndex : number, type : string) :void => {
	shouldCalculateDisabled.value = visible;
    currentRuleIndex.value = ruleIndex;
    currentType.value = type;
};

const disabledIndex = computed<number>(() => {
    if (!shouldCalculateDisabled.value) return -1;
    if (canSetLogic(currentType.value)) {
		// 跳转逻辑：所有如果条件分支中条件题目元素最大的索引即禁用索引
		if (logicClass.value === 'skipLogic') {
			const maxConditionIndex = getMaxConditionIndex(currentRuleIndex.value);
			return maxConditionIndex
		}
		// 显示逻辑：获取当前题目的索引
		return getCurrentElementIndex.value;
	}else {
        return getCurrentElementIndex.value
    }
});



const addIfCondition = (rule: LogicRule): void => {
	rule.ifConditions.push({
		elementId: '',
		connector: (rule.ifConditions[1] && rule.ifConditions[1].connector) || 'or',
		state: '',
		choiceIndex: "",
		score: "",
	});
};


const removeIfCondition = (rule: LogicRule, index: number): void => { rule.ifConditions.splice(index, 1);};

const filterRulesByType =  (rules: LogicRule[], logicClassType: string): LogicRule[] => {
  return rules.filter(rule => {
    if (logicClassType === 'skipLogic') {
      return rule.thenCondition.action === 'jump';
    } else {
      return ['show', 'hide'].includes(rule.thenCondition.action);
    }
  });
};

// 获取当前所有的显示类型的逻辑规则
const filteredRulesByType = computed<LogicRule[]>(() => 
  filterRulesByType(displayedLogicRules.value, logicClass.value)
);

// 1. 获取当前逻辑类型的完整规则
const currentTypeRules = computed<LogicRule[]>(() => 
	filteredRulesByType.value
		.filter(rule => isCompleteRule(rule))
		.filter(rule => !isDefaultRule(rule))
);

// 不完整规则
const incompleteRules = computed<LogicRule[]>(() => 
	filteredRulesByType.value
		.filter(rule => !isCompleteRule(rule))
);

// displayedLogicRules.value,logicClass.value
//只有点击保存按钮，才能保存设置的逻辑规则，此外，无论点击
//取消还是右上角的关闭符号，都不会
const saveLogicSettings = () : void => {
  if (incompleteRules.value.length > 0) {
    ElMessage({ type: 'warning', message: '有规则不完整，请完善后再保存' });
    return;
  }

  // 3. ✅ 将 currentTypeRules 作为参数传递
  const { newLogicRulesId, updatedLogicRulesId } = classifyHistory(currentTypeRules.value);

  // 点击保存按钮，
  // 将logicRules：最新的logicRules逻辑规则
  // newLogicRulesId: 新添加的非默认状态下的逻辑规则的id
  // updatedLogicRulesId: questionSettings.logicRules中修改过的逻辑规则的id
  // deletedLogicRulesId: questionSettings.logicRules中被删除的逻辑规则的id
  // 将这些数据传递给上层组件

  applyReplaceLogicState({
	logicRules: snapshot(currentTypeRules.value),
	newLogicRulesId,
	updatedLogicRulesId,
	deletedLogicRulesId:snapshot(deletedLogicRulesId.value)
  })
  editorStore.closeLogicDialog()
}

const cancelSave = () : void => {
	resetLogicClass()
	editorStore.closeLogicDialog()
}
const closeDialog = () : void => {
	resetLogicClass()
	// 重置状态
	resetHistory()
	deletedLogicRulesId.value = [];
	editorStore.closeLogicDialog()
}

</script>

<style scoped lang="scss">
.logic-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;

	.logic-title {
		font-size: 16px;
		font-weight: bold;
	}
}

.logic-content {
	.logic-rule {
		background-color: rgb(247, 248, 250);
		margin-bottom: 20px;
		padding: 15px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		position: relative;
	}

	.delete-rule {
		position: absolute;
		top: -15px;
		right: -5px;
	}

	.condition-row {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		gap: 10px;

		.condition-label {
			/* display: block; */
			width: 30px;
			text-align: left;
			margin-left: 10px;

			&.if {
				margin-left: 0px;
			}
		}

		

		&.additional-condition {
			margin-left: 6px;
		}

	}

	.if-conditions {
		margin-bottom: 10px;

	}

	.errorMsg {
		margin-left: 77px;
		color: red;
		font-size: 14px;
		margin-bottom: 5px;
	}
}

.btn {
	border: none;
	background: transparent;
	padding: 0;
	margin-left: 0;
}

.score-separator {
	margin: 0 8px;
}

:deep(.el-divider--horizontal) {
	margin: 0px 0 10px 0;
}

:deep(.el-select) {
	--el-select-width: 40%
}
</style>