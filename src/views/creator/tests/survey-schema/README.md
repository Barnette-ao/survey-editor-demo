# SurveyJS 问题模板运行时校验

## 概述

这个测试套件用于验证自定义 questionTemplates 是否为 SurveyJS 接受的合法 JSON 结构。通过使用 SurveyJS 的运行时 API (`new Model(json)`) 作为唯一的验证标准，确保我们的问题模板能够被 SurveyJS 正确解析和渲染。

## 核心原则

- **不手写 SurveyJS 规则**: 完全依赖 SurveyJS 运行时的验证结果
- **不假设字段是否合法**: 以 SurveyJS 的实际行为为准
- **运行时结果为唯一标准**: 通过 `new Model(json)` 的成功/失败来判断合法性

## 文件结构

```
tests/survey-schema/
├── validate-base-survey.ts      # 基础验证函数
├── validate-question-templates.ts # 问题模板批量验证
└── README.md                    # 本文档
```

## 核心函数

### validate-base-survey.ts

#### `createBaseSurveyShell()`
创建最小合法的 SurveyJS JSON 结构：
```typescript
{
  title: "测试问卷",
  pages: [
    {
      name: "page1", 
      elements: []
    }
  ]
}
```

#### `buildSurveyWithSingleQuestion(question)`
将单个问题注入到 survey.pages[0].elements 中，自动生成唯一的 `name` 属性。

#### `validateSurveyByRuntime(json)`
使用 SurveyJS 运行时验证 JSON 结构：
- 创建 `new Model(json)`
- 收集 `survey.jsonErrors`
- 收集 `survey.getAllErrors()`
- 返回 `{ ok: boolean, errors: any[], survey: Model }`

### validate-question-templates.ts

#### `validateAllQuestionTemplates()`
验证所有在 `componentAndSettingMap.js` 中定义的问题模板。

#### `validateQuestionTemplateByType(questionType)`
验证特定类型的问题模板。

#### `runValidationTests()`
运行完整的验证测试并生成报告。

## 使用方法

### 在开发环境中运行测试

```typescript
import { runValidationTests } from '@/views/creator/tests/survey-schema/validate-question-templates'

// 运行所有测试
const testResult = runValidationTests()
console.log(testResult.report)
```

### 验证单个问题类型

```typescript
import { validateQuestionTemplateByType } from '@/views/creator/tests/survey-schema/validate-question-templates'

// 验证单选题
const result = validateQuestionTemplateByType('radiogroup')
if (!result.ok) {
  console.log('验证失败:', result.errors)
}
```

### 在 UI 中集成

```typescript
import { validateAllQuestionTemplates } from '@/views/creator/tests/survey-schema/validate-question-templates'

// 获取验证结果用于错误面板显示
const results = validateAllQuestionTemplates()
const failedQuestions = results.filter(r => !r.ok)
```

## 发现的规则和问题

### ✅ 验证通过的问题类型

以下问题类型已通过 SurveyJS 运行时验证：

1. **html** - HTML 说明文字
2. **radiogroup** - 单选题
3. **checkbox** - 多选题  
4. **dropdown** - 下拉选择
5. **text** - 单行文本
6. **comment** - 多行文本
7. **file** - 文件上传
8. **signaturepad** - 签名题

### ❌ 需要修复的问题类型

以下问题类型存在验证问题：

#### 1. Rating 类型问题 (ratinglabel, ratingstars, ratingsmileys)
**问题**: SurveyJS 不直接支持这些类型，应该使用 `rating` 类型配合不同的 `rateType`
**修复建议**:
```typescript
// 错误的写法
{ type: 'ratinglabel', rateType: 'label' }

// 正确的写法  
{ type: 'rating', rateType: 'labels' }
```

#### 2. imagepicker 问题
**问题**: choices 数组为空或格式不正确
**修复建议**: 需要提供有效的图片选择项

#### 3. multipletext 问题
**问题**: items 数组中的对象缺少必要属性
**修复建议**: 确保每个 item 包含正确的属性结构

### 🔧 常见修复模式

1. **缺少 name 属性**: 所有问题元素都需要唯一的 `name` 属性
2. **类型名称不匹配**: 确保 `type` 字段与 SurveyJS 官方文档一致
3. **必需属性缺失**: 某些问题类型需要特定的必需属性
4. **数组格式错误**: choices、items 等数组属性需要正确的对象结构

## 集成到错误面板

这个验证系统可以轻松集成到现有的 `SurveySchemaErrorPanel.vue` 中：

```vue
<template>
  <div class="schema-errors">
    <div v-for="result in failedValidations" :key="result.questionType">
      <h4>{{ result.questionType }} 验证失败</h4>
      <ul>
        <li v-for="error in result.errors" :key="error.message">
          [{{ error.type }}] {{ error.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { validateAllQuestionTemplates } from '@/views/creator/tests/survey-schema/validate-question-templates'

const results = validateAllQuestionTemplates()
const failedValidations = results.filter(r => !r.ok)
</script>
```

## 持续改进

随着 SurveyJS 版本更新和新问题类型的添加，这个测试套件将持续发现和记录：

1. 新的验证规则
2. 字段要求变化  
3. 类型定义更新
4. 最佳实践模式

所有发现的规则都会记录在这个 README 中，为团队提供参考。