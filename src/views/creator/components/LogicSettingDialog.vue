<template>
	<el-dialog v-model="dialogVisible" title="逻辑设置" width="800px" @open="openDialog" @close="closeDialog"
		style="max-height: 600px; overflow: auto ;">
		<!-- 上部分 -->
		<div class="logic-header">
			<div class="logic-title">
				<el-radio-group v-model="logicClass" @change="changeLogicClass">
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
								<el-option v-for="item in allIfElement" :key="item.element.id"
									:label="item.element.title" :value="item.element.id"
									:disabled="logicClass !== 'skipLogic' && item.index > disabledIndex" />
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
									<el-option v-for="(choice, index) in getLogicRuleElement(ruleIndex, index).choices"
										:key="index" :label="getLabelOfChoiceSelected(choice)" :value="index" />
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
							<span class="thenaction-label">{{ thenAction }}</span>
							<span v-if="logicClass !== 'skipLogic'">本题</span>
							<el-select v-else 
								v-model="rule.thenCondition.targetElementId" 
								placeholder="选择题目"
								@visible-change="getDiabledIndex($event, ruleIndex, element.type)"
							>
								<el-option v-for="(element, targetElementIndex) in allTargetElements" 
								    :key="element.id"
									:label="element.title" 
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

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import {
	isDefaultRule, isEqual, isCompleteRule,isRating
} from "@/views/creator/config/helpers";

import { useLogicRuleState } from "@/views/creator/composables/useLogicRule/useLogicRuleState.js"


import { v4 as uuidv4 } from 'uuid'


const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	questionSettings: {
		type: Object,
		default: () => { }
	},
	element: {
		type: Object,
		default: () => { }
	}
});

const emits = defineEmits(['closeLogicDialog', 'saveLogicRules']);

const state = useLogicRuleState(props)
const elementData = useElementData(props.questionSettings, props.element)
const ruleOperations = useRuleOperations(state, elementData)
const conditionManager = useConditionManager(state, elementData)
const ruleValidation = useRuleValidation(state, props)
const uiInteraction = useUIInteraction(state, elementData, props)


const logicRules = ref([]);

const logicClass = ref('skipLogic');

// 控制对话框显示
const dialogVisible = computed(() => props.visible);

// 计算则条件的动作
const thenAction = computed(() => {
	return logicClass.value === 'skipLogic' ? "跳转" : "显示"
})

const thenText = computed(() => {
	return logicClass.value === 'skipLogic' ? "，否则正常进入下一题" : "。"
})

const TEXT_TYPES = ['html', 'panel', 'signaturepad', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment'];
const canSetLogic = (type) => {
	return !TEXT_TYPES.includes(type)
}

// 获取所有可选题目,这根本就不是选择所有可选题目，而是选择当前的题目元素对象
const filterType = ['panel', 'html', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment', 'signaturepad']
const allElements = computed(() => {
	return (props.questionSettings.pages ?? [])
		.flatMap(page => page.elements)
});

const allIfElement = computed(() => {
	return allElements.value
		.map((element, index) => { 
			return {element, index} 
		})
		.filter(item => !filterType.includes(item.element.type))
});

const allTargetElements = computed(() => {
	allElements.value.shift() // 移除简介页面
	return [...allElements.value, { id: "complete", title: "提前结束" }] // 加入一项提前结束的跳转目标选项
})

// 是否是第一个能够设置逻辑规则题目中，第二个题目元素
const isFistElement = computed(() => { 
	let elementIndex = allElements.value.findIndex(element =>
		props.element.id === element.id)
	return elementIndex === 1
});

// 过滤规则改为 computed
// 先根据跳转逻辑还是显示逻辑对logicRules进行筛选，如果是跳转逻辑
// 则条件动作为jump而且如果条件必须有一条的elementId是点击的题目的id
// 如果是显示逻辑，则条件动作是显示或者隐藏，则条件所对应的目标题目id必须是点击的题目的id
const filteredRules = computed(() => {
	return logicRules.value.filter(rule => {
		if (logicClass.value === 'skipLogic') {
			return rule.thenCondition.action === 'jump'
				&& rule.ifConditions.some(ifrule => ifrule.elementId === props.element.id);
		} else {
			return ['show', 'hide'].includes(rule.thenCondition.action)
				&& rule.thenCondition.targetElementId === props.element.id;
		}
	});
});

// displayedLogicRules是依赖于filteredRules的
// displayedLogicRules完全可以做计算属性，但是因为我在changeIfCoditionElement直接用displayedLogicRules修改值，
// 这违反了计算属性的
// displayedLogicRules如果是计算属性，那么不能直接修改计算属性的值
const displayedLogicRules = ref([]);

const getDefaultRule = () => {
	return {
		id: uuidv4(),
		ifConditions: [{
			elementId: logicClass.value === 'skipLogic' ? props.element.id : "",
			state: '',
			choiceIndex: "",
			score: "",
		}],
		thenCondition: {
			action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
			targetElementId: logicClass.value === 'skipLogic' ? '' : props.element.id
		}
	};
};

const displayDefaultRule = () => {
	const defaultRule = getDefaultRule()
	logicRules.value.push(defaultRule)
	displayedLogicRules.value = [defaultRule];
}

const openDialog = () => {
	logicClass.value = !canSetLogic(props.element.type) ? 'visibleLogic' : 'skipLogic';
	// 清除之前类型的修改记录
	logicRules.value.length = 0

	if (props.questionSettings.logicRules) {
		// props.questionSettings.logicRules表示点击逻辑设置按钮之前保存到数据库的
		// 逻辑规则，而logicRule表示现在最新的逻辑规则，对logicRule的修改不能影响到
		// props.questionSettings.logicRules，所以我要换成深拷贝
		const copiedRules = JSON.parse(JSON.stringify(props.questionSettings.logicRules))
		logicRules.value.push(...copiedRules)
	}

	if (filteredRules.value.length > 0) {
		displayedLogicRules.value = filteredRules.value
	} else {
		displayDefaultRule()
	}	
}

// 当过滤的规则非空时，
// 监听过滤的规则被修改以及切换逻辑规则类别的时候，立即同步
// 修改显示的逻辑规则，displayedLogicRules
//
// 当删除某一题目所有的显示逻辑或跳转逻辑规则时，过滤的规则为空时
// 不能立即显示默认规则，而是显示一片空白，让用户确定自己删除了一些规则
watch([filteredRules, logicClass], ([rules]) => {
	if (rules.length > 0) {
		displayedLogicRules.value = rules;
	}
}, { immediate: true });

// 因为对filteredRules的监听没有处理其为空的情况，
// 当切换逻辑规则类型时，若过滤规则为空，则说明该题没有设置该类逻辑规则
// 需要显示默认逻辑规则
const changeLogicClass = (value) => {
     // 如果当前类型没有规则，显示默认规则
    if (filteredRules.value.length === 0) {
        displayDefaultRule();
    }
}

// 用户点击过的逻辑规则数组 
const history = reactive([])
const clickLogicRule = (ruleIndex) => {
	const clickedLogicRule = displayedLogicRules.value[ruleIndex].id
	if (history.length === 0) {
		history.push(clickedLogicRule)
	} else {
		const index = history.findIndex((logicRuleId) => logicRuleId && logicRuleId === clickedLogicRule)
		const isClicked = index === -1
		if (isClicked) {
			history.push(clickedLogicRule)
		}
	}
	// console.log("history", history)
}

// 对用户点击过的数组进行分类，新插入的逻辑规则和修改过的逻辑规则
// 这个方法一定要在保存按钮的事件处理方法中执行
// 输出新插入的，修改过的，非默认的完整的逻辑规则的ID数组
// logicRules中只能存真正需要被删除的，新插入的，修改过的，非默认的完整的逻辑规则
const classifyHistory = () => {
	// 辅助函数：过滤掉默认规则和不完整的其他类逻辑规则
	// 点击保存按钮只保存一类逻辑规则，因此有如果在跳转规则点击
	const removeDefaultRules = (rules) => rules.filter(rule => rule && !isDefaultRule(rule))

	const removeDeletedRule = (rules) => rules.filter(rule =>
		rule && !deletedLogicRulesId.includes(rule.id))

	// 从点击过的规则ID中过滤掉真正需要被删除的规则ID
	const removedDeletedHistory = (history ?? [])
		.filter(item => !deletedLogicRulesId.includes(item));

    //从暂存的逻辑规则中，过滤掉真正被删除的逻辑规则
	logicRules.value = removeDeletedRule(logicRules.value)
	
	// 若没有设置任何逻辑规则，会显示默认逻辑规则，并将此默认逻辑规则存入最新逻辑规则logicRules
	// 若在没有设置任何逻辑规则的情况下，点击保存，那么要从logicRules删除默认的逻辑规则
	// 并将新插入的和修改的规则ID数组设置为空数组	
	if (removedDeletedHistory.length === 0) {
		logicRules.value = removeDefaultRules(logicRules.value)
		return { newLogicRulesId: [], updatedLogicRulesId: [] }
	}

	// 当实际插入修改规则之后，也要logicRules中删除默认规则
	logicRules.value = removeDefaultRules(logicRules.value)

	//从点击过的规则ID中去掉最新规则logicRule中所有默认规则的ID
	const removedDefaultHistory = removedDeletedHistory
		.map((ruleId) => logicRules.value.find(rule => rule && rule.id === ruleId))
		.filter(Boolean)
		.filter(rule => !isDefaultRule(rule))
		.map(rule => rule.id)
	// console.log("删除默认和被删除规则的history", removedDefaultHistory)

	// 收集已经存入数据库并设置过的逻辑规则的ID
	const settedlogicRulesId = (props.questionSettings.logicRules ?? [])
		.filter(rule => {
			const isShowAction = rule.thenCondition.action === "show";
			return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction;
		})
		.map(rule => rule.id)

	// 新插入的规则，是settedlogicRulesId中没有的规则
	// 如此从点击过的非默认和被删除的规则ID中，筛选出新插入的规则的ID
	const newLogicRulesId = removedDefaultHistory
		.filter(ruleId => !settedlogicRulesId.includes(ruleId))
	// console.log("新插入的规则的Id", newLogicRulesId)

	// 剩下的逻辑规则要么是修改的，要么是未修改过的，要从剩下的规则ID中筛选出修改过的规则的ID
	// 修改的规则，是ID与已保存并设置的规则的id相同，但不完全相同的逻辑规则
	// 未修改的规则，是已保存并设置的规则数组中的元素
	// 用排除法，筛选未修改的规则，然后取反。只要找到一个相等的逻辑规则，就表明它是未修改的
	// 应该被过滤掉。用some()
	const updatedLogicRulesId = removedDefaultHistory
		.filter(ruleId => !newLogicRulesId.includes(ruleId))  // 过滤掉新插入的规则ID
		.map(ruleId => logicRules.value.find(rule => rule && rule.id === ruleId)) //转换为规则对象
		.filter(rule => !(settedlogicRulesId) // 筛选出修改过的规则
			.some((logicRuleId) => { 
				const existingRule = props.questionSettings.logicRules.find(r => r.id === logicRuleId);
				return isEqual(existingRule, rule)
			}))
		.map(rule => rule.id) // 提取对应的id

	console.log("修改过的逻辑规则", updatedLogicRulesId)
	return { newLogicRulesId, updatedLogicRulesId }
}

// 删除整个逻辑规则
const deletedLogicRulesId = reactive([])
const removeLogicRule = (index) => {
	ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		// 在UI对相框中删除
		const deletedRule = displayedLogicRules.value.splice(index, 1)[0];

		// ?? []：当前面结果为 null 或 undefined 时，返回空数组
		// 确保settedlogicRulesId不会出现 undefined，返回值始终是数组
		const settedlogicRulesId = (props.questionSettings.logicRules ?? []).map(rule => rule.id);
		// 如果被删除的逻辑规则是已经保存到数据库中的逻辑规则，则将其id存入deletedLogicRulesId数组中
		if (settedlogicRulesId.includes(deletedRule.id)) {
			deletedLogicRulesId.push(deletedRule.id)
		}
		else {
			// 否则，其余的逻辑规则都需要删除history中的id
			const defaultRuleIdIndex = history.indexOf(deletedRule.id)
			if (defaultRuleIdIndex !== -1) {
				history.splice(defaultRuleIdIndex, 1)
			}
		}
		console.log("deletedLogicRulesId", deletedLogicRulesId)

		ElMessage({
			type: "success",
			message: "删除成功",
		});
	});

};

// 添加新的逻辑规则
const addLogicRule = () => {
	const defaultRule = getDefaultRule()
	// 加入最新的逻辑规则
	logicRules.value.push(defaultRule);
	// 添加新的逻辑规则后，默认逻辑规则可以显示，无论原来选择了任何题型
	displayedLogicRules.value.push(defaultRule)
};


// 定义题型分组
const CHOICE_TYPES = ['radiogroup', 'checkbox', 'dropdown', 'imagepicker']

// 计算属性，获取特定逻辑规则的如果条件的题目元素
const getLogicRuleElement = computed(() => {
	return (ruleIndex, index) => {
		// 显示逻辑规则为空
		if (displayedLogicRules.value.length === 0) {
			return {}
		}
		// 显示的逻辑规则非空
		return allIfElement.value.find((item) => {
			return item.element.id
				=== displayedLogicRules.value[ruleIndex].ifConditions[index].elementId
		})?.element
	}
})

// 改变如果条件从句的题目元素，如果条件题目可以重复，所以不会执行检测逻辑规则合理的方法
const changeIfCoditionElement = (elementId, ruleIndex, index) => {
	// 改变如果条件的题目，则重置选择状态
	displayedLogicRules.value[ruleIndex].ifConditions[index].state = ''
	// 获取如果条件题目元素
	const element = allIfElement.value.find(item => item.element.id === elementId)?.element

	if (element) {
		displayedLogicRules.value[ruleIndex].ifConditions[index].elementId = elementId
	}
}

// 控制是否需要计算禁用索引
const shouldCalculateDisabled = ref(false);
const currentRuleIndex = ref(-1);
const currentType = ref('');

// 将 disabledIndex 改为计算属性
// 获取禁用索引
// 在设置跳转逻辑，必要环节是设置跳转目标题目；在设置显示逻辑时，必要环节是设置显示逻辑的如果条件题目
// 跳转目标题目只能是设置跳转的题目序号之后的题目，显示逻辑的如果条件题目只能是设置显示逻辑之前的题目
// 那么，设置跳转的题目之前的题目是不能选的，设置显示的逻辑题目之后的题目是不能选的
// 所以，要确定跳转题目和显示题目的序列号。
// 现在可以设置跳转逻辑的题目也可以设置显示逻辑，而不能设置跳转逻辑的题目只能设置显示逻辑
// 设置显示逻辑关键在于确定设置显示逻辑的题目本身的序列号
// 这个序列号也被称为禁用索引
const disabledIndex = computed(() => {
	// 重置禁用索引
	// 共享变量，还原状态，如果不重新设置为-1，共享变量会影响下一次点击的值，只有重新设置为-1，
	// 才会让每一次点击下拉框的操作是独立的
    if (!shouldCalculateDisabled.value) return -1;

	// 根据题目类型和逻辑类型获取禁用索引
    if (canSetLogic(currentType.value)) {
        return getDisabledIndexForSkipLogicType(currentRuleIndex.value);
	}
	// 对于不可设置跳转逻辑题目
	// 当前题目的索引即设置显示逻辑时的禁用索引
	else {
        return allElements.value.findIndex(element => 
            props.element.id === element.id
        );
    }
});


const getDiabledIndex = (visible, ruleIndex, type) => {
	shouldCalculateDisabled.value = visible;
    currentRuleIndex.value = ruleIndex;
    currentType.value = type;
};

// 获取可设置逻辑题目的禁用索引
const getDisabledIndexForSkipLogicType = (ruleIndex) => {
	// 跳转逻辑：所有如果条件分支中条件题目元素最大的索引即禁用索引
	if (logicClass.value === 'skipLogic') {
		// 获取所有条件题目中最大的索引
		return getMaxConditionIndex(ruleIndex);
	}
	// 显示逻辑：获取当前题目的索引
	// 如果是可以设置跳转逻辑的题目，那么这种题目的显示逻辑的如果条件题目也只会是特定的几种题型
	// 单选，多选，下拉，选图片，量表，打分，评价，
	return allIfElement.value.findIndex(item =>
       	props.element.id === item.element.id
    ) ;
};

// 对于可以设置跳转逻辑的题目
// 在设置跳转逻辑时，禁用索引即该跳转逻辑对象中所有如果条件分支题目中具有最大的索引题目的索引
// 获取设置跳转逻辑时的禁用索引
const getMaxConditionIndex = (ruleIndex) => {
    let maxIndex = -1;
    displayedLogicRules.value[ruleIndex].ifConditions.forEach(ifCondition => {
        const index = allElements.value.findIndex(
            element => ifCondition.elementId === element.id
        );
        maxIndex = Math.max(maxIndex, index);
	});
	console.log("maxIndex",maxIndex)
    return maxIndex;
};

// 改变如果条件从句的条件选择状态
const changeIfCoditionState = (state, ruleIndex, index) => {
	// 设置条件选择状态
	displayedLogicRules.value[ruleIndex].ifConditions[index].state = state
	// 重置选项选择下拉框
	displayedLogicRules.value[ruleIndex].ifConditions[index].choiceIndex = ""
}

// 获取不同题目类型对应的条件选择状态
const getConditionStatesByType = (element) => {
	if (!element) return [];
	//选择类题型：单选，多选，下拉，选图片
	if (CHOICE_TYPES.includes(element.type)) {
		if (element.type === 'checkbox') { 
			return [
				{ label: "包含", value: "selected" },
				{ label: "不包含", value: "notBeSelected" },
				{ label: "已答", value: "answered" },
			];	
		}
		return [
			{ label: "选中", value: "selected" },
			{ label: "未选中", value: "notBeSelected" },
			{ label: "已答", value: "answered" },
		];
	}
	// 打分类题型：量表，打分，评价
	if (element.type === 'rating' || isRating(element.type)) {
		// 量表
		return [
			{ label: "等于", value: "equal" },
			{ label: "小于", value: "lessThan" },
			{ label: "大于", value: "greaterThan" },
			{ label: "大于等于", value: "greaterOrEqual" },
			{ label: "小于等于", value: "lesserOrEqual" },
		];
	}
	//'多项填空' multipletext, '文件上传' file, '排名' ranking, '矩阵选择' matrix, '单行文本' text, '多行文本' comment
};

// 判断是否需要显示选项类题型的第三个下拉框
const shouldShowChoiceSelect = (ruleIndex, index, state) => {
	const element = getLogicRuleElement.value(ruleIndex, index);

	if (!element) return false;

	// 选择类题型，选择选中或者未选中，则显示，其余不显示
	if (CHOICE_TYPES.includes(element.type)) {
		return ['selected', 'notBeSelected'].includes(state);
	}

	return false;
};

const isCheckbox = computed(() => { 
	return (ruleIndex, index) => { 
		const element = getLogicRuleElement.value(ruleIndex, index);
		return element && element.type === 'checkbox';
	}
})

// 获取选择类题型的下拉列表选项文字
const getLabelOfChoiceSelected = computed(() => {
	return (choice) => {
		return typeof choice === 'object' && choice !== null ? choice.value : choice
	}
})

// 判断是否需要显示分数下拉框
const shouldShowScoreSelect = (ruleIndex, index, state) => {
	const element = getLogicRuleElement.value(ruleIndex, index);

	if (!element || element.type !== 'rating') return false;
	// 量表,打分，评价题型，且选择状态为等于，小于，大于，大于等于，小于等于，则显示，否则不显示
	return ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state);
};

// 获取量表类题型的分数下拉框的表项
const getScoreOptions = computed(() => {
	return (ruleIndex, index) => {
		const element = getLogicRuleElement.value(ruleIndex, index)

		if (!element || element.type !== 'rating') return [];

		const values = []

		const rateMin = element.rateMin || 1
		const rateMax = element.rateMax || 5
		const rateStep = element.rateStep || 1

		let count = 1
		for (let i = rateMin; i <= rateMax; i += rateStep) {
			values.push({
				label: i, value: count++
			})
		}
		return values
	}
})

// 添加"如果"条件
const addIfCondition = (rule) => {
	rule.ifConditions.push({
		connector: (rule.ifConditions[1] && rule.ifConditions[1].connector) || 'or',
		state: '',
		choiceIndex: "",
		score: "",
	});
};

// 删除"如果"条件
const removeIfCondition = (rule, index) => {
	rule.ifConditions.splice(index, 1);
};

//只有点击保存按钮，才能保存设置的逻辑规则，此外，无论点击
//取消还是右上角的关闭符号，都不会
const saveLogicSettings = () => {
	// 将设置各种逻辑规则保存到questionSettings
	// 1.根据逻辑规则类型，筛选需要保存的逻辑规则
	// 根据当前保存的逻辑规则的类型，过滤掉非该类型的逻辑规则，
	// 这样就意味着，对非该类型的逻辑规则进行修改，添加，删除，这些操作根本不会保存。
	logicRules.value = logicRules.value
		.filter(rule => { 
			const isShowAction = rule.thenCondition.action === "show";
			return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction;
		})

	history.splice(0, history.length, ...history.filter(id => 
        logicRules.value.some(rule => rule.id === id)
    ));	


	// 2.检查所有非默认规则是否完整	
	const incompleteRules = logicRules.value.filter(rule => !isCompleteRule(rule));
	
	// 如果存在不完整的非默认规则，中断执行保存函数，并发出警告信息
	if (incompleteRules.length > 0) {
		ElMessage({
			type: 'warning',
			message: `有规则不完整，请完善后再保存`,
			duration: 3000
		});
		return;
	}

	// 3.找出不需要被真正删除的非当下逻辑规则类型的逻辑规则的id
	// 根据逻辑类型，从history筛选不需要真正删除的逻辑规则的id数组。
	const removedDeletedId = history
		.filter(id => deletedLogicRulesId.includes(id))
		.filter(id => { 
			const rule = (props.questionSettings.logicRules ?? []).find(rule => rule.id === id)
			const isShowAction = rule.thenCondition.action === "show";
			return logicClass.value === 'skipLogic' ? isShowAction : !isShowAction;	
		})

	// 从所有点击的逻辑规则中，删除那些不需要被真正删除的规则，保证数据统一，history在保存的时候的概念就是
	// 所有真正需要删除的逻辑规则，插入的新的逻辑规则，修改的逻辑规则的id的集合
	// removedDeletedId是不需要真正被删除的逻辑规则的id数组，不符合history的概念	
	history.splice(0, history.length, ...history.filter(id => !removedDeletedId.includes(id)));

	// 被删除的显示的逻辑规则中，根据逻辑类型，不是该类型的逻辑规则是不需要被真正删除的，所以剔除掉
	deletedLogicRulesId.splice(0, deletedLogicRulesId.length,
		...deletedLogicRulesId.filter(id => !removedDeletedId.includes(id)))	

	// 4.验证过后分类,根据逻辑类型确定新插入的逻辑规则Id数组和修改过的逻辑规则Id数组
	const { newLogicRulesId, updatedLogicRulesId } = classifyHistory()

	// 点击保存按钮，
	// 将logicRules：最新的logicRules逻辑规则
	// newLogicRulesId: 新添加的非默认状态下的逻辑规则的id
	// updatedLogicRulesId: questionSettings.logicRules中修改过的逻辑规则的id
	// deletedLogicRulesId: questionSettings.logicRules中被删除的逻辑规则的id
	// 将这些数据传递给父组件
	// 向父组件传递数据
	emits('saveLogicRules', {
		logicRules: logicRules.value,
		newLogicRulesId,
		updatedLogicRulesId,
		deletedLogicRulesId
	})
	emits('closeLogicDialog')
}

const cancelSave = () => {
	logicClass.value = "skipLogic";
	emits('closeLogicDialog')
}
const closeDialog = () => {
	logicClass.value = "skipLogic";
	emits('closeLogicDialog')
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
	--el-select-width: 50%
}
</style>