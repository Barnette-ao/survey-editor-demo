import { ref } from 'vue'

export function useHoverState() {
  const hoveredQuestionType = ref('')

  return {
    hoveredQuestionType
  }
}