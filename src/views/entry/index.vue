<template>
  <div class="entry-shell">
    <div class="entry-card">
      <button class="create-btn" @click="handleCreate">
        创建新问卷
      </button>

      <div class="list">
        <div
          v-for="item in surveys"
          :key="item.surveyId"
          class="list-item"
          @click="handleOpen(item.surveyId)"
        >
          <div class="title">{{ item.title }}</div>
          <div class="id">{{ item.surveyId }}</div>
        </div>

        <div v-if="!surveys.length" class="empty">
          还没有创建过问卷
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SurveyStorageService} from '@/views/creator/services/SurveyStorageService'
import { useRouter } from 'vue-router'


const router = useRouter()
const appService = new SurveyStorageService()


interface SurveyMeta {
  surveyId: string
  title: string
}

const surveys = ref<SurveyMeta[]>([])

function loadSurveyList() {
  const raw = JSON.parse(localStorage.getItem('questionnaires') || '{}')

  surveys.value = Object.keys(raw).map((id) => ({
    surveyId: id,
    title: raw[id]?.title || '未命名问卷'
  }))
}

function handleCreate() {
  const newId = appService.create()
  console.log("newId",newId)
  router.push(`/editor/${newId}`)
}

function handleOpen(id: string) {
  router.push(`/editor/${id}`)
}

onMounted(() => {
  loadSurveyList()
})
</script>

<style scoped>
.entry-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.entry-card {
  width: 520px;
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.create-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border: none;
  background: #8b5cf6;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.list {
  margin-top: 20px;
  height: 200px;
  overflow-y: auto;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.title {
  color:black;
}

.id {
  color: #aaa;
  font-size: 12px;
}

.empty {
  margin-top: 12px;
  text-align: center;
  color: #666;
}
</style>
