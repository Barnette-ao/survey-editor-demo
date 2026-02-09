import { handleLogicRulesUpdate } from "@/views/creator/config/logicRule";


/**
 * 处理逻辑规则的更新 (wrapper function)
 * @param {Object} saveLogicObj - 包含新的逻辑规则信息的对象
 * @param {Object} questionSettings - 问题设置对象
 */
export function handleLogicRulesUpdateWrapper(saveLogicObj, questionSettings) {
	const cloned = handleLogicRulesUpdate(saveLogicObj, questionSettings.value)
	questionSettings.value = cloned
}


