<template>
  <div class="questionnaire-list">
    <h2>问卷列表</h2>
    
    <div class="actions">
      <button @click="loadQuestionnaires">刷新</button>
      <button @click="createNew">创建新问卷</button>
    </div>

    <div v-if="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-for="item in questionnaires" :key="item.id" class="questionnaire-item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <div class="meta">
          <span class="status" :class="item.status">{{ item.status === 'published' ? '已发布' : '草稿' }}</span>
          <span>创建时间: {{ item.createdAt }}</span>
          <span>更新时间: {{ item.updatedAt }}</span>
        </div>
        <div class="actions">
          <button @click="viewDetail(item.id)">查看</button>
          <button v-if="item.status === 'draft'" @click="publish(item.id)">发布</button>
          <button @click="deleteItem(item.id)" class="danger">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getQuestionnaires, createQuestionnaire, deleteQuestionnaire, publishQuestionnaire } from '../api/questionnaire'

const questionnaires = ref([])
const loading = ref(false)
const error = ref(null)

async function loadQuestionnaires() {
  loading.value = true
  error.value = null
  try {
    const res = await getQuestionnaires()
    questionnaires.value = res.data.list
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function createNew() {
  try {
    await createQuestionnaire({
      title: '新问卷',
      description: '请编辑问卷描述'
    })
    await loadQuestionnaires()
  } catch (e) {
    alert('创建失败: ' + e.message)
  }
}

async function publish(id) {
  try {
    await publishQuestionnaire(id)
    await loadQuestionnaires()
  } catch (e) {
    alert('发布失败: ' + e.message)
  }
}

async function deleteItem(id) {
  if (confirm('确定要删除这个问卷吗？')) {
    try {
      await deleteQuestionnaire(id)
      await loadQuestionnaires()
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }
}

function viewDetail(id) {
  window.location.href = `/creator/${id}`
}

onMounted(() => {
  loadQuestionnaires()
})
</script>

<style scoped>
.questionnaire-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #f5f5f5;
}

button.danger {
  color: #ff4444;
  border-color: #ff4444;
}

.questionnaire-item {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
}

.questionnaire-item h3 {
  margin: 0 0 10px 0;
}

.meta {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.published {
  background: #4caf50;
  color: white;
}

.status.draft {
  background: #ff9800;
  color: white;
}

.error {
  color: #ff4444;
  padding: 10px;
  background: #ffeeee;
  border-radius: 4px;
}
</style>
