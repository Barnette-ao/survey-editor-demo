import { v4 as uuidv4 } from 'uuid'
import { formattedNumber } from '@/views/creator/config/adapter'
import { nextTick } from 'vue'
import { getSelectedElementPosition } from '@/views/creator/config/element'
import { questionTemplates } from '@/views/creator/config/questionTemplate'


type ExcludePropsMap = {
	radiogroup: string[];
	checkbox: string[];
	dropdown: string[];
	[key: string]: string[];
}

// 如果没有选中任何元素，新元素插入问卷末尾，反之，则插入选中元素的页面末尾
export const addQuestionElement = (
    state: any, 
    elemntType: string, 
    selectedQuestionId: string,
    isCurrentQuestionAPage:boolean = false,
    selectedPageIndex:number = -1,
) => {
    const cloned = structuredClone(state)
    const newElement = createNewElement(elemntType, cloned);
    addNewElement(
        cloned, 
        selectedQuestionId,
        newElement,
        isCurrentQuestionAPage,
        selectedPageIndex
    )
    formattedNumber(cloned)
    // 滚动到新添加的题目
    // 注意，这里的滚动是在页面中滚动，而不是在整个页面中滚动
    // 上述代码执行之后，DOM不会立即更新，所以加nextTick，在下一次事件循环之后再执行
    nextTick(() => {
        scrollToNewElement(newElement)
    });
    return { id: newElement.id, cloned } 
};

export const getSwitchTargetElement = (targetType: string, questionSettings: any, sourceElement: any) => {
	if (!sourceElement) return;
	const cloned = structuredClone(questionSettings) 
    let targetElement: any = createNewElement(targetType, cloned);
	const { type: sourceType } = sourceElement;
    // 同步切换元素和被切换的元素之间相同属性的值 
	const omitKeys = setOmitKeys(sourceType,targetType)
	const restSourceElement = getRestSource(sourceElement, sourceType, omitKeys)
    targetElement = { ...targetElement, ...restSourceElement };

	setChoices(targetElement,targetType,sourceType)

	return targetElement;
}


export const insertElement = (rawState:any, newElement:any, pageIndex:string, 
    elementIndex:string
) => {
    if( newElement === undefined || 
        pageIndex === undefined || 
        elementIndex === undefined
    ) return
    const cloned = structuredClone(rawState) 
    cloned.pages[pageIndex].elements.splice(elementIndex, 0, newElement)
    return cloned
}

const createNewElement = (type: string, questionSettings: any) => {
    const elementTemplate = getElementTemplate(type)
    const number = getMaxNumOfName(questionSettings, elementTemplate)
    return {
        id: uuidv4(),
        name: `Q${number + 1}`,
        ...elementTemplate
    }
}

const getElementTemplate = (type: string) => {
    console.log("type", type)
    let elementTemplate
    if(['ratinglabel','ratingsmileys','ratingstars'].includes(type)){
        const rateType = type.replace(/^rating/, '');
        elementTemplate = questionTemplates
            .filter((element: any) => element.type === "rating")
            .find((element: any) => element.rateType === rateType)
    }else{
        elementTemplate = questionTemplates
            .find((element: any) => element.type === type);
    }

    return elementTemplate
}

// 为新元素的name属性赋值
// name会一直递增，是对所有的非html和panel的元素进行计数而已
// 会执行插入，删除，复制等操作，会改变整个题目元素的长度，
// 只需要统计所有的非html和panel的元素的name属性，然后取最大值加1即可
const getMaxNumOfName = (questionSettings: any, element: any) => {
    if (element.type === "html" || element.type === "panel") return;
    const numOfNames = (questionSettings.pages ?? [])
        .flatMap((page: any) => page.elements)
        .filter((element: any) => element.type !== "html" && element.type !== "panel")
        .map((element: any) => parseInt(element.name.substring(1)));
    console.log("numOfNames",numOfNames)
    // 用Math.max(...numOfName)当数组有几万个元素时会报错。用reduce适应任何长度的元素
    return numOfNames.reduce((max: number, cur: number) => Math.max(max, cur), 0);
}

const addNewElement = (
    cloned:any, 
    selectedQuestionId:string, 
    newElement:any,
    isCurrentQuestionAPage:boolean,
    selectedPageIndex:number
) => {
    // 选中了页码块
    if(isCurrentQuestionAPage && selectedPageIndex >= 0){
        cloned.pages[selectedPageIndex].elements.push(newElement)
    }else {
        const { elementIndex, pageIndex } =
            getSelectedElementPosition(cloned, selectedQuestionId);

        if (elementIndex === undefined) {
            cloned.pages[cloned.pages.length - 1].elements.push(newElement);
        } else {
            cloned.pages[pageIndex].elements.splice(elementIndex + 1, 0, newElement);
        }
    }
}

const getRestSource = (sourceElement:any, sourceType:string, omitKeys:any) => {
    return Object.keys(sourceElement)
		.filter((key: string) => !omitKeys[sourceType].includes(key))
		.reduce((obj: any, key: string) => {
			obj[key] = sourceElement[key];
			return obj;
		}, {});
}

const setOmitKeys = (sourceType:string, targetType:string) => {
    const omitKeys: ExcludePropsMap = {
		radiogroup: ['id', 'type'],
		checkbox: ['id', 'type', 'showSelectAllItem', 'selectAllText'],
		dropdown: ['id', 'type']
	};
    // 若切换到dropdown题型，则需要删除原题型
    // （radiogroup,checkbox）中的'itemComponent'属性
	if (targetType === "dropdown") {
		omitKeys[sourceType].push('itemComponent');
	}
    return omitKeys
}

const setChoices = (targetElement:any,targetType:string,sourceType:string) => {
    if (targetType === 'dropdown' &&
		['radiogroup', 'checkbox'].includes(sourceType)
    ) {
		targetElement.choices = targetElement.choices
			.map((choice: any) => choice.value);
	}else if (
		['radiogroup', 'checkbox'].includes(targetType) &&
		sourceType === 'dropdown'
    ) {
		targetElement.choices = targetElement.choices.map((choice: any) => ({
			value: choice,
			showText: false,
			textType: 'text',
			required: true
		}));
	}
}

const scrollToNewElement = (targetElement:any) => {
    const newElementDom = document.getElementById(targetElement.id);
        if (newElementDom) {
            newElementDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
}

