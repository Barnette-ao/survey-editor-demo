import { findPageIndexById } from "@/views/creator/config/page"

export const findElementPosition = (questionSettings: any, selectedQuestionId: string) => {
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

export const findElementById = (elementId:string, questionSettings:any) => {
    const { elementIndex, pageIndex } = findElementPosition(questionSettings, elementId);
    if (elementIndex !== undefined && pageIndex !== undefined) {
        return questionSettings.pages[pageIndex].elements[elementIndex];
    }
}

export const findTargetPosition = (state:any, targetId:string) => {
  const pageIndex = findPageIndexById(state, targetId)
  if (pageIndex !== -1) {
    return {
      elementIndex: 0, // element → page 语义  
      pageIndex: pageIndex,
    }
  }

  return findElementPosition(state, targetId)
}

export const resolveTargetPageIndex = (state: any, targetId: string): number => {
  // target 是 page
  const pageIndex =
    state.pages.findIndex((p: any) => p.id === targetId)

  if (pageIndex !== -1) {
    return pageIndex
  }

  // target 是 element
  for (let i = 0; i < state.pages.length; i++) {
    const elements = state.pages[i].elements
    if (elements.some((el: any) => el.id === targetId)) {
      return i
    }
  }

  return -1
}