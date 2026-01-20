import { ref } from 'vue'

export type SettingPanelType = 'quickSetting' | 'questionSetting'

export function useSettingPanelState() {
  const settingType = ref<SettingPanelType>('quickSetting')

  const settingTypeOptions = [
    { label: '快捷设置', value: 'quickSetting' },
    { label: '题目设置', value: 'questionSetting' }
  ] as const

  return {
    settingType,
    settingTypeOptions
  }
}
