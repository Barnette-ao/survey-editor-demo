export const getSelectedElementPosition = (questionSettings: any, selectedQuestionId: string) => {
    let elementIndex, pageIndex;
    const page = questionSettings.pages.find((page: any) =>
        page.elements.some((el: any) => el && el.id === selectedQuestionId)
    );

    if (page) {
        pageIndex = questionSettings.pages.indexOf(page);
        elementIndex = page.elements.findIndex(
            (el: any) => el && el.id === selectedQuestionId
        );
    }

    return { elementIndex, pageIndex };
};

export const getElement = (elementId:string, questionSettings:any) => {
    const { elementIndex, pageIndex } = getSelectedElementPosition(questionSettings, elementId);
        
    if (elementIndex !== undefined && pageIndex !== undefined) {
        return questionSettings.pages[pageIndex].elements[elementIndex];
    }
}