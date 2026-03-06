import markdownit from "markdown-it";
import { snapshot } from '@/views/creator/config/shared'

export function upfileSurvey(_, options) {
  const formData = new FormData();
  options.files.forEach(function (file) {
    formData.append(file.name, file);
  });
}

export function applyHtml(_, options) {
  let str = markdownit({ html: true }).renderInline(options.text);
  if (str.indexOf("<p>") === 0) {
    // Remove root paragraphs <p></p>
    str = str.substring(3);
    str = str.substring(0, str.length - 4);
  }
  // Set HTML markup to render
  options.html = str;
}

export function redistributeElementsToSingleQuestionPages(data) {
  const surveyData = snapshot(data);
  if (surveyData.questionsOnPageMode !== "questionPerPage") {
    return surveyData;
  }
  
  surveyData.pages = surveyData.pages
    .reduce((allElements, page) => {
      if (page.elements?.length) {
        allElements.push(...page.elements);
      }
      return allElements;
    }, [])
    .map((element, index) => ({
      name: `page${index + 1}`,
      elements: [element],
    }
  ));

  if (!surveyData.pages.length) {
    return surveyData;
  }

  surveyData.questionsOnPageMode = "standard";
  return surveyData;
}

export const setChoiceVisibleIf = (elements) => {
  const selectBaseQuestion = ['checkbox', 'dropdown', 'imagepicker', 'radiogroup', 'ranking']
  const isValidChoice = (element) => {
    const { type, choicesShowHide, choices } = element;
    return (
      selectBaseQuestion.includes(type) &&
      choices?.length > 0 &&
      choicesShowHide?.endsWith('$')
    );
  };

  for (const element of elements) {
    if (!isValidChoice(element)) continue;
    const conditions = element.choicesShowHide
      .slice(0, -1)
      .split("#")
      .map((part) => part.trim());
 
    switch (conditions[0]) {  
      case '1':
        if (conditions.length !== 3) continue;
        element.choices = element.choices.map(choice => 
          typeof choice === 'object' ? choice : { value: choice }
        );
        showOrhideChoice(element.choices, conditions);
      case '2':
        if (conditions.length !== 2 || element.type !== "checkbox") continue;
        hcChoice(element.choices, element.name, conditions);  
    }  
  }
};


/**
 * 自定义选择某一个选项后，其他多个选项的显示的逻辑
 * @param {当前选中题目的选项数组} choices 
 * @param {自定义选项显示或隐藏的逻辑设置字符串} conditions
 * conditions例如：
 * 1-1~10@2-12~18@3-20~22@4-24~30@5-31~35@6-37,39@7-42~46@8-50~53@9-55~58$
 * 1-1~10，表示选择选项1时，第1~10选项显示
 * 6-37,39，表示选择选项6时，第37和39选项显示
 */
function showOrhideChoice(choices, conditions) {
	// 构建 visibleIf 条件
	const buildVisibleIf = (selectedItemIndex) => (
		`{${conditions[1]}} = '${choices[parseInt(selectedItemIndex) - 1].value}'`
	);

	const parts = conditions[2].split("@");

	for (const part of parts) {
		const [selectedItemIndex, visibleIndexString] = part.split("-");

		if (visibleIndexString.includes("~")) {
			// 处理范围条件 (例如: 1-2~5)
			const [startIndex, endIndex] = visibleIndexString.split("~").map(Number);
			// 检查范围是否有效
			if (startIndex <= selectedItemIndex || endIndex > choices.length) continue;
			// 直接设置范围内的选项
			for (let i = startIndex - 1; i < endIndex; i++) {
				choices[i].visibleIf = buildVisibleIf(selectedItemIndex);
			}
		} else {
			// 处理列表条件 (例如: 1-2,3,4)
			const indexList = visibleIndexString.split(",").map(Number);
			// 检查列表是否有效
			if (indexList.some(index => index < 1 || index > choices.length)) continue;
			// 直接设置指定索引的选项
			indexList.forEach(index => {
				choices[index - 1].visibleIf = buildVisibleIf(selectedItemIndex);
			});
		}
	}
}

/**
 * @param {当前选中题目的选项数组} choices
 * @param {自定义选项显示或隐藏的逻辑设置字符串} conditions
 * @param {当前选中题目的名字} name
 * conditions例如：1&2,3@2|3,4$
 * 设置多选题互斥选项，即选中了某些选项，就不能选择其他选项
 * 例如：1&2,3 选中2和3时，就不能选择选项1
 * 例如：2|3,4 表示当选项3和选项4任一选项选中，则不能选择选项2
**/
function hcChoice(choices, name, conditions) {
	const parts = conditions[1].split("@");

	for (const part of parts) {
		const [disabledItemIndex, selectedItemIndex] = part.includes('&') ? part.split('&') : part.split('|');
		const where = part.includes('&') ? "allof" : "anyof"

		// 检查 disabledItemIndex 和 selectedItemIndex 是否包含错误的数字，如果是则跳过当前循环
		if (disabledItemIndex < 1 || disabledItemIndex > choices.length) continue;
		if (selectedItemIndex
			.split(",")
			.map(number => number.trim())
			.map(Number)
			.some(number => number < 1 || number > choices.length))
			continue;

		// 获取对应的选项值数组	
		let choicesValue = selectedItemIndex.split(",").map(Number)
			.map((itemIndex) => `'${choices[itemIndex - 1].value}'`);

		choices[disabledItemIndex - 1].enableIf = `!{${name}} ${where} [${choicesValue}]`;
	}
}