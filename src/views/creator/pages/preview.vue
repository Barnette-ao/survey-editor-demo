<template>
  <div class="preview">
    <div class="topblock"></div>
    <div class="surveyBox">
      <SurveyCreatorComponent :model="creator" />
    </div>
  </div>
</template>

<script setup>
import {
  SurveyCreatorModel,
  editorLocalization,
  SurveyLogic,
  localization,
} from "survey-creator-core";
import "survey-core/survey.i18n";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import { settings } from "survey-core";
import { SurveyCreatorComponent } from "survey-creator-vue";
import Cookies from "js-cookie";
import { setLicenseKey, Serializer } from "survey-core";
import { useSurveyId } from "@/views/creator/composables/useSurveyId";
import { createOptions } from "@/views/creator/config/surveyCreatorOption"
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { 
  upfileSurvey,
  applyHtml,
  redistributeElementsToSingleQuestionPages,
  setChoiceVisibleIf 
} from "@/views/creator/utils/preview"

const zhcn = editorLocalization.getLocale("zh-cn");
zhcn.ed.testSurvey = " ";
setLicenseKey("MzRkNWU3YjMtMDE3Yi00OTFmLWJjZjEtYjAzZjE5OGI4MGQxOzE9MjAyNS0xMC0zMA==");
Serializer.findProperty("question", "title").typeValue = "html";
settings.triggers.executeSkipOnValueChanged = false;

let creator = new SurveyCreatorModel(createOptions);
creator.onSurveyInstanceCreated.add((_, options) => {
  options.survey.onTextMarkdown.add(applyHtml);
  options.survey.onUploadFiles.add(upfileSurvey);
});

Cookies.set("islogic", "0");
creator.survey.onTextMarkdown.add(applyHtml);
creator.survey.autoAdvanceAllowComplete = false;

const { draftState } = useDraftContext()
draftState.value.locale = "zh-cn";
for(const page of draftState.value.pages) {
  setChoiceVisibleIf(page.elements)
}   
creator.JSON = draftState.value.questionsOnPageMode == "questionPerPage"
    ? redistributeElementsToSingleQuestionPages(draftState.value)
    : draftState.value; 
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
