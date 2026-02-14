<template>
  <div class="creatorBox">
    <div class="navBox">
      <div class="menu">
        <div 
          :class="['menuItem', { checkedMenuItem: menuItems[index].routeName === $route.name }]" 
          @click="checkMenu(index)"
          v-for="(item, index) in menuItems" 
          :key="index"
        >
          {{ item.label }}
        </div>
      </div>
      <div class="exitBox">
        <el-button @click="handleUndo">撤销</el-button>
        <el-button @click="handleRedo">恢复</el-button>
        <el-button type="primary" @click="handleExit">退出编辑</el-button>
      </div>
    </div>
    <div class="tabContentBox">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Serializer } from "survey-core";
import { useDraftActions } from '@/views/creator/composables/useDraftAction'

import { useRouter, useRoute } from 'vue-router'

const menuItems = reactive([
  { label: "项目设计", routeName: "editor-design" },
  { label: "预览", routeName: "editor-preview" },
  { label: "JSON编辑器", routeName: "editor-json" }
]);

const router = useRouter()
const route = useRoute()
const checkMenu = (index:number) => {
  router.push({ 
    name: menuItems[index].routeName, 
    params: { surveyId: route.params.surveyId } 
  });
};

const { 
  applyUndo, 
  applyRedo, 
  applyCommit 
} = useDraftActions()

const handleExit = () => {
  applyCommit()
  router.push('/')
}

const handleUndo = () => {
  applyUndo()
}

const handleRedo = () => {
  applyRedo()
}

// // 给所有选择类型题目添加选项逻辑设置 属性
// Serializer.addProperty("selectbase", {
//   name: "choicesShowHide:text", // 属性名及类型
//   title: "choicesShowHide", // 属性的标题
//   category: "logic",
//   displayName: "选项逻辑设置", // 属性在 UI 中的显示名称
//   visible: true, // 是否在属性面板中显示
//   type: "text", // 属性类型，设置为 text 类型
//   isRequired: false, // 该属性非必填
//   default: "",
//   inputType: "textarea",
// });

</script>

<style scoped lang="scss">
  .creatorBox {
    /* styldiv.es go here */
    background: rgb(243, 243, 243);
    display: flex;
    overflow: auto;

    .navBox {
      height: 64px;
      width: 100%;
      background: white;
      border-bottom: 1px groove;
      position: fixed;
      z-index: 999;

      display: flex;
      align-items: center;

      

      .menu {
        width: 70%;
        height: 100%;
        background-color:"skyblue";

        display: flex;

        .menuItem {
          width: 112px;
          height: 64px;

          text-align: center;
          line-height: 64px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
        }

        .checkedMenuItem {
          border-bottom: 2px solid #409EFF;
        }
      }

      .exitBox {
        width: 30%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px; // 可选：添加一些左右间距
      }
    }

    .tabContentBox {
      width: 100%;
    }

  }
</style>