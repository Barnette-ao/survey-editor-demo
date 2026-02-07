<template>
  <!-- 1 -->
  <div class="design">
    <!-- 2 -->
    <div class="typeAndStyleBox">
      <!-- 3 -->
      <div class="mainPart">
        <!-- 4 -->
        <div class="questionTypeList">
          <div class="list" v-for="(categoryItem,index) in questionTypeList" :key="index">
            <div class="groupTitle">
              {{ categoryItem.categoryName }}
            </div>
            <div class="btnCategory">
                <div class="btnItem"
                  v-for="(item,index) in categoryItem.list"
                  :key="index"
                  @mouseover="hoveredQuestionType = item.type" 
                  @mouseleave="hoveredQuestionType = ''"
                  @click="handleQuestionTypeClick(item.type)"
                >
                  <div class="btn">
                    <div class="btnIcon">
                      <img :src="hoveredQuestionType === item.type
                        ? item.hoveredPath : item.defaultPath" width="20px" height="20px" />
                    </div>
                    <div class="btnText">{{ item.text }}</div>
                  </div>
                </div>
            </div>
          </div>
        </div>
        <div class="middlePart">
          <!-- 5 -->
          <div class="creatorContent">
            <div class="surveyNameBox">
              <div class="surveyName">
                <customEditor
                  v-model="questionSettings.title"
                  :targetObject="questionSettings"
                  targetKey="title"
                  width="400px"
                  editorId="surveyName"
                />
              </div>
              <div class="description">
                <customEditor
                  v-model="questionSettings.description"
                  :targetObject="questionSettings"
                  targetKey="description"
                  width="400px"
                  editorId="description"
                />
              </div>
            </div>
            <!-- 6 -->
            <div class="questionListContainer">
              <!-- 7 -->
              <div class="firstElement">
                <instruction
                  :element="instructionElement"
                  :isShowHeadAction="false"
                  :isEditable="true"
                />
              </div>
              <!-- 7 -->
              <template v-for="item in incrementalLoadingInstance?.renderedItems" :key="item.id">
                <!-- 页面组件 -->
                <div 
                  v-if="item.type === 'page'"
                  class="page-container" 
                  :data-page-index="item.pageIndex"
                >
                  <page
                    v-if="questionSettings.pages.length > 1"
                    :totalPages="questionSettings.pages.length"
                    :currentPage="item.pageIndex + 1"
                    :selected="currentQuestionId === '' && pageIndex === item.pageIndex"
                    :questionList="getQuestionNameOf(item.page)"
                    @delete="handleDeletePage(questionSettings, item.page, item.pageIndex)"
                    @click="handlePageClick(item.pageIndex)"
                  />
                </div>
                <!-- 元素组件 -->
                <component
                  v-else-if="item.type === 'element' && item.element.id !== instructionElementId"
                  :id="item.element.id"
                  :is="componentIs(item.element)"
                  :logicRuleNum="getLogicRuleNum(item.element.id)"
                  :selected="currentQuestionId === item.element.id"
                  :show-number="isShowNumber(item.element)"
                  :element="item.element"
                  @click="handleQuestionClick(item.element.id)"
                  @copy="(id) => copyElement(id, item.element.type)"
                  @delete="deleteElement(item.element.id)"
                  @setLogic="openLogicDialog"
                  @optionSetting="handleOptionSettingUpdate"
                  @update="(key, value) => updateElementField(key, value)"
                />
              </template>
            
              <!-- 哨兵元素 -->
              <div v-if="incrementalLoadingInstance.hasMore" ref="sentinelRef" class="loading-sentinel">
                <!-- 8 -->
                <div v-if="incrementalLoadingInstance.isLoading" class="loading-indicator"> 加载中...</div>
              </div>
              <!-- 加载完成提示 -->
              <div v-else class="load-complete">
                已加载全部内容 (共 {{ incrementalLoadingInstance?.renderedItems?.length }} 项)
              </div>
            </div>
            <div class="completeHtmlBox">
              <div class="title">结束语</div>
              <div class="completeHtml">
                <customEditor
                  v-model="questionSettings.completedHtml"
                  :targetObject="questionSettings"
                  targetKey="completedHtml"
                  width="400px"
                  editorId="completedHtml"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 2 -->
    <div class="propertyGridBox">
      <div class="titleBox"></div>
      <!-- 3 -->
      <div class="propertyGrid">
        <div class="segment-container">
          <el-segmented
            v-model="settingType"
            :options="settingTypeOptions"
            style="margin-bottom: 1rem"
          />
        </div>
        <!-- 4 -->
        <div class="segment-content">
          <div v-if="settingType === 'quickSetting'" class="quick-settings">
            <!-- 答题页 -->
            <div class="setting-section">
              <div class="section-title">问卷设置</div>
              <div class="section-content">
                <div class="setting-item">
                  <span>显示题目序号</span>
                  <el-switch v-model="showQuestionNumbers" />
                </div>
                <div class="setting-item">
                  <span>一页一题</span>
                  <el-switch
                    v-model="oneQuestionPerPage"
                    @change="handleStructrueChange"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- 5 -->
          <div v-else class="question-settings">
            <div class="questionType" v-if="currentQuestionId">
              {{ getCurrentElementTypeText }}
            </div>
            <!-- 6 -->
            <component
              v-if="currentQuestionId"
              :is="settingComponentMap[getCurrentElementType]"
              v-model:required="currentElement.isRequired"
              v-model:showNumber="showNumberComputed"
              :element="currentElement"
              :quesitonTypeText="getCurrentElementTypeText"
              :isOptionSetting="isOptionSetting"
              :selectedOptionIndex="selectedOptionIndex"
              @setting-update="(key, value) => handleSettingUpdate(key, value)"
              @update:questionType="switchQuestionType"
              @setLogic="openLogicDialog"
              v-bind="getSettingProps(currentElement)"
            />
            <div v-else>未选中任何题目</div>
          </div>
        </div>
      </div>
    </div>
    <logic-setting-dialog
      :visible="logicDialogVisible"
      :question-settings="questionSettings"
      :element="settedLogicElement"
      @saveLogicRules="handleLogicUpdate"
      @closeLogicDialog="closeLogicDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue"

import instruction from "@/views/creator/components/instruction.vue";
import { questionTypeList } from "@/views/creator/utils/questionTypeList";
import page from "@/views/creator/components/page.vue";

import {
  settingComponentMap,
} from "@/views/creator/config/componentAndSettingMap";
import {
  getSettingProps,
} from "@/views/creator/config/helpers";
import {
  handleDeletePage,
} from "@/views/creator/config/handleElementAndPage";
import { initSortable } from "@/views/creator/config/dragElementOrPage";
import { destroyAllOptionSortables } from "@/views/creator/config/dragOption.js";
import {
  handleLogicRulesUpdate,
} from "@/views/creator/config/updateLogic";

import { watch, nextTick, provide } from "vue";
import { debounce } from "lodash-es";
import customEditor from "@/views/creator/components/customEditor.vue";
import { useIncrementalLoading } from "@/views/creator/composables/useIncreamentalLoading"
import { useQuestionDisplay } from "@/views/creator/composables/useQuestionNumberDisplay"
import { useCurrentElement } from "@/views/creator/composables/useCurrentElement"
import { useComponentMapping } from '@/views/creator/composables/useComponentMapping'
import { usePageStructure } from '@/views/creator/composables/usePageStructure'
import { useLogicRules } from '@/views/creator/composables/useLogicRules'
import { useElementOperations } from '@/views/creator/composables/useElementOperations'
import { useQuestionCreation } from '@/views/creator/composables/useQuestionCreation'
import { useHoverState } from '@/views/creator/composables/useHoverState'
import { useSettingPanelState } from '@/views/creator/composables/useSettingPanelState'
import { useLogicDialogState } from '@/views/creator/composables/useLogicDialogState'
import { useOptionEditingState } from '@/views/creator/composables/useOptionEditingState'
import { useSelectionState } from '@/views/creator/composables/useSelectionState'
import { useSurveyContext } from "@/views/creator/composables/useSurveyContext";


const LogicSettingDialog = defineAsyncComponent({
  loader: () => import("@/views/creator/components/LogicSettingDialog.vue"),
  loadingComponent: () => h('div', { class: 'loading-dialog' }, '加载中...'),
  errorComponent: () => h('div', { class: 'error-dialog' }, '加载失败'),
  delay: 200,
  timeout: 3000
})

//定义是否拖拽，拖拽则赋空值时不更新数据
const istarg = ref(false);
// 先初始化 questionSettings
const questionSettings = ref({});
const instructionElementId = ref("");
const instructionElement = ref({});

// 提供运行态数据给父组件
// TODO: 演进步骤：runningStorage的定义权转给SurveyEditor组件而不是现在的Design组件
// 这种控制权，我认为使用composable包装questionSettings，将其上升到SurveyEditor组件
// 中，现在很明显questionSettings成为了一个上下文变量，所以我不想选择prop传递的方式
provide('runtimeStorageData', questionSettings)

const { 
  loadRunningState, 
  saveRuntimeSettings,
} = useSurveyContext()

// 创建防抖函数，延迟5秒执行
const saveToDefault = debounce((newValue) => {
  saveRuntimeSettings(newValue);
}, 1000);

// 监听 questionSettings 的变化
watch(
  questionSettings,
  (newValue) => {
    if (!istarg.value) {
      saveToDefault(newValue);
    }
  },
  { deep: true }
);

const sentinelRef = ref(null)  // 直接在组件中创建

// 增量加载相关状态 - 先定义默认值避免暂时性死区
const incrementalLoadingInstance = ref({})

onMounted(async () => {
  // let defaultQuestionSettings = await loadSettingsFromDatabase();
  // 获取问卷 ID（从 URL 或使用默认值）
  questionSettings.value = loadRunningState()
  console.log("questionSettings",questionSettings.value)
  
  instructionElement.value = questionSettings.value.pages[0].elements[0];
  instructionElementId.value = questionSettings.value.pages[0].elements[0].id;
  
  // 数据加载完成后，初始化增量加载
  incrementalLoadingInstance.value = useIncrementalLoading(
    questionSettings, 
    sentinelRef, {
      initialCount: 10,
      batchSize: 5,
      threshold: 200
    }
  );
  // 初始化数据
  incrementalLoadingInstance.value.init();
  
  // 等待 DOM 渲染完成后初始化 Observer
  await nextTick();
  if (sentinelRef.value) {
    incrementalLoadingInstance.value.initObserverManually();
  }
  
  // 初始化拖拽功能
  initSortable(questionSettings, instructionElementId.value, istarg);
});
// questionSettings是reactive，它不能支持动态添加的属性保持器响应式，
// 但ref可以保持其响应式


// 在组件卸载前清理所有实例
onBeforeUnmount(() => {
  destroyAllOptionSortables();
});

const currentQuestionId = ref("");
const { hoveredQuestionType } = useHoverState()
const { settingType, settingTypeOptions } = useSettingPanelState()
const {
  logicDialogVisible,
  settedLogicElement,
  openLogicDialog,
  closeLogicDialog
} = useLogicDialogState()


const {
  isOptionSetting,
  selectedOptionIndex,
  handleOptionSettingUpdate
} = useOptionEditingState({
  onQuestionChange: (id) => {
    currentQuestionId.value = id
  },
  onOpenSettingPanel: () => {
    settingType.value = 'questionSetting'
  }
})

const {
  isCurrentQuestionAPage,
  pageIndex,
  selectPage,
  selectQuestion
} = useSelectionState({
  onSelectPage: () => {
    settingType.value = 'quickSetting'
    currentQuestionId.value = ''
  },
  onSelectQuestion: () => {
    settingType.value = 'questionSetting'
  }
})

// 页面点击
const handlePageClick = (index: number) => {
  selectPage(index)
}

// 题目点击
const handleQuestionClick = (id: string) => {
  currentQuestionId.value = selectQuestion(id)
}

const { componentIs } = useComponentMapping()
const { 
  showQuestionNumbers, 
  isShowNumber, 
  showNumberComputed
} = useQuestionDisplay(questionSettings)

const {
  oneQuestionPerPage,
  getQuestionNameOf
} = usePageStructure(questionSettings)

const { getLogicRuleNum } = useLogicRules(questionSettings)

const { 
  currentElement, 
  getCurrentElementType, 
  getCurrentElementTypeText
} = useCurrentElement(questionSettings,currentQuestionId)

const {
    updateElementField,
    handleSettingUpdate,
    switchQuestionType,
    copyElement,
    deleteElement,
} = useElementOperations(
  questionSettings, 
  currentQuestionId, 
  currentElement,
  settingType,
  selectedOptionIndex
)

const {
    handleQuestionTypeClick,
    handleStructrueChange
} = useQuestionCreation(questionSettings, currentQuestionId, pageIndex, isCurrentQuestionAPage)

// 当页面结构变化时重新初始化 Sortable
watch(
  () => questionSettings.value?.pages?.length || 0,
  () => {
    nextTick(() => {
      initSortable(questionSettings, instructionElementId.value, istarg);
    });
  }
);


const handleLogicUpdate = (saveLogicObj) => {
  handleLogicRulesUpdate(saveLogicObj, questionSettings);
};

</script>

<style scoped lang="scss">
.questionType {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}

.design {
  display: flex;

  .typeAndStyleBox {
    flex: 1;
    background: rgb(243, 243, 243);

    .mainPart {
      display: flex;
      margin-top: 64px;

      .questionTypeList {
        max-height: calc(100vh - 64px);
        width: 240px;
        background-color: white;
        overflow-y: auto;

        .list {
          width: 100%;
          padding: 10px 0;
          
          // 添加分组标题样式
          .groupTitle {
            padding: 5px 20px;
            color: #666;
            font-size: 15px;
            font-weight: bold;
          }

          .btnCategory{
            display: flex;
            // align-items: center;
            flex-wrap: wrap;
             .btnItem {
                width: 46%;
                height: 40px;

                display: flex;
                align-items: center;
                padding: 4px;

                .btn {
                  cursor: pointer;

                  width: 100%;
                  height: 38px;
                  border: 1px solid rgb(216, 216, 216);
                  background-color: rgba(255, 255, 255, 0);
                  margin:10px 0 0px 5px;

                  color: rgb(144, 144, 144);
                  font-size: 14px;
                  font-weight: bold;

                  display: flex;
                  align-items: center;

                  .btnIcon {
                    margin-left: 10px;
                  }

                  .btnText {
                    font-size: 14px;
                    margin: 0 0px 2px 5px;
                  }
                }

                .btn:hover {
                  background-color: white;
                  color: #5e9eff;
                  border-color: #5e9eff;
                }
              }
          }

         
        }

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .middlePart {
        overflow: auto;
        flex: 1;
        height: calc(100vh - 64px);

        .creatorContent {
          padding-top: 10px;
          width: 98%;
          margin: 0 auto;

          .surveyNameBox {
            margin-top: 40px;
            width: 100%;
            height: 150px;
            background-color: white;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .surveyName {
              width: 90%;
              margin: 0 auto 8px auto;

              font-size: 22px;

              display: flex;
              align-items: center;
            }

            .description {
              width: 90%;
            }
          }

          .questionListContainer {
            width: 100%;
            box-sizing: border-box;
            min-height: 50px;

            .page-container {
              min-height: 50px;
            }

            .question-container {
              transition: transform 0.15s ease;

              &.sortable-ghost {
                background: #f0f9ff;
                border: 2px dashed #409eff;
              }
            }
          }

          .completeHtmlBox {
            margin: 20px 0;
            width: 100%;
            height: 150px;
            background-color: white;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .title{
              font-size: 18px;
              margin-bottom: 8px;
            }

            .completeHtml {
              width: 90%;
              margin: 0 auto 8px auto;
              font-size: 22px;

              display: flex;
              align-items: center;
            }

            .description {
              width: 90%;
            }
          }
        }

        &::-webkit-scrollbar {
           width: 6px;
           background-color: transparent;
        }

        // 设置滚动条滑块的样式
        &::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 3px;
        }

        // 鼠标悬停在滑块上时的样式
        &::-webkit-scrollbar-thumb:hover {
          background-color: #a8a8a8;
        }

        // 设置滚动条轨道的样式
        &::-webkit-scrollbar-track {
          background-color: transparent;
        }
      }
    }
  }

  .propertyGridBox {
    background-color: white;
    width: 250px;
    border-left: 1px solid rgb(214, 214, 214);

    .titleBox {
      height: 64px;
      width: 100%;
      background-color: white;
    }

    .propertyGrid {
      padding: 20px;
      height: calc(100vh - 64px - 40px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;

      .segment-container {
        height: 45px;

        :deep(.el-segmented) {
          width: 100%;
          height: 100%;
          border: 1px solid #dcdfe6;
          --el-segmented-item-selected-bg-color: white;
          --el-segmented-item-selected-color: rgb(33, 33, 33);
        }

        :deep(.el-segmented-item) {
          flex: 1;
          height: 100%;
          line-height: 45px;
          font-size: 14px;
          color: black;
        }
      }

      .segment-content {
        flex: 1;
        margin-top: 15px;

        .quick-settings,
        .question-settings {
          height: 100%;
        }
      }
    }
  }
}

.setting-section {
  margin-bottom: 10px;
  border-bottom: 1px solid #ebeef5;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .section-content {
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      cursor: pointer;

      span {
        color: #606266;
        font-size: 14px;
      }

      .help-icon {
        margin: 0 8px;
        color: #909399;
      }

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

:deep(.el-switch) {
  --el-switch-width: 30px;
  height: 16px;
}

:deep(.el-switch .el-switch__core) {
  height: 16px;
  min-width: var(--el-switch-width);
  width: var(--el-switch-width);
}

:deep(.el-switch .el-switch__core .el-switch__action) {
  height: 12px;
  width: 12px;
  margin: 2px;
}

:deep(.el-switch) {
  --el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: #409eff;
  background-color: #409eff;
}
</style>
