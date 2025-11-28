


export const questionTypeList = [
    {
        category: "choices",
        categoryName: "选择题",
        list: [
            {
                type: 'radiogroup',
                text: "单选",
                hoveredPath: '/images/questionnaire/hoveredRadio.png',
                defaultPath: '/images/questionnaire/radio.png',
            },
            {
                type: 'checkbox',
                text: "多选",
                hoveredPath: '/images/questionnaire/hoveredCheckbox.png',
                defaultPath: '/images/questionnaire/checkbox.png',
            },
            {
                type: 'dropdown',
                text: "下拉",
                hoveredPath: '/images/questionnaire/hoveredDropdown.png',
                defaultPath: '/images/questionnaire/dropdown.png',
            },
            {
                type: 'ratinglabel',
                text: "量表",
                rateType: "label",
                hoveredPath: '/images/questionnaire/hoveredScale.png',
                defaultPath: '/images/questionnaire/scale.png',
            },
            {
                type: 'imagepicker',
                text: "选图片",
                hoveredPath: '/images/questionnaire/hoveredPictrue.png',
                defaultPath: '/images/questionnaire/pictrue.png',
            },
        ]
    },
    {
        category: "fillingQuestion",
        categoryName: "填空题",
        list: [
            {
                type: 'text',
                text: "填空",
                hoveredPath: '/images/questionnaire/hoveredSingleText.png',
                defaultPath: '/images/questionnaire/singleText.png',
            },
            {
                type: 'comment',
                text: "多行填空",
                hoveredPath: '/images/questionnaire/hoveredMultilineText.png',
                defaultPath: '/images/questionnaire/multilineText.png',
            },
            {
                type: 'multipletext',
                text: "多项填空",
                hoveredPath: '/images/questionnaire/hoveredTextboxGroup.png',
                defaultPath: '/images/questionnaire/textboxGroup.png',
            },
        ]
    },
    {
        category: "score",
        categoryName: "打分排序",
        list: [
            {
                type: 'ratingsmileys',
                text: "评价",
                rateType: "smileys",
                hoveredPath: '/images/questionnaire/hoveredEvaluate.png',
                defaultPath: '/images/questionnaire/evaluate.png',
            },
            {
                type: 'ratingstars',
                text: "打分",
                rateType: "stars",
                hoveredPath: '/images/questionnaire/hoveredScore.png',
                defaultPath: '/images/questionnaire/score.png',
            },
            {
                type: 'ranking',
                text: "排序",
                hoveredPath: '/images/questionnaire/hoveredRank.png',
                defaultPath: '/images/questionnaire/rank.png',
            },
        ],
    },
    {
        category: "remark",
        categoryName: "备注说明",
        list: [
            {
                type: 'html',
                text: "备注说明",
                hoveredPath: '/images/questionnaire/hoveredHtmlBlock.png',
                defaultPath: '/images/questionnaire/htmlBlock.png',
            },
            {
                type: 'page',
                text: "分页",
                hoveredPath: '/images/questionnaire/hoveredPaging.png',
                defaultPath: '/images/questionnaire/paging.png',
            }
        ],
    },
    {
        category: "others",
        categoryName: "其他题型",
        list: [
            {
                type: "file",
                text: "文件上传",
                hoveredPath: '/images/questionnaire/hoveredFile.png',
                defaultPath: '/images/questionnaire/file.png',
            },
            {
                type: 'signaturepad',
                text: "签名",
                hoveredPath: '/images/questionnaire/hoveredSign.png',
                defaultPath: '/images/questionnaire/sign.png',
            },
            {
                type: 'matrix',
                text: "矩阵单选",
                hoveredPath: '/images/questionnaire/hoveredMatrixRadio.png',
                defaultPath: '/images/questionnaire/matrixRadio.png',
            },
        ],
    },
]

