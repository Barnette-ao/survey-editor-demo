<template>
  <div class="creatorBox">
    <div class="navBox">
      <div class="menu">
        <div :class="checkedMenuIndex == index ? 'menuItem checkedMenuItem' : 'menuItem'" @click="checkMenu(index)"
          v-for="(item, index) in memu" :key="index">
          {{ item }}
        </div>
      </div>
    </div>
    <div class="tabContentBox">
      <div class="designer" v-if="checkedMenuIndex === 0">
        <design></design>
      </div>
      <div class="previewBox" v-if="checkedMenuIndex === 1">
        <preview></preview>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import design from "@/views/creator/components/design.vue"
import preview from "@/views/creator/components/preview.vue"
import { Serializer } from "survey-core";

const memu = reactive(["项目设计", "预览"]);
const checkedMenuIndex = ref(0);
const checkMenu = (index) => {
  checkedMenuIndex.value = index;
};

//// 给所有选择类型题目添加选项逻辑设置 属性
Serializer.addProperty("selectbase", {
  name: "choicesShowHide:text", // 属性名及类型
  title: "choicesShowHide", // 属性的标题
  category: "logic",
  displayName: "选项逻辑设置", // 属性在 UI 中的显示名称
  visible: true, // 是否在属性面板中显示
  type: "text", // 属性类型，设置为 text 类型
  isRequired: false, // 该属性非必填
  default: "",
  inputType: "textarea",
});

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

      .menu {
        width: 80%;
        height: 100%;

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

      .toolBar {
        width: 20%;
        height: 100%;

        display: flex;

        .toolBarBtn {
          cursor: pointer;
          width: 30%;
          height: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          .btnIcon:hover {
            background-color: rgb(243, 243, 243);
          }
        }
      }
    }

    .tabContentBox {
      width: 100%;
    }

  }
</style>