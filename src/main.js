import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'

// Element Plus 按需引入 - 保持简单直接
import {
  ElSegmented,
  ElSwitch,
  ElButton,
  ElIcon,
  ElTooltip,
  ElBadge,
  ElInput,
  ElDialog,
  ElMessage,
  ElMessageBox
} from 'element-plus'

// Element Plus 图标按需引入
import {
  Remove,
  CirclePlus,
  Connection,
  CopyDocument,
  Delete,
  Plus,
  StarFilled,
  Sort,
  RefreshRight,
  Rank,
  QuestionFilled
} from '@element-plus/icons-vue'

// Element Plus 样式按需引入
import 'element-plus/es/components/segmented/style/css'
import 'element-plus/es/components/switch/style/css'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/icon/style/css'
import 'element-plus/es/components/tooltip/style/css'
import 'element-plus/es/components/badge/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/dialog/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// Pinia 优化配置
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 注册 Element Plus 组件
app.component('ElSegmented', ElSegmented)
app.component('ElSwitch', ElSwitch)
app.component('ElButton', ElButton)
app.component('ElIcon', ElIcon)
app.component('ElTooltip', ElTooltip)
app.component('ElBadge', ElBadge)
app.component('ElInput', ElInput)
app.component('ElDialog', ElDialog)

// 注册 Element Plus 图标
app.component('Remove', Remove)
app.component('CirclePlus', CirclePlus)
app.component('Connection', Connection)
app.component('CopyDocument', CopyDocument)
app.component('Delete', Delete)
app.component('Plus', Plus)
app.component('StarFilled', StarFilled)
app.component('Sort', Sort)
app.component('RefreshRight', RefreshRight)
app.component('Rank', Rank)
app.component('QuestionFilled', QuestionFilled)

// 全局配置 ElMessage 和 ElMessageBox
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$messageBox = ElMessageBox

app.use(pinia)
app.mount('#app')
