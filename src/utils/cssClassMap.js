/**
 * CSS 类名映射工具
 * 用于建立类名和样式文件之间的关联
 */

// 组件样式映射表
export const componentStyleMap = {
  // LogicSettingDialog 组件的类名映射
  'LogicSettingDialog': {
    file: 'src/views/creator/components/LogicSettingDialog.vue',
    classes: {
      'logic-header': {
        line: 750,
        description: '逻辑设置头部容器'
      },
      'logic-title': {
        line: 757,
        description: '逻辑标题样式'
      },
      'logic-content': {
        line: 762,
        description: '逻辑内容容器'
      },
      'logic-rule': {
        line: 764,
        description: '单个逻辑规则容器'
      },
      'delete-rule': {
        line: 773,
        description: '删除规则按钮定位'
      },
      'condition-row': {
        line: 779,
        description: '条件行布局'
      },
      'condition-label': {
        line: 785,
        description: '条件标签样式'
      },
      'if-conditions': {
        line: 798,
        description: '如果条件容器'
      },
      'btn': {
        line: 807,
        description: '按钮重置样式'
      }
    }
  },
  
  // BaseQuestion 组件的类名映射
  'BaseQuestion': {
    file: 'src/components/Question/BaseQuestion.vue',
    classes: {
      'question-container': {
        line: 150,
        description: '问题容器主样式'
      },
      'question-header': {
        line: 165,
        description: '问题头部布局'
      },
      'operation-buttons': {
        line: 200,
        description: '操作按钮组'
      }
    }
  }
}

// 全局样式映射表
export const globalStyleMap = {
  'dragStyle.scss': {
    file: 'src/assets/styles/dragStyle.scss',
    classes: {
      'sortable-ghost': {
        description: '拖拽时的幽灵元素样式'
      },
      'sortable-drag': {
        description: '拖拽中的元素样式'
      }
    }
  }
}

/**
 * 根据类名查找对应的样式定义
 * @param {string} className - CSS 类名
 * @returns {Object|null} 样式信息对象
 */
export function findStyleByClassName(className) {
  // 搜索组件样式
  for (const [componentName, componentData] of Object.entries(componentStyleMap)) {
    if (componentData.classes[className]) {
      return {
        type: 'component',
        component: componentName,
        file: componentData.file,
        ...componentData.classes[className]
      }
    }
  }
  
  // 搜索全局样式
  for (const [fileName, fileData] of Object.entries(globalStyleMap)) {
    if (fileData.classes[className]) {
      return {
        type: 'global',
        file: fileData.file,
        ...fileData.classes[className]
      }
    }
  }
  
  return null
}

/**
 * 获取组件的所有类名
 * @param {string} componentName - 组件名称
 * @returns {Array} 类名数组
 */
export function getComponentClasses(componentName) {
  const componentData = componentStyleMap[componentName]
  return componentData ? Object.keys(componentData.classes) : []
}

/**
 * 生成类名跳转链接（用于开发工具）
 * @param {string} className - CSS 类名
 * @returns {string} VS Code 链接
 */
export function generateVSCodeLink(className) {
  const styleInfo = findStyleByClassName(className)
  if (!styleInfo) return null
  
  const { file, line = 1 } = styleInfo
  return `vscode://file/${process.cwd()}/${file}:${line}`
}