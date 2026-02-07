import { formattedNumber } from '@/views/creator/config/helpers'

// 如果没有选中任何元素，新元素插入问卷末尾，反之，则插入选中元素的页面末尾
export const addQuestionElement = (questionSettings, elemntType, selectedQuestionId) => {
    const newElement = createNewElement(elemntType, questionSettings);
    const { elementIndex, pageIndex } =
        getSelectedElementPosition(questionSettings, selectedQuestionId);
    if (elementIndex === undefined) {
        questionSettings.pages[questionSettings.value.pages.length - 1].elements.push(newElement);
    } else {
        questionSettings.pages[pageIndex].elements.splice(elementIndex + 1, 0, newElement);
    }
    // 修改添加新题目之后，题目的序号序列不对的问题
    // 更新题目的序号序列
    formattedNumber(questionSettings)
    // 滚动到新添加的题目
    // 注意，这里的滚动是在页面中滚动，而不是在整个页面中滚动
    // 上述代码执行之后，DOM不会立即更新，所以这是一个异步任务，在下一次事件循环之后再执行
    nextTick(() => {
        const newElementDom = document.getElementById(newElement.id);
        if (newElementDom) {
            newElementDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    return newElement.id
};

export const createNewElement = (type, questionSettings) => {
    const elementTemplate = getElementTemplate(type)
    const number = getMaxNumOfName(questionSettings, elementTemplate)
    return {
        id: uuidv4(),
        name: `Q${number + 1}`,
        ...elementTemplate
    }
}

export const getSelectedElementPosition = (questionSettings, selectedQuestionId) => {
    let elementIndex, pageIndex;
    const page = questionSettings.value.pages.find((page) =>
        page.elements.some((el) => el && el.id === selectedQuestionId)
    );

    if (page) {
        pageIndex = questionSettings.value.pages.indexOf(page);
        elementIndex = page.elements.findIndex(
            (el) => el && el.id === selectedQuestionId
        );
    }

    return { elementIndex, pageIndex };
};

const getElementTemplate = (type) => {
    let elementTemplate
    if(['ratinglabel','ratingsmileys','ratingstars'].includes(type)){
        const rateType = type.replace(/^rating/, '');
        elementTemplate = questionTemplates
            .filter(element => element.type === "rating")
            .find(element => element.rateType === rateType)
    }else{
        elementTemplate = questionTemplates
            .find(element => element.type === type);
    }

    return elementTemplate
}

// 为新元素的name属性赋值
// name会一直递增，是对所有的非html和panel的元素进行计数而已
// 会执行插入，删除，复制等操作，会改变整个题目元素的长度，
// 只需要统计所有的非html和panel的元素的name属性，然后取最大值加1即可
const getMaxNumOfName = (questionSettings, element) => {
    if (element.type === "html" || element.type === "panel") return;
    const numOfNames = (questionSettings.pages ?? [])
        .flatMap(page => page.elements)
        .filter(element => element.type !== "html" && element.type !== "panel")
        .map(element => parseInt(element.name.substring(1)));
    // 用Math.max(...numOfName)当数组有几万个元素时会报错。用reduce适应任何长度的元素
    return numOfNames.reduce((max, cur) => Math.max(max, cur), 0);
}