<template>
  <div class="design">
    <div class="typeAndStyleBox">
      <div class="mainPart">
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
          <div class="creatorContent">
            <div class="surveyNameBox">
              <div class="surveyName">
                <customEditor
                  :model-value="draftState.title"
                  width="400px"
                  editorId="surveyName"
                  @blur="changeSurveyPorp($event, 'title')"
                />
              </div>
              <div class="description">
                <customEditor
                  :model-value="draftState.description"
                  width="400px"
                  editorId="description"
                  @blur="changeSurveyPorp($event,'description')"
                />
              </div>
            </div>
            <div class="questionListContainer">
              <div class="firstElement">
                <instruction 
                  :element="instructionElement" />
              </div>
              <draggable
                :model-value="incrementalLoadingInstance?.renderedItems"
                item-key="id"
                handle=".drag-handle"
                @change="handleDragChange"
              >
                <template #item="{ element: item }">
                  <div className="vue-draggable-next">
                    <!-- Page 渲染 -->
                    <div
                      v-if="item.type === 'page'"
                      class="page-container"
                      :data-page-index="item.pageIndex"
                    >
                      <page
                        v-if="draftState.pages.length > 1"
                        :id = "item.id"
                        :totalPages="draftState.pages.length"
                        :currentPage="item.pageIndex + 1"
                        :selected="editorStore.isPageSelected(item.pageIndex)"
                        :questionList="getQuestionNameOf(item.page)"
                        @click = "editorStore.selectPage(item.pageIndex)"
                      />
                    </div>
                    <!-- Element 渲染 -->
                    <component
                      v-else-if="item.type === 'element' && item.element.id !== instructionElementId"
                      :id="item.element.id"
                      :is="componentIs(item.element)"
                      :show-number="isShowNumber(item.element)"
                      :element="item.element"
                    />
                  </div>
                </template>
              </draggable>
              <!-- 哨兵元素 -->
              <div v-if="incrementalLoadingInstance.hasMore" ref="sentinelRef" class="loading-sentinel">
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
                  :model-value="draftState.completedHtml"
                  width="400px"
                  editorId="completedHtml"
                  @blur="changeSurveyPorp($event, 'completedHtml')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="propertyGridBox">
      <div class="titleBox"></div>
      <div class="propertyGrid">
        <div class="segment-container">
          <el-segmented
            v-model="editorStore.settingType"
            :options="settingTypeOptions"
            style="margin-bottom: 1rem"
          />
        </div>
        <div class="segment-content">
          <div v-if="editorStore.settingType === 'quickSetting'" class="quick-settings">
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
                  <el-switch v-model="oneQuestionPerPage"/>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="question-settings">
            <div class="questionType" v-if="editorStore.currentQuestionId">
              {{ getCurrentElementTypeText }}
            </div>
            <component
              v-if="editorStore.currentQuestionId"
              :is="settingComponentMap[getCurrentElementType]"
              :key="editorStore.currentQuestionId"
              :element="currentElement"
              :quesitonTypeText="getCurrentElementTypeText"
              @setting-update="(key, value) => handleSettingUpdate(key, value)"
              @update:questionType="switchQuestionType"
            />
            <div v-else>未选中任何题目</div>
          </div>
        </div>
      </div>
    </div>
    <logic-setting-dialog
      :visible="editorStore.logicDialogVisible"
      :element="currentElement"
    />
  </div>
</template>

<script setup lang="ts">
import page from "@/views/creator/components/page.vue";
import instruction from "@/views/creator/components/instruction.vue";
import customEditor from "@/views/creator/components/customEditor.vue";

import draggable from "vuedraggable"
import { defineAsyncComponent,nextTick } from "vue"
import { questionTypeList } from "@/views/creator/utils/questionTypeList";
import { settingComponentMap } from "@/views/creator/config/registry";
import { useIncrementalLoading } from "@/views/creator/composables/useIncreamentalLoading"
import { useQuestionDisplay } from "@/views/creator/composables/useQuestionNumberDisplay"
import { useCurrentElement } from "@/views/creator/composables/useCurrentElement"
import { useComponentMapping } from '@/views/creator/composables/useComponentMapping'
import { usePageStructure } from '@/views/creator/composables/usePageStructure'
import { useElementOperations } from '@/views/creator/composables/useElementOperations'
import { useQuestionCreation } from '@/views/creator/composables/useQuestionCreation'
import { useHoverState } from '@/views/creator/composables/useHoverState'
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { snapshot } from '@/views/creator/config/shared'
import { useEditorStore } from "@/stores/editorContextStore";

const LogicSettingDialog = defineAsyncComponent({
  loader: () => import("@/views/creator/components/LogicSettingDialog.vue"),
  loadingComponent: () => h('div', { class: 'loading-dialog' }, '加载中...'),
  errorComponent: () => h('div', { class: 'error-dialog' }, '加载失败'),
  delay: 200,
  timeout: 3000
})

const editorStore = useEditorStore()
const settingTypeOptions = [
    { label: '快捷设置', value: 'quickSetting' },
    { label: '题目设置', value: 'questionSetting' }
]

const { applySurveyPropChange, applyMove } = useDraftActions()
const changeSurveyPorp = (event:any, key: string) =>{
  applySurveyPropChange({
    key,
    value:event
  })
}

const sentinelRef = ref(null)  // 直接在组件中创建

// 先初始化 draftState
const { draftState } = useDraftContext()
const instructionElementId = draftState.value.pages[0].elements[0].id;
const instructionElement = draftState.value.pages[0].elements[0];
// 增量加载相关状态 - 先定义默认值避免暂时性死区
const incrementalLoadingInstance = ref({})

// 数据加载完成后，初始化增量加载
incrementalLoadingInstance.value = useIncrementalLoading(
  draftState, 
  sentinelRef, {
    initialCount: 10,
    batchSize: 5,
    threshold: 200
  }
);

// 初始化数据
incrementalLoadingInstance.value.init();

onMounted(async () => {   
  // 等待 DOM 渲染完成后初始化 Observer
  await nextTick();
  if (sentinelRef.value) {
    incrementalLoadingInstance.value.initObserverManually();
  }
});

const handleDragChange = (evt: any)  => {
  const { moved:{oldIndex, newIndex} } = evt
  if (
    oldIndex == null ||
    newIndex == null ||
    oldIndex === evt.newIndex
  ) return
  
  const source = incrementalLoadingInstance.value?.renderedItems?.[oldIndex]
  const target = incrementalLoadingInstance.value?.renderedItems?.[newIndex]
  if (!source || !target) return
  
  const rawSource = snapshot(source)
  const rawTarget = snapshot(target)
  applyMove({
    sourceId: rawSource.id,
    targetId: rawTarget.id,
    sourceType: rawSource.type
  })
}

const { hoveredQuestionType } = useHoverState()
const { componentIs } = useComponentMapping()
const { 
  showQuestionNumbers, 
  isShowNumber, 
} = useQuestionDisplay(draftState)

const {
  oneQuestionPerPage,
  getQuestionNameOf
} = usePageStructure(draftState)

const { 
  currentElement, 
  getCurrentElementType, 
  getCurrentElementTypeText
} = useCurrentElement(draftState)

const {
    handleSettingUpdate,
    switchQuestionType,
} = useElementOperations(
  draftState, 
  editorStore.currentQuestionId, 
  currentElement,
  editorStore.settingType,
  editorStore.selectedOptionIndex
)

const { handleQuestionTypeClick } = useQuestionCreation()

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
