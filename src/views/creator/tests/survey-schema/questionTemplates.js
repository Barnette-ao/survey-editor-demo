export const questionTemplates = [
	{
		"type": 'html',
		"title": "标题",
		"html": "请输入说明文字",
	},
	{
		"type": "radiogroup",
		"title": "请选择一个选项",
		"description": "",
		"isRequired": true,
        "hideNumber":false,
		"choices": [{
			"value": "选项1",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项2",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项3",
			"showText": false,
			"textType": "text",
			"required": true,
		}],
	},
	{
		"type": 'checkbox',
		"isRequired": true,
		"showSelectAllItem": false,
		"title": "请选择以下选项（多选）",
		"description": "",
		"choices": [{
			"value": "选项1",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项2",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项3",
			"showText": false,
			"textType": "text",
			"required": true,
		}],
		"itemComponent": "survey-checkbox-newitem",
		"selectAllText": "全选",
	},
	{
		"type": 'dropdown',
		"isRequired": true,
		"title": "请选择一个选项",
		"description": "",
		"choices": [
			"选项1",
			"选项2",
			"选项3",
		],
	},
	{
		"type": 'ratinglabel',
		"isRequired": true,
		"title": "请您对此项目进行评价",
		"description": "",
		"rateType": "label",
		"displayMode": "buttons",
	},
	{
		"type": 'ratingstars',
		"title": "请您对我们的服务进行评价",
		"description": "",
		"isRequired": true,
		"rateType": "stars",
		"displayMode": "buttons"
	},
	{
		"type": 'ratingsmileys',
		"title": "请您对我们的服务进行评价",
		"description": "",
		"isRequired": true,
		"rateType": "smileys",
		"displayMode": "buttons"
	},
	{
		"type": 'ranking',
		"title": "请给以下选项排序",
		"description": "",
		"isRequired": true,
		"choices": [
			"选项1",
			"选项2",
			"选项3"
		]
	},
	{
		"type": 'file',
		"title": "请上传文件",
		"description": "",
		"isRequired": true,
		"storeDataAsText": false,
		"waitForUpload": "true",
		"fileOrPhotoPlaceholder": "点击或拖拽文件到此处上传",
		"photoPlaceholder": "点击或拖拽文件到此处上传",
		"filePlaceholder": "点击或拖拽文件到此处上传"
	},
	{
		"type": 'imagepicker',
		"isRequired": true,
		"isRequired": true,
		"title": "请选择以下图片",
		"choices": [],
		"imageFit": "cover"
	},
	{
		"type": 'text',
		"isRequired": true,
		"title": "请填写本项内容",
		"description": '',
	},
	{
		"type": 'comment',
		"isRequired": true,
		"placeholder": '请输入',
		"title": '请填写本项内容',
		"description": '',
	},
	{
		"type": 'multipletext',
		"title": "请填写以下内容",
		"description": "",
		"isRequired": true,
		"items": [
			{
				"name": "填空1",
			},
			{
				"name": "填空2",
			}
		]
	},
	{
		"type": 'matrix',
		"title": "请选择以下选项",
		"description": "",
		"isRequired": true,
		"columns": [
			"选项1",
			"选项2",
		],
		"rows": [
			"矩阵行1",
			"矩阵行2"
		]

	},
	{
		"type": 'panel',
	},
	{
		"type": 'signaturepad',
		"title": "请在虚线内签名",
		"description": "",
		"isRequired": true,
		"placeholder": '请在虚线内签名',
		"placeholderReadOnly": "签名",
	}
]
