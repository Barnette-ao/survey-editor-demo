<template>
  <div class="preview">
    <div class="topblock"></div>
    <div class="surveyBox">
      <SurveyCreatorComponent :model="creator" />
    </div>
  </div>
</template>

<script setup>
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";


import { showOrhideChoice, hcChoice } from "@/views/creator/config/setChoiceVisibleIf";
import { SurveyCreatorComponent } from "survey-creator-vue";
import {
  SurveyCreatorModel,
  editorLocalization,
  SurveyLogic,
  localization,
} from "survey-creator-core";

import "survey-core/survey.i18n";
import Cookies from "js-cookie";
import { setLicenseKey, Serializer } from "survey-core";
import markdownit from "markdown-it";

import { useSurveyId } from "@/views/creator/composables/useSurveyId";




const zhcn = editorLocalization.getLocale("zh-cn");
zhcn.ed.testSurvey = " ";

setLicenseKey("MzRkNWU3YjMtMDE3Yi00OTFmLWJjZjEtYjAzZjE5OGI4MGQxOzE9MjAyNS0xMC0zMA==");
Serializer.findProperty("question", "title").typeValue = "html";

import { settings } from "survey-core";

settings.triggers.executeSkipOnValueChanged = false;

const createOptions = {
  showLogicTab: false,
  isAutoSave: false,
  showTitlesInExpressions: true,
  showObjectTitles: true,
  previewDevice: "androidPhone",
  showDesignerTab: false,
  allowEditExpressionsInTextEditor: true,
  showDefaultLanguageInPreviewTab: false,
  previewOrientation: "portrait",
  addNewQuestionLast: true,
  readOnly: false,
  showJSONEditorTab: false,
  allowModifyPages: true,
  maxVisibleChoices: 8,
  showInvisibleElementsInPreviewTab: false,
  questionTypes: [
    "radiogroup",
    "checkbox",
    "dropdown",
    "text",
    "comment",
    "rating",
    "html",
    "file",
    "matrix",
    //"matrixdropdown",
    // "matrixdynamic",
    "multipletext",
    "panel",
    "signaturepad",
    "sortablelist",
    "flowpanel",
    "rating",
    "imagepicker",
    "ranking",
    "customcheckbox",
  ],
};
const urlParams = new URLSearchParams(window.location.search);
const qid = urlParams.get("id");
let creator = new SurveyCreatorModel(createOptions);

function upfileSurvey(_, options) {
  const formData = new FormData();
  //console.log("Files uploaded:", options.files);

  // 添加所有上传的文件
  options.files.forEach(function (file) {
    formData.append(file.name, file);
  });
}

creator.onSurveyInstanceCreated.add((_, options) => {
  options.survey.onTextMarkdown.add(applyHtml);
  options.survey.onUploadFiles.add(upfileSurvey);
});

const converter = markdownit({
  html: true, // 支持HTML标签（不安全，请参阅文档）
});

function applyHtml(_, options) {
  let str = converter.renderInline(options.text);

  if (str.indexOf("<p>") === 0) {
    // Remove root paragraphs <p></p>
    str = str.substring(3);
    str = str.substring(0, str.length - 4);
  }

  // Set HTML markup to render
  options.html = str;
}

// 重构survey数据结构，从将所有元素反到同一个数组中改成每一个题目元素都是一页。
// 这是因为目前的设计中，题目元素是一个数组中，在预览界面中，跳转逻辑不能按照预期运行。
// 改成一题一页的方式，就可以正常运行跳转逻辑了。
function redistributeElementsToSingleQuestionPages(data) {
  const surveyData = JSON.parse(JSON.stringify(data));

  if (surveyData.questionsOnPageMode !== "questionPerPage") {
    return surveyData;
  }

  // 重构pages数据结构，从将所有元素反到同一个数组中改成每一个题目元素都是一页。
  surveyData.pages = surveyData.pages
    .reduce((allElements, page) => {
      if (page.elements?.length) {
        allElements.push(...page.elements);
      }
      return allElements;
    }, [])
    .map((element, index) => ({
      name: `page${index + 1}`,
      elements: [element],
    }
  ));

  if (surveyData.pages.length === 0) {
    return surveyData;
  }

  surveyData.questionsOnPageMode = "standard";
  return surveyData;
}

// 根据题目元素的choicesShowHide属性的值，来设置题目元素的choices的visible属性的值。
// elements表示某一个页面中所有的题目元素，是个数组。
const setChoiceVisibleIf = (elements) => {
  // 只有选择类题目有choices属性，所以要过滤掉非选择类题目。
  const selectBaseQuestion = ['checkbox', 'dropdown', 'imagepicker', 'radiogroup', 'ranking']

  // 验证是否有效，
  // 判断条件，是否为选择类题目，并choices数组非空，choicesShowHide字符串非空且以$结尾，
   const isValidChoice = (element) => {
    const { type, choicesShowHide, choices } = element;
    return (
      selectBaseQuestion.includes(type) &&
      choices?.length > 0 &&
      choicesShowHide?.endsWith('$')
    );
  };

  for (const element of elements) {
    // 验证是否有效，无效跳过该题目元素，取下一个题目元素。
    if (!isValidChoice(element)) continue;
    // 有效题目元素，解析choicesShowHide字符串
    const conditions = element.choicesShowHide
      .slice(0, -1)
      .split("#")
      .map((part) => part.trim());

    // 根据字符串首位来判断逻辑类型  
    switch (conditions[0]) {
      // 字符串首位是1，表示设置显示隐藏自定义逻辑  
      case '1':
        // 验证是否是显示隐藏自定义逻辑，并且有三个逻辑分支，
        if (conditions.length !== 3) continue;
        // ranking和dropdown类型的题目元素的choices属性默认是字符串数组，而不是对象数组
        // 所以需要将choices数组中的元素转换为对象，
        element.choices = element.choices.map(choice => 
          typeof choice === 'object' ? choice : { value: choice }
        );
        // 使用element.choices进行传值，而不是解构赋值一个choices
        showOrhideChoice(element.choices, conditions);
      // 字符串首位是2，表示设置多选题选项互斥逻辑
      case '2':
        // 验证是否是多选题，并且有两个逻辑分支，
        if (conditions.length !== 2 || element.type !== "checkbox") continue;
        // 使用element.choices进行传值，而不是解构赋值一个choices,
        // 解构赋值所得的choices的引用是不一致的，
        // 所以对choices进行修改不会作用在element.choices上。
        // 解构赋值只适合不修改引用类型的值的情况。
        hcChoice(element.choices, element.name, conditions);  
    }  
  }
};

Cookies.set("islogic", "0");

creator.survey.onTextMarkdown.add(applyHtml);
creator.survey.autoAdvanceAllowComplete = false;

const questionSettings = ref({})

const { loadRunningState } = useSurveyId() 
questionSettings.value = loadRunningState()

questionSettings.value.locale = "zh-cn";
// 使用 for...of 而不是 forEach，因为在回调函数中 
// continue 只能跳出当前回调，不能跳到下一次循环
for(const page of questionSettings.value.pages) {
  setChoiceVisibleIf(page.elements)
}  
console.log("questionSettings.pages", questionSettings.value.pages)  

creator.JSON = questionSettings.value.questionsOnPageMode == "questionPerPage"
    ? redistributeElementsToSingleQuestionPages(questionSettings.value)
    : questionSettings.value;

console.log("creator.JSON", creator.JSON); 

creator.locale = "zh-cn";
creator.survey.locale = "zh-cn";
const testTab = creator.getPlugin("test");
testTab.setDevice("androidPhone");


</script>

<style scoped lang="scss">
.preview {
  .topblock {
    height: 64px;
  }

  .surveyBox {
    margin-top: 2px;
    height: calc(100vh - 66px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

:deep(.svc-top-bar){
  background: transparent!important;
  box-sizing:content-box !important;
  box-shadow:none
}

:deep(.svc-tabbed-menu-item--selected){
  background:transparent!important;
  box-shadow:none
}

.svc-tabbed-menu {
  display: none !important;
}
</style>
