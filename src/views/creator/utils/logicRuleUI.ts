// Type definitions
export interface ConditionState {
  label: string;
  value: string;
}

export interface QuestionElement {
  type: string;
  [key: string]: unknown;
}

// 定义题型分组
export const CHOICE_TYPES = ['radiogroup', 'checkbox', 'dropdown', 'imagepicker'] as const;

export type ChoiceType = typeof CHOICE_TYPES[number];

// 获取不同题目类型对应的条件选择状态
export const getConditionStatesByType = (element: QuestionElement | null | undefined): ConditionState[] => {
	if (!element) return [];
	
	// 选择类题型：单选，多选，下拉，选图片
	if (CHOICE_TYPES.includes(element.type as ChoiceType)) {
		
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
	if (element.type === 'rating' 
	    || ["ratinglabel", "ratingstars", "ratingsmileys"].includes(element.type)) {
		// 量表
		return [
			{ label: "等于", value: "equal" },
			{ label: "小于", value: "lessThan" },
			{ label: "大于", value: "greaterThan" },
			{ label: "大于等于", value: "greaterOrEqual" },
			{ label: "小于等于", value: "lesserOrEqual" },
		];
	}
	
	// 其他类型：'多项填空' multipletext, '文件上传' file, '排名' ranking, '矩阵选择' matrix, '单行文本' text, '多行文本' comment
	return [];
};
