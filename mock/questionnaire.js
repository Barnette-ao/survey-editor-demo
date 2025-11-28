// 模拟问卷数据
let questionnaires = [
  {
    id: '1',
    title: '用户满意度调查',
    description: '帮助我们了解您的使用体验',
    status: 'published',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-25',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'html',
            name: 'intro',
            html: '欢迎参与本次调查'
          },
          {
            type: 'radiogroup',
            name: 'satisfaction',
            title: '您对我们的产品满意吗？',
            description: '',
            isRequired: true,
            choices: [
              { value: '非常满意', showText: false, textType: 'text', required: true },
              { value: '满意', showText: false, textType: 'text', required: true },
              { value: '一般', showText: false, textType: 'text', required: true },
              { value: '不满意', showText: false, textType: 'text', required: true }
            ],
            itemComponent: 'survey-checkbox-newitem'
          },
          {
            type: 'checkbox',
            name: 'features',
            title: '您最喜欢的功能是？（多选）',
            description: '',
            isRequired: false,
            showSelectAllItem: true,
            selectAllText: '全选',
            choices: [
              { value: '界面设计', showText: false, textType: 'text', required: true },
              { value: '功能丰富', showText: false, textType: 'text', required: true },
              { value: '操作简单', showText: false, textType: 'text', required: true },
              { value: '性能优秀', showText: false, textType: 'text', required: true }
            ],
            itemComponent: 'survey-checkbox-newitem'
          },
          {
            type: 'ratingstars',
            name: 'rating',
            title: '请您对我们的服务进行评价',
            description: '',
            isRequired: true,
            rateType: 'stars',
            displayMode: 'buttons'
          },
          {
            type: 'comment',
            name: 'suggestions',
            title: '您还有什么建议？',
            description: '',
            placeholder: '请输入',
            isRequired: false
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: '员工反馈问卷',
    description: '收集员工对公司的意见和建议',
    status: 'draft',
    createdAt: '2024-11-22',
    updatedAt: '2024-11-22',
    pages: [
      {
        name: 'page1',
        elements: []
      }
    ]
  },
  {
    id: '3',
    title: '产品体验问卷',
    description: '完整的题型示例',
    status: 'published',
    createdAt: '2024-11-25',
    updatedAt: '2024-11-25',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'dropdown',
            name: 'city',
            title: '请选择您所在的城市',
            description: '',
            isRequired: true,
            choices: ['北京', '上海', '广州', '深圳']
          },
          {
            type: 'ratinglabel',
            name: 'quality',
            title: '请您对此项目进行评价',
            description: '',
            isRequired: true,
            rateType: 'label',
            displayMode: 'buttons'
          },
          {
            type: 'ranking',
            name: 'priority',
            title: '请给以下选项排序',
            description: '',
            isRequired: true,
            choices: ['价格', '质量', '服务', '品牌']
          },
          {
            type: 'text',
            name: 'name',
            title: '请填写您的姓名',
            description: '',
            isRequired: true
          },
          {
            type: 'multipletext',
            name: 'contact',
            title: '请填写以下联系方式',
            description: '',
            isRequired: true,
            items: [
              { name: '手机号' },
              { name: '邮箱' }
            ]
          },
          {
            type: 'matrix',
            name: 'evaluation',
            title: '请对以下方面进行评价',
            description: '',
            isRequired: true,
            columns: ['很好', '一般', '较差'],
            rows: ['产品质量', '服务态度', '物流速度']
          }
        ]
      }
    ]
  }
]

// 模拟答卷数据
let answers = []

export default [
  // 获取问卷列表
  {
    url: '/api/questionnaires',
    method: 'get',
    response: ({ query }) => {
      const { status, page = 1, pageSize = 10 } = query
      let list = questionnaires
      
      if (status) {
        list = list.filter(q => q.status === status)
      }
      
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      
      return {
        code: 200,
        data: {
          list: list.slice(start, end),
          total: list.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // 获取单个问卷详情
  {
    url: '/api/questionnaires/:id',
    method: 'get',
    response: ({ query }) => {
      const questionnaire = questionnaires.find(q => q.id === query.id)
      if (questionnaire) {
        return {
          code: 200,
          data: questionnaire
        }
      }
      return {
        code: 404,
        message: '问卷不存在'
      }
    }
  },

  // 创建问卷
  {
    url: '/api/questionnaires',
    method: 'post',
    response: ({ body }) => {
      const newQuestionnaire = {
        id: String(Date.now()),
        ...body,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        pages: body.pages || [{ name: 'page1', elements: [] }]
      }
      questionnaires.unshift(newQuestionnaire)
      return {
        code: 200,
        data: newQuestionnaire,
        message: '创建成功'
      }
    }
  },

  // 更新问卷
  {
    url: '/api/questionnaires/:id',
    method: 'put',
    response: ({ query, body }) => {
      const index = questionnaires.findIndex(q => q.id === query.id)
      if (index !== -1) {
        questionnaires[index] = {
          ...questionnaires[index],
          ...body,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        return {
          code: 200,
          data: questionnaires[index],
          message: '更新成功'
        }
      }
      return {
        code: 404,
        message: '问卷不存在'
      }
    }
  },

  // 删除问卷
  {
    url: '/api/questionnaires/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = questionnaires.findIndex(q => q.id === query.id)
      if (index !== -1) {
        questionnaires.splice(index, 1)
        return {
          code: 200,
          message: '删除成功'
        }
      }
      return {
        code: 404,
        message: '问卷不存在'
      }
    }
  },

  // 发布问卷
  {
    url: '/api/questionnaires/:id/publish',
    method: 'post',
    response: ({ query }) => {
      const questionnaire = questionnaires.find(q => q.id === query.id)
      if (questionnaire) {
        questionnaire.status = 'published'
        questionnaire.updatedAt = new Date().toISOString().split('T')[0]
        return {
          code: 200,
          data: questionnaire,
          message: '发布成功'
        }
      }
      return {
        code: 404,
        message: '问卷不存在'
      }
    }
  },

  // 提交答卷
  {
    url: '/api/questionnaires/:id/submit',
    method: 'post',
    response: ({ query, body }) => {
      const answer = {
        id: String(Date.now()),
        questionnaireId: query.id,
        answers: body.answers,
        submittedAt: new Date().toISOString()
      }
      answers.push(answer)
      return {
        code: 200,
        data: answer,
        message: '提交成功'
      }
    }
  },

  // 获取问卷统计
  {
    url: '/api/questionnaires/:id/statistics',
    method: 'get',
    response: ({ query }) => {
      const questionnaireAnswers = answers.filter(a => a.questionnaireId === query.id)
      return {
        code: 200,
        data: {
          totalAnswers: questionnaireAnswers.length,
          answers: questionnaireAnswers
        }
      }
    }
  }
]
