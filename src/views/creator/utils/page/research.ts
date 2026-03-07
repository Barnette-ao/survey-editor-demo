export const findPageIndexById = (state: any, pageId: string): number => {
  return state.pages.findIndex((p: any) => p.id === pageId)
}