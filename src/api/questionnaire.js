// 问卷 API 封装

const BASE_URL = '/api'

// 通用请求方法
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    const data = await response.json()
    if (data.code === 200) {
      return data
    }
    throw new Error(data.message || '请求失败')
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 获取问卷列表
export function getQuestionnaires(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`${BASE_URL}/questionnaires?${query}`)
}

// 获取问卷详情
export function getQuestionnaireById(id) {
  return request(`${BASE_URL}/questionnaires/${id}`)
}

// 创建问卷
export function createQuestionnaire(data) {
  return request(`${BASE_URL}/questionnaires`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// 更新问卷
export function updateQuestionnaire(id, data) {
  return request(`${BASE_URL}/questionnaires/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// 删除问卷
export function deleteQuestionnaire(id) {
  return request(`${BASE_URL}/questionnaires/${id}`, {
    method: 'DELETE'
  })
}

// 发布问卷
export function publishQuestionnaire(id) {
  return request(`${BASE_URL}/questionnaires/${id}/publish`, {
    method: 'POST'
  })
}

// 提交答卷
export function submitAnswer(id, answers) {
  return request(`${BASE_URL}/questionnaires/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  })
}

// 获取问卷统计
export function getQuestionnaireStatistics(id) {
  return request(`${BASE_URL}/questionnaires/${id}/statistics`)
}
