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
            <div class="questionListContainer">
              <div class="firstElement">
                <instruction
                  :element="instructionElement"
                  :isShowHeadAction="false"
                  :isEditable="true"
                />
              </div>
              <template v-for="item in renderedItems" :key="item.id">
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
                  @copy="(id) => handleCopy(id, item.element.type)"
                  @delete="handleDelete(item.element.id)"
                  @setLogic="handleSetLogic"
                  @optionSetting="handleOptionSettingUpdate"
                  @update="(key, value) => handleElementUpdate(key, value)"
                />
              </template>
            
              <!-- 哨兵元素 -->
              <div v-if="hasMore" ref="sentinelRef" class="loading-sentinel">
                <div v-if="isLoading" class="loading-indicator"> 加载中...</div>
              </div>
              <!-- 加载完成提示 -->
              <div v-else class="load-complete">
                已加载全部内容 (共 {{ renderedItems.length }} 项)
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
    <div class="propertyGridBox">
      <div class="titleBox"></div>
      <div class="propertyGrid">
        <div class="segment-container">
          <el-segmented
            v-model="settingType"
            :options="settingTypeOptions"
            style="margin-bottom: 1rem"
          />
        </div>
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
          <div v-else class="question-settings">
            <div class="questionType" v-if="currentQuestionId">
              {{ getCurrentElementTypeText }}
            </div>
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
              @update:questionType="handleQuestionTypeUpdate"
              @setLogic="handleSetLogic"
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

<script setup>
import { defineAsyncComponent } from "vue"

import instruction from "@/views/creator/components/instruction.vue";
import { questionTypeList } from "@/views/creator/utils/questionTypeList";
import page from "@/views/creator/components/page.vue";

const LogicSettingDialog = defineAsyncComponent(()=> import("@/views/creator/components/LogicSettingDialog.vue")) ;

import { updateDefaultSettings, loadSettingsFromDatabase } from "@/views/creator/config";
import {
  componentMap,
  settingComponentMap,
  ratingTypeMap,
} from "@/views/creator/config/componentAndSettingMap";
import {
  getSettingProps,
  generateUUID,
  formattedNumber,
} from "@/views/creator/config/helpers";
import {
  addQuestionElement,
  addPage,
  getPageAndElementIndexOfSelectElement,
  handleCopyElement,
  deleteQuestion,
  switchElementByType,
  handleDeletePage,
  removeLogicRulesOfDeletedRule,
} from "@/views/creator/config/handleElementAndPage";
import { initSortable } from "@/views/creator/config/dragElementOrPage";
import { destroyAllOptionSortables } from "@/views/creator/config/dragOption.js";
import {
  handleLogicRulesUpdate,
  getLogicRulesOfElement,
} from "@/views/creator/config/updateLogic";

import { ElMessage, ElMessageBox } from "element-plus";
import { watch, nextTick } from "vue";
import { debounce, isEqual } from "lodash-es";
import customEditor from "@/views/creator/components/customEditor.vue";
import { useIncrementalLoading } from "@/views/creator/composibles/useIncreamentalLoading.js"


//定义是否拖拽，拖拽则赋空值时不更新数据
const istarg = ref(false);
// 先初始化 questionSettings
const questionSettings = reactive({});
const instructionElementId = ref("");
const instructionElement = ref({});

// 创建防抖函数，延迟5秒执行
const saveToDefault = debounce((newValue) => {
  updateDefaultSettings(newValue);
}, 1000);

// 监听 questionSettings 的变化
watch(
  () => questionSettings,
  (newValue) => {
    if (!istarg.value) {
      saveToDefault(newValue);
    }
  },
  { deep: true }
);

const sentinelRef = ref(null)  // 直接在组件中创建

// 增量加载相关状态 - 先定义默认值避免暂时性死区
const renderedItems = ref([])
const hasMore = ref(false)
const isLoading = ref(false)
let incrementalLoadingInstance = null

onMounted(async () => {
  let defaultQuestionSettings = await loadSettingsFromDatabase();
  Object.assign(questionSettings, defaultQuestionSettings);
  instructionElement.value = questionSettings.pages[0].elements[0];
  instructionElementId.value = questionSettings.pages[0].elements[0].id;
  
  // 数据加载完成后，初始化增量加载
  incrementalLoadingInstance = useIncrementalLoading(questionSettings, sentinelRef, {
    initialCount: 10,
    batchSize: 5,
    threshold: 200
  });

  // 初始化数据
  incrementalLoadingInstance.init();

  // 更新响应式变量
  renderedItems.value = incrementalLoadingInstance.renderedItems.value;
  hasMore.value = incrementalLoadingInstance.hasMore.value;
  isLoading.value = incrementalLoadingInstance.isLoading.value;

  // 等待 DOM 渲染完成后初始化 Observer
  await nextTick();
  if (sentinelRef.value) {
    incrementalLoadingInstance.initObserverManually();
  }
  

  // 初始化拖拽功能
  initSortable(questionSettings, instructionElementId.value, istarg);
});

// 在组件卸载前清理所有实例
onBeforeUnmount(() => {
  destroyAllOptionSortables();
});

const hoveredQuestionType = ref('');

const componentIs = computed(() => {
  return (element) => {
    const type =
      element.type == "rating" ? ratingTypeMap[element.rateType] : element.type;
    return componentMap[type];
  };
});

// 快捷设置中的显示题目序号
const showQuestionNumbers = computed({
  get: () => questionSettings.showQuestionNumbers,
  set: (value) => {
    questionSettings.showQuestionNumbers = value;
    // 当全局设置关闭时，移除所有题目的 hideNumber 属性
    if (!value) {
      questionSettings.pages = questionSettings.pages.map((page) => {
        page.elements = page.elements.map((element) => {
          const { hideNumber, ...rest } = element;
          return rest;
        });
        return page;
      });
    } else {
      questionSettings.pages = questionSettings.pages.map((page) => {
        page.elements = page.elements.map((element) => {
          element.hideNumber = false;
          return element;
        });
        return page;
      });
    }
  },
});

// 判断是否显示题目序号（用于渲染题目组件）
const isShowNumber = computed(() => {
  return (element) => {
    // 如果全局设置关闭，直接返回 false
    if (!showQuestionNumbers.value) return false;
    // 如果全局设置开启，但 hideNumber 未定义，返回 true
    if (element.hideNumber === undefined) return true;
    // 否则返回 hideNumber 的值
    return !element.hideNumber;
  };
});

// 题目设置中的显示序号控制
const showNumberComputed = computed({
  get: () => {
    const element = currentElement.value;
    if (!element) return true;
    if (element.hideNumber === undefined) return true;
    return !element.hideNumber;
  },
  set: (value) => {
    if (!currentElement.value || !showQuestionNumbers.value) return;
    currentElement.value.hideNumber = !value;
  },
});

const currentQuestionId = ref("");

const isCurrentQuestionAPage = ref(false);
const pageIndex = ref(-1);
const handlePageClick = (index) => {
  settingType.value = "quickSetting";
  isCurrentQuestionAPage.value = true;
  pageIndex.value = index;
  currentQuestionId.value = ""; // 清除问题选中状态
};

// 处理题目点击
const handleQuestionClick = (id) => {
  settingType.value = "questionSetting";
  isCurrentQuestionAPage.value = false;
  currentQuestionId.value = id;

  pageIndex.value = -1; // 清除页面选中状态
};

const settingType = ref("quickSetting");
const settingTypeOptions = [
  { label: "快捷设置", value: "quickSetting" },
  { label: "题目设置", value: "questionSetting" },
];

const oneQuestionPerPage = computed(() => {
  return questionSettings.questionsOnPageMode === undefined
    ? "false"
    : questionSettings.questionsOnPageMode == "questionPerPage";
});
const handleStructrueChange = (isStructrueChanged) => {
  questionSettings.questionsOnPageMode = isStructrueChanged
    ? "questionPerPage"
    : "standard";
};

const currentElement = computed(() => {
  let cur = questionSettings.pages
    .map((page) => page.elements)
    .flat()
    .find((element) => element.id === currentQuestionId.value);
  console.log("cur", cur);
  return cur;
});

// 统一处理元素更新
const handleElementUpdate = (key, value) => {
  // 找到当前元素的索引
  const { pageIndex, elementIndex } = getPageAndElementIndexOfSelectElement(
    questionSettings,
    currentQuestionId.value
  );

  if (pageIndex !== undefined && elementIndex !== undefined) {
    // 直接修改源数据，确保响应式更新
    // 创建新对象保证引用变化
    const dragElement = questionSettings.pages[pageIndex].elements[elementIndex];
    // 如果value是数组，要通过创建新元素，替换旧元素来触发响应式更新视图
    if (Array.isArray(value)) {
      // 必须要删除旧元素的id,给它一个新的id，因为template中key绑定了id
      // 在diff算法中，key绑定了id，所以key相同，就会认为是同一个元素，不会触发更新视图
      // 所以必须要删除旧元素的id,给它一个新的id，
      // 不能在template中删除key = element.id，这样代码会失效。
      const { id:oldId, ...newElement } = dragElement;
      newElement[key] = value;
      const newId = generateUUID();
      newElement.id = newId;

      if (questionSettings.logicRules?.length) { 
        // 更新选中题目的逻辑规则中的元素ID
        questionSettings.logicRules = questionSettings.logicRules.map(rule => {
          // 更新其显示逻辑中的id
          if (rule.thenCondition.targetElementId === oldId && rule.thenCondition.action === "show") {
            rule.thenCondition.targetElementId = newId;
          }        
          // 更新其跳转逻辑中的id
          if (rule.thenCondition.action === "jump") {
            rule.ifConditions = rule.ifConditions.map(ifCondition => {
              ifCondition.elementId = ifCondition.elementId === oldId ? newId : ifCondition.elementId
              return ifCondition;
            });
          }
          
          return rule;
        });
      }
      

      // currentQuestionId.value更新之后，计算属性currentElement的值也会更新，
      // 渲染视图需要currentElement，currentElement改变，就会触发视图更新,如果不更新
      // currentQuestionId.value，下一步执行之后，旧元素被删掉，原来的currentQuestionId没有了相应元素，
      // 那么currentElement的值为undefined
      // 这样渲染的时候会报错：Cannot read properties of undefined (reading 'isRequired')
      currentQuestionId.value = newId;

      // 替换元素并触发响应式更新
      questionSettings.pages[pageIndex].elements.splice(elementIndex, 1, newElement);
    }
    // 如果value是原始数据类型，那么直接修改源数据就可以触发响应式更新视图
    else {
      dragElement[key] = value;
    }
  }
};

// 更新题目设置
const handleSettingUpdate = (key, value) => {
  if (!currentElement.value) return;

  switch (key) {
    case "choicesOrder":
      currentElement.value.choicesOrder = value ? "random" : "none";
      break;
    case "questionsOrder":
      currentElement.value.questionsOrder = value ? "random" : "initial";
      break;
    case "choices":
      if (value.showText !== undefined) {
        currentElement.value.choices[selectedOptionIndex.value].showText = value.showText;
      } else if (value.textType !== undefined) {
        currentElement.value.choices[selectedOptionIndex.value].textType = value.textType;
      } else if (value.required !== undefined) {
        currentElement.value.choices[selectedOptionIndex.value].required = value.required;
      }
      break;
    default:
      currentElement.value[key] = value;
  }
};

const getCurrentElementType = computed(() => {
  if (!currentElement.value) return "";

  return currentElement.value.type == "rating"
    ? ratingTypeMap[currentElement.value.rateType]
    : currentElement.value.type;
});

const getCurrentElementTypeText = computed(() => {
  if (!currentElement.value) return "";

  const currentElementType =
    currentElement.value.type == "rating"
      ? ratingTypeMap[currentElement.value.rateType]
      : currentElement.value.type;
  
  const questionType = questionTypeList
    .map((el) => el.list)
    .flat()
    .find((el) => el.type === currentElementType);
  console.log("questionType", questionType);
  return questionType?.text || "";
});

const handleCopy = (elementId, elementType) => {
  handleCopyElement(elementId, questionSettings, elementType);
  // 更新所有题目的序号
  formattedNumber(questionSettings);
  ElMessage.success("复制成功");
};

const handleDelete = (elementId) => {
  ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteQuestionElement(elementId, questionSettings);
    // 更新所有题目的序号
    formattedNumber(questionSettings);
    ElMessage({
      type: "success",
      message: "删除成功",
    });
  });
};

const deleteQuestionElement = (elementId, questionSettings) => {
  const index = deleteQuestion(questionSettings, elementId);

  if (index && index !== -1 && elementId === currentQuestionId.value) {
    currentQuestionId.value = "";
    settingType.value = "quickSetting";
  }
};

const getQuestionNameOf = computed(() => {
  return (page) => {
    if (page.elements.length === 0) return "";
    else if (page.elements.length == 1) {
      return page.elements[0].type === "html" ? "" : `Q${page.elements[0].number}`;
    } else {
      const firstQuestionIndex =
        page.elements[0].type === "html"
          ? page.elements.findIndex((item) => item.type !== "html")
          : 0;
      const lastQuestionIndex =
        page.elements[page.elements.length - 1].type === "html"
          ? page.elements.findLastIndex((item) => item.type !== "html")
          : page.elements.length - 1;

      return firstQuestionIndex === lastQuestionIndex
        ? `(Q${page.elements[firstQuestionIndex].number})`
        : `(Q${page.elements[firstQuestionIndex].number} 
				      - Q${page.elements[lastQuestionIndex].number})`;
    }
  };
});

const handleQuestionTypeClick = (elemntType) => {
  console.log("+++++++elemntType", elemntType);
  if (elemntType == "page") {
    addPage(
      questionSettings,
      currentQuestionId.value,
      pageIndex.value,
      isCurrentQuestionAPage.value
    );
  } else {
    // 当前选中的题目改为新添加的题目
    currentQuestionId.value = addQuestionElement(questionSettings, elemntType, currentQuestionId.value);
  }
};

// 切换题目类型
// 根据被切换的题目元素生成新的题目元素，在被切换的题目元素的位置插入新的题目元素
const handleQuestionTypeUpdate = (newType) => {
  const newElement = switchElementByType(newType, questionSettings, currentElement.value);

  const { elementIndex, pageIndex } = getPageAndElementIndexOfSelectElement(
    questionSettings,
    currentQuestionId.value
  );

  // 不能写成elementIndex && pageIndex
  // 因为elementIndex和pageIndex取0的时候，表达式的值为false
  if (elementIndex !== undefined && pageIndex !== undefined) {
    // 删除与被切换的题目元素关联的所有逻辑规则
    removeLogicRulesOfDeletedRule(questionSettings, currentQuestionId.value)
    // 替换元素并触发响应式更新
    questionSettings.pages[pageIndex].elements.splice(elementIndex, 1, newElement);
    // 更新当前选中的题目ID
    currentQuestionId.value = newElement.id;
  }
};

const isOptionSetting = ref(false);
// 添加UI状态管理
const selectedOptionIndex = ref(-1);
// 处理选项设置相关的状态更新
const handleOptionSettingUpdate = (params) => {
  currentQuestionId.value = params.id;

  if (params.isOpen) {
    settingType.value = "questionSetting";
  }

  isOptionSetting.value = params.isOpen;
  selectedOptionIndex.value = params.index;
};

// 当页面结构变化时重新初始化 Sortable
watch(
  () => questionSettings?.pages?.length || 0,
  () => {
    nextTick(() => {
      initSortable(questionSettings, instructionElementId.value, istarg);
    });
  }
);

const logicDialogVisible = ref(false);
const settedLogicElement = ref({});

const handleSetLogic = (element) => {
  settedLogicElement.value = element;
  logicDialogVisible.value = true;
};

const handleLogicUpdate = (saveLogicObj) => {
  handleLogicRulesUpdate(saveLogicObj, questionSettings);
};

const getLogicRuleNum = computed(() => {
  return (elementId) => {
    const rules = getLogicRulesOfElement(questionSettings.logicRules ?? [], elementId);
    return rules.length;
  };
});

const closeLogicDialog = () => {
  logicDialogVisible.value = false;
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
