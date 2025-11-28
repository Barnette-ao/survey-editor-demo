# 问卷系统 Mock API 文档

## 接口列表

### 1. 获取问卷列表
```
GET /api/questionnaires
```
**参数:**
- status: 'published' | 'draft' (可选)
- page: 页码 (默认 1)
- pageSize: 每页数量 (默认 10)

**响应:**
```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 获取问卷详情
```
GET /api/questionnaires/:id
```

### 3. 创建问卷
```
POST /api/questionnaires
```
**请求体:**
```json
{
  "title": "问卷标题",
  "description": "问卷描述",
  "pages": [
    {
      "name": "page1",
      "elements": []
    }
  ]
}
```

**问卷数据结构说明:**
- 使用 SurveyJS 格式
- `pages`: 问卷页面数组
- `elements`: 题目数组，每个题目包含 `type`, `name`, `title`, `isRequired` 等属性
- 题目类型: `html`, `radiogroup`, `checkbox`, `dropdown`, `text`, `comment`, `rating*`, `ranking`, `matrix`, `multipletext`, `file`, `imagepicker`, `signaturepad`, `panel`

### 4. 更新问卷
```
PUT /api/questionnaires/:id
```

### 5. 删除问卷
```
DELETE /api/questionnaires/:id
```

### 6. 发布问卷
```
POST /api/questionnaires/:id/publish
```

### 7. 提交答卷
```
POST /api/questionnaires/:id/submit
```
**请求体:**
```json
{
  "answers": {
    "q1": "答案1",
    "q2": ["答案2", "答案3"]
  }
}
```

### 8. 获取问卷统计
```
GET /api/questionnaires/:id/statistics
```

## 使用方法

1. 启动开发服务器: `npm run dev`
2. Mock 接口会自动启用
3. 在代码中使用 `src/api/questionnaire.js` 中的方法调用接口

## 示例

```javascript
import { getQuestionnaires, createQuestionnaire } from '@/api/questionnaire'

// 获取问卷列表
const res = await getQuestionnaires({ status: 'published' })

// 创建问卷
await createQuestionnaire({
  title: '新问卷',
  description: '问卷描述'
})
```
