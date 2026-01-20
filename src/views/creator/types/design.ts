// src/types/design.ts
import type { QuestionElement, QuestionPage } from './questionnaire'

export interface RenderedPageItem {
  type: 'page'
  id: string
  pageIndex: number
  page: QuestionPage
}

export interface RenderedElementItem {
  type: 'element'
  id: string
  pageIndex: number
  elementIndex: number
  element: QuestionElement
}

export type RenderedItem = RenderedPageItem | RenderedElementItem