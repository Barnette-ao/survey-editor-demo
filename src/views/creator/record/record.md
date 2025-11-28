## 随便记录

我已经同步了git的远程代码

#### 过程记录
1. 当远程仓库已经提交之后，即远程仓库比本地仓库多一次提交的时候，
2. 我在本地也进行了一次修改，做了一次提交。
3. 然后我再执行`git pull --rebase` 
4. 预期结果是拉取远程的提交与本地的提交融合，我想保留远程提交上的修改。
5. 需要说明的是本地的新一次的提交和远程的提交修改的是同一个文件config/index.js
6. 实际的执行结果是，本地的提交完全覆盖掉了远程的提交的config/index.js，远程提交上的修改完全丢失。
7. `git pull --rebase` 发生冲突，融合之后生成了一个新的提交，并再本地最新除生成了一个新的提交，并且查看`git log`,远程新提交的commit信息在log列表中。
8. 这时执行git status,发现本地比远程超前一次提交
9. 根据第7步的log记录，我找到了远程的那个提交之前的hash号，用`git reset --hard hashcode`，回滚到了这个版本。
10. 然后执行`git status`，发现本地比远程仓库落后一个提交，这个提交就是我想要融合的提交
11. 执行`git pull`,将远程的提交拉取到了本地，但丢失了我在第二步时所作的提交内容。

#### 反思
1. 如果我一开始不做提交，就用git pull就好了。
2. `git pull --rebase` 执行发生冲突后，可以保留原来的提交记录，在回滚定位的时候很重要，相较之下，如果使用`git pull`融合远程和本地代码，冲突解决之后，会生成一个新的提交，会自动将融合的提交覆盖掉，也就是会丢失远程仓库或本地仓库原来的记录，在debug的时候就难以定位。
3. 所以在没有把握的情况下，用`git pull --rebase`进行本地和远程的融合。

现在来修改拉取远程代码造成的bug

#### 过程记录
1. 根据bug的日志发现，错误是处在instruction.vue这个文件中。
```
TypeError: Cannot read properties of undefined (reading 'title')
```
因为element中没有title这个属性，所以出现了bug。

2. 现在要去查看element的具体值。element是questionSettings这个对象的elements数组中的一个元素。
3. questionSettings是通过getInitialSettings从数据库读取来的。打印整个questionSettings
4. 在其中看到了简介说明的值。
```js
{
  html:{
  	default: "这是问卷简介"
  	zh-cn: "<p>这是问卷简介</p>"
  },   
  name: "简介页面",
  type: "html",
}
```
5. 确实没有title这个属性，
6. `computed(() => props.element.title ? getValueOf(props.element.title) : props.element.name)`
7. undefined所以报错，表达式并不会自动转移undefined的值，将undefined转换成false，所以需要转义操作。
8. `props.element.title`改成`!!props.element.title`这样就可以了。

记录一下问卷的本地网址
`http://localhost:8887/creator?id=1865926618246156288`

9. 还是没有解决，发现props.element为undefined, props.element是通过父组件的属性赋值的。
10. 这个原因是因为父组件根本就没有定义element这个属性，我昨天改的内容在融合的时候被覆盖掉了。这提醒我要频繁的提交。
11. 上面一个问题解决，页面刷新了出来，之后，出现一个新的错误。
12. 错误信息是
```js
{
    "code": 101,
    "msg": "The parm field is required. | The converter 'Infrastructure.Converter.StringConverter' read too much or not enough. Path: $.jsondata | LineNumber: 0 |     BytePositionInLine: 40."
}
```
13. 这个错误由UpdateBusQuestionJson触发,可能是由对象参数，jsondata字段的错误类型触发的。将原来的Proxy类型转换为json对象类型，试试看是否能够解决。
14. 通过直接输入预览界面，确定我存入的jsonData有问题。
15. 我添加了一个深度比对两个json对象，并可以将defaultSettings和jsondata做比较，发现defaultQuestionSettings.showQuestionNumbers的类型是string,jsonSetting.showQuestionNumbers的类型是Boolean。前者是"off",后者是false，所以它们不一样。
16. 现在发现之所以出现12的错误，是因为jsonSetting规定是一个字符串而不是对象。我传了一个对象过去，所以报错，在我改回来之后，就没有再出现这个错误了。

17. 快捷设置表示整个问卷的设置，有两个显示编号，一页一题。
18. json编辑器中，看到，原来SurveyJS的显示编号这个设置项有三个选项，自动编号，每页重新编号，无编号。
19. 显示编号设置项对应着showQuestionNumbers属性，当选择每页重新编号的时候，其值为"onPage"，选择无编号的时候，其值为"off"，选择自动编号的时候，json编辑器中不会出现showQuestionNumbers这个属性。
20. 现在快捷设置的显示编号开关，也就是只有两个选项，没有三个选项，所以我将这两个选项对应为自动编号和无编号，对应到json对象中，就是没有showQuestionNumbers属性和其值为"off"

21. 现在刚开始只有一个html题型，这个题型是没有编号需要显示的。
22. 现在要去掉html题型的编号显示。也没有是否必填。设置完成，测试通过。

23. 在从数据库里取出来之后，为每个题目都加上自己的id，在存到数据库里之前，为每道题目去除id。为了删除设置。设置完成，测试通过

24. 现在来完成第20步，之后的设置，当显示题目序号关掉之后，json对象添加一个showQuestionNumbers属性="off",反之，去掉json对象的showQuestionNumbers属性

![showQuestionNumbers属性](image.png)可以是true或者false

从json对象中读取showQuestionNumbers和改变json对象中的showQuestionNumbers完成

25. 显示题目需要的动态效果要做出来，如果总设置中设置不显示编号，那么各个题目都统一不能设置编号，如果总设置中设置显示编号，那么各个题目才能选择显示或者不显示编号。
   showQuestionNumbers && element.hideNumber类似这样，测试通过

26. 现在我要将自动编号的效果实现一下。设置，测试完成。

27. 一页一题，这个快速设置，对应的是questionsOnPageMode。![questionsOnPageMode属性](image-1.png)，我准备选择questionPerPage和standard，如果选择关闭，则表示默认，如果选择开启，则表示一页一题。如果关闭，则默认，默认时，json对象中时没有questionsOnPageMode这个选项的。设置完成，测试通过。

28. 现在来修改单选题。

29. 主要是修改单选题属性组件的功能，测试功能，此题必答和显示序号，此题必答的功能是有效的，显示序号是无效的，以及默认文本和最多填写多少字也是无效的。
30. 现在先解决显示序号功能。
31. 现在经过我的一番修改，单选题设置组件的显示序号，出现了问题。点击显示序号的开关，无法显示效果了
32. 单选题设置组件的动态效果完成，但还要注意验证json对象中显示序号如果为true或者false，显示序号有什么变化。当基础设置-显示题目序号为true时，在text题目类型，hideNumber会接管
当基础设置-显示题目序号为false的时候
总（1）-> 分（1|0）
总（0）-> 分为空。
if(!!showQuestionNumbers){
	element.hideNumber = 
}

showNumber表示控制题目设置组件中整题设置的Boolean变量
showQuestionNumbers表示快捷设置中控制显示题目序号的Boolean变量
element表示当前选中的题目组件所对应的json对象
hideNumber表示element的一个属性，当前控制当前选中的题目的题目设置中显示序号的Boolean变量
它们的关系如下：
showNummber = showQuestionNumbers && element.hideNumber 

if（showQuestionNumbers = 0）, element没有hideNumber这个属性，可以用解构赋值将hideNumber这个属性从element中去除。属性设置中整题设置也不会出现显示序号的设置项。
if (showQuestionNumbers = 1 && element.hideNumber === undefined) , element.hideNumber = 1
if (showQuestionNumbers = 1 && element.hideNumber === 0) , element.hideNumber = 0
if (showQuestionNumbers = 1 && element.hideNumber === 1) , element.hideNumber = 1


baseQuestionSetting 有一个属性showNumberItem,作用是控制题目设置中显示序号设置项的显示，在singleText组件中也使用了这个属性，并暴露给了index组件。
if（showQuestionNumbers = 0），element.hideNumber === undefined，question-settings div中的component，将设置属性prop.showNumberItem = false
 
过程中遇到的问题
```js
const {hideNumber,...rest} = element
Object.assign(element,rest)
```
a. 上面这段代码原来是想要表示出删除element中的hideNumber属性。
b. 但是却未达到目的，因为Object.assign只能更新属性或者添加属性，但是不能删除属性，
c. Object.assign(element,rest)是将rest来更新element，但是element中还是有hideNumber这个属性的

删除属性用map和解构赋值，这样就好一些。

现在完成如果快捷设置中选择不显示题号，则所有题目都不显示题号，而且题目设置的整题设置中是不会出现显示序号的设置项的。如果快捷设置中选择显示题号，则所有题目都会显示题号，当某个题目设置，会出现显示题号的设置项，并且可以单独控制题号的显示与隐藏。并且json数据中也没有问题。

33.现在要测试单选题中的默认文本和最大长度限制。
最大长度限制，对应的json对象中的属性是'maxLength',默认文本对应的json对象的字符串是
```js
"placeholder": {
    "zh-cn": "dsfsdfsdf"
}
```
默认状态下是没有这两个属性的。最大长度初始值为0，maxLength_o = 0，则表示
测试完成，提交

34.对多选题型进行修改，multipleText。测试完成，发现单行文本和多行文本很相似，
35.单选设置组件和单选组件。
默认是没有choicesOrder的，选项随机排列，
开关开，true <=> choicesOrder="random", 双向绑定的关系，choicesOrder从element中来，如果没有，那就默认为"none"

编辑完成
测试完成，

36. 面板修改它的设置和本身。
先看面板的json对象。
```js
{
   	"type": "panel",
    "name": "面板1"
},

"questionsOrder": "random",
"innerIndent": 1
```
questionsOrder="initial" | "random" 关闭为"initial"，开启为"random"

编辑完成，测试完成

37.将数据源（json对象）中的zh-cn去掉。然后修改一切涉及zh-cn的操作。主要会涉及到读和写入有zh-cn的属性。
分两步，先将数据库已经存着的，先去掉zh-cn，然后再改代码中添加或者解析zh-cn中的代码。

感觉handleElementUpdate中的switch可以直接换成element[key] = value，也没差。

以后写的辅助方法尽量保留，已经完成。

38. 发现一个问题，![无效数组](image-2.png)，这个加入数据库的数组不知道是通过什么方式加进去的。
我准备把它删除。

39. 选图片题目。要实现这个题目不只是读取的功能，还有上传的功能。图片的数据形式和实现上传的函数这是我要找的。原来的question/index中有一个上传图片的函数，可以找来。
经观察，在原pickpictrue中，pickPictrueList数组中的对象数据的属性是url和file。file属性可以删掉。没有看到file属性有啥应用。

新的数据对象是value和imageLink，imageLink对应url

主要实现的功能是什么？

我希望uploadImage功能能够帮我构建远程的url,测试一下。

40. 出了一些问题，当我把所有题目包括间接都删掉的时候，就会有bug出现，我并没有考虑，把所有题目都删掉的情况下，系统要如何正常运行。
不过为了尽快完成选图片题型，只能先把这种情况搁置，重新建一个问卷。然后在这个问卷上开发。从这一点上看，数据源的变化是bug的一大源头。

41.在更换编辑器的过程中发现的bug
1) 如果将编辑器对应的变量设置为空字符串，那么将不能再重新输入一个新的字符串。

42. 可以通过对象的方式获取别的值
想要设置编辑器的最小宽度，在
```js
createEditor({
	selector: editorContainer,
	html: targetObject[key] || '<p></p>',
	mode: 'simple',
	config: {
		placeholder: '请输入内容...',
		readOnly: false,
		autoFocus: true,
		width: '400px',
		onChange: () => {
			const content = editor.getHtml();
			triggerUpdate(content);
		},
	},
});
```
在上面添加`width: '400px',`的方式是不管用的。

设置`editorContainer.style.minWidth = '200px';`的方式是有效的。
当输入文字的长度超出边框宽度时，这是会自动从另一行开头。

我想调节wangeditor的占位符的位置。
选图片的图片地址有问题

editorContainer.style.width = '100%';
这个100%是输入内容的宽度一致，而不是外边框的宽度一致。只能用minWidth了

minWidth要作为外部属性去设置，所以要暴露出去。

更新的时候有问题已经修改了的值不能保存。

要添加foucsout事件

在设置文字的大小改成H3或者H2时，点击编辑框会出现一些弹动的效果，这种弹动效果是必须解决的。

现在我的任务是用customEditor替换已经使用的editorBox,首先要分析一下editorbox的数据流向，然后根据customEditor的特性进行特换

我要替换的是题目组件的editorbox和BaseQuestion中的editorbox，BaseQuestion中的已经替换好了，只需要对使用BaseQuestion的题目组件，修改其中BaseQuestion的属性设置，这一步是测试修改功能较为耗时间。

题目组件中的editorbox的数据流向是@blur=>emit update => index => handleUpdate处理questionSetting中的element => watch(questionSetting) => update

现在发现的customEditor，好像只要属性设置得当，可以直接修改questionSetting中的element => watch(questionSetting) => update。这个需要测试一下。

从instruction组件来看，上述猜测是对的，只要属性设置得当，可以直接修改questionSetting中的element，不用emit update处理事件

上面的猜测被证实了。

现在还是会碰到那种弹动问题，一切是因为padding的边距问题。

在题型列表处，点击题目，editorbox的加载会慢一些。

点击sign题目打不开，questionTypeList有问题，signaturepad和sign\

现在整理一下，函数的调用顺序
getInitialSettings => loadSettingsFromDatabase => addIds => defaultQuestionSettings

addQuestion =>
updateDefalutQuestionSettings => removeIds => changePages => UpdateBusQuestionJson => defaultQuestionSettings

description并没有显示出来。现在显示出来了，然后我要做一些测试，当修改description的时候，description的值是否会发生变化，并反应在questionSettings中。
测试结果符合预期。

现在修改一下page这个组件的样式

测试添加面板这个题目会怎么样？不符合预期

添加分页
删除分页
这两个操作的结果

添加分页
在添加分页时，分情况，
1.没有选中任何问题，
当没有选中任何问题时，自动会添加一个分页块
分页块，不会显示问题名称范围，这个时候，添加分页，更像是添加一个新的空的page数组
2.选中某一问题
a. 选中的是最后一个分页的最后一个问题，那么添加一个空数组。
b. 选中的事任何一个分页的最后一个问题，也会添加一个空数组，
c. 选中的是任何一个分页的非最后一个问题，会将当前园中的page数组，分成两个数组

a和b可以归约为一种情况，

a.选中的事任何一个分页的最后一个问题，也会添加一个空数组，
b.选中的是任何一个分页的非最后一个问题，会将当前园中的page数组，分成两个数组
c.如果选中任何一个页面，选中页面的所有的题目都会成为新添加页面的题目，等价于在选中页面之前添加一个空页。

测试一下效果

删除某一页
a. 如果删除的是第一页，无论空页还不是空页都不能删除
b. 如果删除非空页，被删除页的题目组，会加入上一个页面的题目的末尾
c. 如果删除的是空页，直接删除

问题范围的显示情况
a. 如果page是空数组，那么不显示问题范围
b. 如果page是单个问题的数组。那么显示${QNumber}
c. 如果page是多个问题的数组，那么显示Qnumber1 - Qnumber2




添加页码块后，添加普通问题会怎样？
如果选中了页面之后，会出现什么？这个问题我要在问卷网做个测试
测试结果，如果选中页面块，然后添加问题，会在页面块后面进行添加，也就是说新题目组件会成为该页面的第一个问题，其他原本的问题依次后排。
这是加入页码块之后，添加普通问题时需要考虑到的变化。

bug
添加页块时，没有做回归测试，忘了给函数添加必要的参数，导致bug，下次重构的时候，提炼函数不能忘了检查函数的参数是否补上了
因为将没有pages属性只有element的源数据的处理代码删掉了，所以在又一次回归测试的时候报错。下次不能草率的删除处理源数据的代码块，要保留做回归测试。

样式效果修改
鼠标悬浮其上也要显示蓝色边框，页码和题型

强制转换，布尔强制转换，会让多个值转成另一个值。是一个多向输入，单一输出，可以把它看成是一个函数。

要想办法改一下Surveyjs默认的问卷的颜色，从绿色，变成蓝色。

样式修改
修改问卷标题和问卷描述的宽度，使宽度达到中间层面的100%
现在发现简单的完成修改是行不通的。

题目元素的宽度和问卷标题及问卷简介的宽度是不一样的。题目元素的宽度较宽，我决定要将题目元素的宽度减少到和问卷标题的宽度一致

题目元素外并没有div,在index.vue页面的template中加上class并不能在题目元素上生效

<template> 标签是一个虚拟的包装器，它不会渲染到 DOM 中
这导致 page 组件和题目组件实际上是直接渲染到 creatorContent 的父级容器中
所以它们的宽度不会受 creatorContent 的 width: 90% 限制

子元素设置width: 100% 是相对于父元素的宽度，而父元素creatorContent设置了width: 90% 和 margin: 0 20px 0 10px，margin 会在宽度之外额外添加空间

完成修改

customEditor组件的width属性，如果设置为100%,效果是编辑框中的文本宽度即是其宽度。

现在我想动态修改其宽度。这个修改往后放。

修改编辑题目和选项时的背景和边框
题目的点击时选中的边框已经有了，先不做改变，但是选项时的背景和边框还是没有的。
修改编辑选项时的背景和边框。

预期的样式效果
鼠标悬浮其上，选项周围出现虚线边框，边框包裹着选项。
点击边框时，出现悬浮框，以及整个边框范围内的背景色变成rgb(248，249，251)

一共有十几种组件，每种组件都有至少一个地方使用了customEditor，有些使用的数量还不确定，比如radiogroup组件，因为可以添加新的选项，每个选项就是一个customEditor。那么如果一个问卷包含一百道题目，那么就有两百多个customerEditor，点击其中一个，被点击的customerEditor的父div的背景色变成浅灰色，其余的customEditor的父div的背景色变成白色。

现在因为要同时可能管理几百个customEditor的点击事件，要使用pinia，所以要重新实现raidogroup中同样的样式。


bug
点击题目元素的标题需要让整个题目元素都被选中，但是现在的题目元素并不能实现这样的效果。
点击题目元素的标题需要让整个题目元素都触发显示相应的题目设置，但是现在的题目元素并不能实现这样的效果。

fix
为customEditor定义一个点击事件，点击事件的内容是，继续发送点击事件

bug
customEditor有个bug，在删除完所有的text之后，会出现占位符placeholder, 占位符placeholder是请输入内容，但是因为此时customEditor的宽度很小，所以“请输入内容”这几个字只能竖成一列显示。

fix
将placeholder设置成空字符串

bug 
点击textgroup中的填空文本框，文本框的文字直接变成空白，原因是textgroup中的customEditor的targetObject没有设置好


功能开发
我希望点击切换题型，选择另一个题目类型，比如原来是多选，现在选择单选，然后选中的多选题变成选中的单选题。
但是当点击单选时，出现了bug，我猜测的原因是在我删掉原来选中的多选题之后，currentElement变为undefined，然后触发了一系列的计算属性更新
但是计算属性更新的代码中，没有设置当currentElement为undefined时的处理方式。所以报错TypeError: cannot read the property of undefined

我的需求不仅是将多选题换成单选，还要将换后的单选题设置成选中状态。
我用了nextTick来实现这种多选题换成单选，然后要将单选题设置选中状态
nextTick会在状态更新完成后执行。
但是状态更新的过程中出现了问题，即上述的问题即currentElement为undefined这样的问题，

现在已经设置了undefined的处理代码，重新开始试验。观察试验结果。

试验结果显示，又出现了bug，原因还是currenElement = undefined

所以我的思路为，我想要currenElement直接变成newElement, 也就是上面说的单选题目对象，不会出现currentElement=undefined的情况。可以采用监听，监听currentElement，这样不行，还是监听questionSettings.pages好一点。然后修改currentElementId的值。

这样解决了问题.

功能开发
我希望在所有题目元素的标题上加上一个customEditor作为问题描述，也就是设置中的题干说明
如果题目设置中，题干说明设置为true，那么题目元素的标题下面会出现一个customEditor,其默认值为“请输入题干说明”

为了实现这个功能，我想直接将这个customEditor设置在BaseQuestion中，这样就要修改BaseQuestion原来的设计。

```js
<base-question v-model="questionTitle" :number="element.number" :show-question-number="showNumber"
		:required="element.isrRequired" :element-id="element.id" :targetObject="element" targetKey="title"
		@click="$emit('click')" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		:editorId="`title-${element.id}`">
```

查看随便一个题目元素的BaseQuestion组件，我发现一个问题。所有的属性，除了modelValue外，都是从element对象上读取的，那为什么不直接给base-question设计一个element属性，使用base-question组件的父组件只要传递element对象即可，

这样我要实现的问题描述的customEditor就可以很简单的实现我想要的功能。

bug
快捷设置-整题设置 显示题目序号设置为true，则题目设置中，应该出现显示序号的设置项，实际并没有出现，这是一个bug

bug
点击base-question组件中的删除和复制按钮，预期要触发点击该题目的事件的，实际上并没有，这也是一个bug
已经解决

功能开发
我想要做题干说明按钮的动态联动效果，效果是BaseQuestionSettting中的题干说明一变成true,那么BaseQuestion中的题干说明div就显示出来，如果题干说明一变成false，那么BaseQuestion中的题干说明就隐藏。

那么这样自然有一个问题，如果在题目元素初始加载的时候判断题干说明是显示还是隐藏？这需要对数据源中的element有一个属性p,可以控制题干说明（描述）的显示与否。

因为SurveyJS官网打不开，所以不能查看基本的API文档，这样就不能查看，所以明天再重新尝试


如果一个题目元素的json数据没有description属性，那么就不显示题干说明。同样，如果某一题目元素的题干说明显示，设置为false，那么，就要删除该元素json数据的description属性。
如果一个题目元素有description属性，那么说明某一题目元素的题干说明显示，设置为true，若description属性为空值，那么就存入空值。
同样，如果从数据库中读出来的json的description属性，值为空，则显示请输入题干说明.​

从数据库读取json，
1.若题目元素有description,则题目说明按钮设置为true, 题干说明div显示，
如果description值为空，则显示，请输入题干说明。否则显示原来的值。
2.如果题目元素没有description，则题目说明按钮设置为false，题干说明div隐藏。

从改变题干说明按钮的值，
1. 若题干说明按钮为false,则题干说明div隐藏，去掉所对应的element json中的description属性 
2. 若题干说明按钮为true,则题干说明div显示，为所对应的element json添加description属性，并定义初始值为空。


现在我要记录一下设置这个按钮的动态效果
点击选项设置按钮，题目设置中会原来对应的radiogroup的设置选项会消失，换上新的设置div，

现在我要实现选项设置按钮的点击效果
点击效果描述：在radiogroup中点击选项右侧的设置按钮，右侧radiogroupSetting跳到题目设置部分，整体设置隐藏，选项设置隐藏，单独设置显现, 点击radiogroup中除了设置按钮的其他地方，题目设置会让整题设置显示，选项设置显示，单独选项设置隐藏。如何根据现有的代码功能，实现这个功能。

模型给出的代码的功能是isOptionSetting被保留到数据源中，也就是说刷新之后，也会保留设置效果。如果前面单选的某个选项的设置点击了显示，题目设置显示单独题目设置，那么刷新之后还是会显示题目设置吗

现在细化建议的实现方式的第一条，在 radiogroup 的 choices 数组中，每个选项对象应该包含其设置数据。radiogroup的choices数组中原来默认情况下，其值为['选项1'，'选项2', '选项3']，那么现在我要每个选项对象应该包含其设置数据。设置项包括三项，showText、textType，required。三个设置项的默认值分别是false,text,true。

修改radiogroup题型的默认数据，然后保证其他功能正常运行。
我觉得这是值得的，至少少了很多判断逻辑。这写判断逻辑会让代码变得更加难以理解。

现在我修改了radiogroup的最初的对象，为每个choice添加了showText、textType，required的属性

现在radiogroup实现了我想要的功能效果，checkbox也要实现这个效果。
我发现checkbox和radiogroup有很多相似的代码，我想要将这两个组件合并成一个组件，或者提取公共代码
我又发现ranking和dropdown也和radiogroup有很多相似的代码

那么现在我有一个问题，checkbox，ranking，dropdown是否有选项选择的功能，

dropdown和ranking没有选项选择的功能。

bug

昨天单页面内的拖拽成功了，现在跨页面的多拽出现bug
触发bug的函数是index.js中的setName,这个函数的功能是为同一页面中的所有题目命名，为题目元素添加一个name属性，然后对题目进行赋值。

引发setName出bug，因为执行该函数时element是undefined。
undefined是因为跨页拖拽。页面1最后一个题目拖拽到页面2的第二个题目，从UI上看是成功的。但是从数据上看是失败的。
预期页面1的最后一题的对象会成为在页面2的第二个元素。

实际上页面1最后一题的对象，成为了页面2的最后一个元素，而不是第二个元素，而且其值为undefined

在保存入数据库之前函数执行出错，中断了操作，所以并没有存入数据库。这样调试起来不算特别麻烦只要刷新一下就可以恢复原来的界面。

onEnd的计算的参数没有问题
是跨页面的插入splice那段代码出了问题

oldIndex和newIndex有问题
预期是4,1 变成了5，2 
数组第一个索引好像是以1为起始的。

```js
const element = fromPage.elements.splice(oldIndex - 1, 1)[0]
toPage.elements.splice(newIndex - 1, 0, element)
```

跨页面拖拽成功，测试同页面拖拽

现在发现前面的尝试全部是瞎折腾
在原来的实现，就可以包括page组件，只要在组件上加上按钮和样式名，就可以实现这种做法
这个时候每一个page组件的索引是0，所以同一页的题目的索引从1开始

所以判断移动是页码组件还是题目组件，只要oldIndex=0，则这是一个页码组件，否则是一个题目组件

newIndex好像不能等于0，不是可以等于0

添加新问题算法出了问题bug

当选中一个页码，oldIndex=0， newIndex=4，frompageIndex=1, topageIndex=0
因为frompageIndex=1 

oldIndex=0则选中的为页码组

现在拖拽移动的如果是题目已经解决了，现在要解决的是拖拽的是页码组件。
要先知道拖的是那个第几页的页码组件，然后拖到第几页面去了，然后要知道，被拖的页码，拖到了第几页的第几个题目元素的位置
拖的是否是页码组件，oldIndex = 0，表明拖的是页码组件，
拖的是第几页的页码组件，fromPageIndex会计算
拖到第几页的组件，topageIndex会计算
然后拖到那个题目元素的位置，newIndex会计算

现在要考虑页码组件拖拽有两个方向，向上，fromPageIndex > toPageIndex 向下，fromPageIndex <= toPageIndex
向上，newIndex之后的元素，包括newIndex ，都要从上一页的题目元素数组中删除，然后插入被拖页的数组的开头
向下，newIndex只前的元素，包括newIndex，都要从被拖拽页删除，然后插入被拖拽页上一页的末尾

上面这两种情况，考虑的是不跨页的情况，向上，fromPageIndex - 1 = toPageIndex, 向下，fromPageIndex = toPageIndex

还要考虑一种情况，向上，向下，能否跨页。
是可以实现跨页拖拽的，只是操作过程不那么流畅丝滑，所以要考虑这种情况

下面考虑跨页的情况，向上跨页，fromPageIndex > toPageIndex + 1, 向下跨页，fromPageIndex < toPageIndex
向下跨页，fromPageIndex < toPageIndex

fromPage中所有的题目元素加入fromPageIndex - 1的题目元素数组的末尾，等价删除拖拽页码组件，而且移动到的页面会被截取，这个操作就等价于在选中拖拽页中的newIndex - 1元素，然后插入一个新的分页组件。
1.删除拖拽页码组件
2.在选中拖拽页toPage中的newIndex - 1元素，然后插入一个新的分页组件。

向上跨页，fromPageIndex > toPageIndex + 1
1.删除拖拽页码组件
2.在选中拖拽页toPage中的newIndex - 1元素，然后插入一个新的分页组件。


还要考虑的情况
向下如果是页码移动到页码，这种情况怎么办？

如果oldIndex = 0, newIndex = 0 页码组件取代页码组件
fromPageIndex=1和toPageIndex=2

可以等价两个操作
1. 删除fromPage
2. 选中toPageIndex=2,选中页码为3的页面组件，然后插入新页面。效果就是会在之前加一个空页

好像两种情况可以合并
向上，fromPageIndex - 1 = toPageIndex
向上，newIndex之后的元素，包括newIndex ，都要从上一页的题目元素数组中删除，然后插入被拖页的数组的开头
等价于
删掉 fromPageIndex
选中 toPage中的newIndex - 1 插入一个新页码组件

向下，fromPageIndex = toPageIndex
向下，newIndex只前的元素，包括newIndex，都要从被拖拽页删除，然后插入被拖拽页上一页的末尾
这是一种情况，不能完全合并
可以等价于删除fromPage
然后在toPageIndex - 1页码的（原来的toPageIndex - 1页的长度 + newIndex）这个位置的索引，插入一个新页码组件


插入页码的逻辑有问题，如果选中的是页码，那么这时插入新页码，应该有什么样的效果？已经解决

bug
现在发现一个问题，页码组件的题目列表QXX-QXX，当删除页码，或者插入页码时，不能跟着更新。
在一个新建的问卷中，首次点击添加页码组件，因为这时所有对象都没有name属性，所以页码的题目信息为undefined-undefined，要刷新一遍才能正常显示

重构情况
测试跨页拖拽元素，发现有问题。
拖拽元素并没有写入到数据库中。


# if条件判断的方法体是否要拆分（提取）函数
if这种二分判断，最好是拆分成方法。因为if的代码块，首先要明白这个代码块到底是做什么的。我不希望去关注实现细节。我只需要知道代码意图

而且if分支如果多有嵌套，就像一个典型的二叉树或者多叉树一样，那么最好将if代码块拆分独立函数，我不需要在父方法和子方法中来回跳转，才能明白代码块的意图。这是典型直流而下就可以，知道代码意图。所以在这种情况直接拆分条件判断的代码块，可以增加可读性。至少对我是这样。

# 使用AI大模型的实验
我希望能够直接用AI来帮我完善逻辑设置功能

这是我对AI的提问
点击BaseQuestion中的逻辑设置按钮，然后弹出一个对话框，对话框中的样式如图1。现在我描述一下，图片中各个部分的功能。将图片以上下两部分，逻辑设计题目所在的那行为上一部分，下面为下一部分。上部分右侧下拉框和添加逻辑设置按钮。下拉框列表中表项分为全部逻辑和每一道题目元素的标题。点击每一项，下部分都会出现对应的每一题的逻辑设置内容。如图2。现在开始描述下部分，下部分显示的内容是所选中的题目的所有的逻辑设置内容。默认添加的逻辑设置如图3。其中白色输入框全部是下拉框，现在描述各个下拉框的列表项的含义。如果右边第一个下拉框的列表项是问卷的题目元素，右边第二个下拉框是题目的状态，状态包括显示或者不显示两种，在这个文本框右边有一个蓝色按钮，点击这个按钮会在如果这一行下面出现新的一行逻辑条件，如图4.新出现的一行有三个下拉框，和两个按钮，第一个下拉框是选择逻辑连接词的，默认选择或，有或和且两个选项，第二三个下拉框的列表内容与如果右边第一二个下拉框的列表内容一致，再右边有两个按钮，一个蓝色，一个红色。点击红色按钮会删除整行的逻辑条件。蓝色按钮的功能与如果那一行的一样。则字开头的这一行，有两个下拉框，则右边第一个下拉框，默认值为跳转，可选值有跳转，显示，隐藏。第二个下拉框的下拉内容是各个题目的标题。再右边还有一个蓝色按钮，点击这个蓝色按钮在下一行会出现两个下拉框和两个按钮，如图5，第一二个下拉框的下拉内容和则字右边第一二个下拉框一致，右边的添加按钮和则字一行的蓝色按钮的功能一致，点击红色的删除按钮将删除这一行。请根据design.vue和BaseQuestion的情况来实现该功能。

结果：并不好，点击逻辑设置按钮，并不能弹出组件
现在我需要读代码了

先整理一下组件结构
design
   |--page
   |--questionComponent -|- radiogroup这样的组件
   |							   |--BaseQuestion
   |      
   |--questionSettingComponent--radiogroupSetting		                       |									|--BaseQuestionSetting

其实全部的涉及questionSetting的代码都是在design这个顶层组件中涉及的
现在我有一个组件LogicSettingDialog,我有两个选择，
1.直接把它放在design这个顶层组件
2.把它放在BaseQuestion这个底层组件中

如果我选择1，这样处理起来更简单，因为LogicSettingDialog组件涉及修改question某个组件元素的属性
如果我选择2，那我必须重构，为questionComponent暴露出一个可以操作questionSettings的属性，这样才能即使保存用户的逻辑设置内容

不过这样的结构，会造成很多的浅接口和浅方法，这样是需要重构的
先采用方法1实现这个功能再说

现在基本的LogicDialog基本的布局和开关事件已经开发完成。
现在需要确定的是弹出之后，显示什么
1.没有任何逻辑设置的时候
2.某一题有逻辑设置的时候

如果某一题有逻辑设置的时候，

待做的事

1.要来重新设置一下列表选项，
对于一个单选题有选中，未选中，显示，未显示，已答，未答

逻辑设置的动态效果，并未布置完成，对于选择题而言，要有选中和未选中，已答和未答几个选项

2.若选择选中或者是未选中，那么在右边会多一个多选下拉列表，表项是选项。

3.删除逻辑设置项，要加上一个删除弹框提示。

logicDialog的数据结构
logicRules=[{
	ifConditions:[
		{
			element://如果和或右边的第一个下拉框选择的是那个元素
		},
	...
	]
	thenConditions:[{

	},
	...
	]
},
...
]

跳转，显示，隐藏，只能作用于同一页的题目吧？可以跨页吗？
最好增加一个确定和取消的按钮，这样好控制什么时候保存数据

除了单选题之外，还有那些题型可以设置选项的逻辑？
不同的题型，选择状态有不同
单选，多选，下拉，选图片有6个选择状态，选择选中或者未选中状态，右侧会出现一个多选下拉，下拉列表为选择题的选项
其余四个状态，没有其他效果

量表，打分，评价，有4个选择状态：选中，未选中，显示，未显示。选择选中或者未选中，右边出现两个下拉框，起始分数至结束分数。只有选择了起始分数，才能选择结束分数。其余

多项填空，上传图片，文件上传，排序，矩阵选择，单项填空，多项填空（文本框）只有2个状态，显示或者未显示


量表，有6个状态可以选择，等于，小于，大于，介于，显示，未显示
选择等于，小于，大于，右边出现一个起始分数下拉框，选择介于，右边出现两个下拉框，起始分数下拉框和结束分数下拉框

逻辑条件选择的题目必须在逻辑结果题目之前

LogicSettingDialog组件里，不同的题型如果条件组，如果或者或这一行右边的第二个下拉框的右边默认是只有一个圆形添加按钮，但是如果在第二个下拉框选择了某些特定的下拉选项之后，在第二个下拉框的右边会出现新的下拉框。根据不同的题型的题目元素，以及选择的不同选项，新出现的下拉框有所不同。下列给出所有题型以及第二个下拉框的下拉选项的设置情况：

1.radiogroup，checkbox，dropdown，imagepicker这些题型的题目，第二个下拉框的下拉选项为选中，未选中，显示，未显示，已答，未答。当选择选中，或者未选中这两个选项时，那么在第二个下拉框的右边，蓝色按钮的左边，新出现一个是一个多选下拉框，这个新的下拉框的选项是对应的题目的选项。选择其他状态时，不会出现新的下拉框。

2.rating而且rateType=label的题型，第二个下拉框的下拉选项为等于，小于，大于，介于，显示，未显示。当选择等于、小于、大于，这三个选项时，那么在第二个下拉框的右边，蓝色按钮的左边，新出现一个是一个多选下拉框，这个新的下拉框的占位符是起始分数，选项是1.2.3.,4,5。对应的题目的选项。选择其他状态时，不会出现新的下拉框。当选择介于时，那么在第二个下拉框的右边，蓝色按钮的左边，新出现一个是两个多选下拉框，两个下拉框中间隔着一个至字。新出现的一个下拉框，设置和选择等于时一样，宽度80px，第二个出现的下拉列表的占位符是结束分数，其下拉选项与起始分数一样。如果不选起始分数，则结束分数下拉框处于禁选状态。当选择显示或未显示时，不会出现新的下拉框。
3.rating而且rateType不等于label的题型，第二个下拉框的下拉选项为等于，选中，未选中，显示，未显示。当选择选中或者未选中时，那么在第二个下拉框的右边，蓝色按钮的左边，新出现一个是两个多选下拉框，两个下拉框中间隔着一个至字。新出现的一个下拉框，占位符为起始分数，宽度80px，下拉选项为1,2,3,4,5,任意分数。第二个出现的下拉列表的占位符是结束分数，其下拉选项与前面新出现的第一个下拉框一样。如果不选起始分数，则结束分数下拉框处于禁选状态。选择显示或者未显示，不会出现新的下拉框 

4.multipletext，file，ranking，matrix，text，comment这些题型的题目，第二个下拉框的下拉选项显示，未显示。选择时，不会出现新的下拉框。请参考现有的LogicSettingDialog，实现上述功能。

逻辑设置对话框中的待检验开发的功能
1.数据并没有保存，不能从questionSettings中,只有点击保存按钮，才能保存，此外，无论点击取消还是右上角的关闭符号，都不会保存设置的逻辑

2.测试不同的题型，选择不同的状态，第三个选项是否正确
测试结果：当前测试结果正确

3.如果2正确请扩展到第二行-第N行
完成

4.每次切换如果后面的题目的时候，我需要将选择状态设置为空值
完成

5.选图片题型选中的选项是否能正确工作？

重构可能：或许可以把LogicSettingsDialog中重复的template做成一个组件

6.弄清楚各个逻辑设置选项对数据本身有什么对应关系

SurveyJS文档
https://surveyjs.io/form-library/documentation/design-survey/conditional-logic

问题是否可见
visibleIf:<条件表达式>
问题选项是否可见
"visibleIf": "{phone} notempty"

跳转
"triggers": [{
   "type": "skip",
   "expression": "{sameAsBilling} = 'Yes'",
   "gotoName": "additionalInfo"
}]

triggers和pages同级
官方文档给出的例子表明，可以进行跨页跳转

## 1 首先是选择类题型

如果element1,选中/未选中，choice，则跳转/显示/隐藏，element2,否则正常进入下一题

if element1.name == choice.value
   gotoName element2.name

等价于
"triggers": [{
   "type": "skip",
   "expression": "{element1.name} =/!= choice.value",
   "gotoName": "element2.name"
}]

如果条件选择状态
选中，即"{element1.name}= choice.value"
未选中，即"{element1.name} != choice.value"
已答，即"{element1.name} notempty"
未答，即"{element1.name} empty"

隐藏，即 element1.visible = false 
显示，即 element1.visible = true




则条件选择状态，在element2的对象中添加
如果element1未选中choice，则隐藏element2
如果element1选中choice，则显示element2：
"visibleIf": "{element1.name}= choice.value"

如果element1未选中choice，则显示element2
如果element1选中choice,则隐藏element2
"visibleIf": "{element1.name} != choice.value"

如果element1选中choice，则跳转到element2
"triggers": [{
   "type": "skip",
   "expression": "{element1.name} = choice.value",
   "gotoName": "element2.name"
}]

如果element1未选中choice，则跳转到element2
"triggers": [{
   "type": "skip",
   "expression": "{element1.name} != choice.value",
   "gotoName": "element2.name"
}]

如果element1已答，则显示element2
如果element1未答，则隐藏element2
"visibleIf": "{element1.name} notempty"

如果element1已答，则隐藏element2
如果element1未答，则显示element2
"visibleIf": "{element1.name} empty"

如果element1显示，则显示element2
如果element1隐藏，则隐藏element2
"visibleIf": "propertyValue(element1.name, 'visible')"

如果element1隐藏，则显示element2
如果element1显示，则隐藏element2
"visibleIf": "!propertyValue(element1.name, 'visible')"

## 2 分数题目，量表
2.1 如果element1等于，小于，大于1|2|3|4|5，则显示element2
"visibleIf": "{element1.name} =|<|> 1"

2.2 如果element1等于，小于，大于1|2|3|4|5，则隐藏element2
"visibleIf": "{element1.name} !=|>=|<= 1"

2.3 如果element1等于，小于，大于1|2|3|4|5，则跳转element2
"triggers": [{
   "type": "skip",
   "expression": "{element1.name} =|<|> 1",
   "gotoName": "element2.name"
}]

2.4 如果element1介于1至5，则显示element2
"visibleIf": "{element1.name} >= 1 and {element1.name}<= 5"

2.5 如果element1未介于1至5，则隐藏element2
"visibleIf": "{element1.name} < 1 and {element1.name}> 5"

2.6 如果element1介于1至5，则跳转element2，省略，参考2.3

2.7 如果element1显示，则显示element2
	如果element1不显示，则隐藏element2
"visibleIf": "{element1.isVisble}"

2.8 如果element1显示，则隐藏element2
	如果element1不显示，则显示element2
"visibleIf": "!{element1.isVisble}"

2.9 如果element1显示，则跳转element2
	如果element1不显示，则跳转element2
"triggers": [{
   "type": "skip",
   "expression": "{element1.isVisble}|!{element1.isVisble}",
   "gotoName": "element2.name"
}]

## 3.打分类题型
等价于2.4,2.5，2.6
多了一个未选中，就是未介于的意思

## 4.其他题型
参看2.7, 2.8, 2.9

bug
量表和其他打分题的分数是我写死的，这个不能写死
这个分数需要动态获取。

起始分数也不能比结束分数大


## 现在来考虑定义多个如果条件分句或则条件分句的情况
则条件组，
第二个则条件，只能有一个则条件分句的选择状态是跳转，0<=num<2

无论是如果条件组还是则条件组，不能存在完全一样的条件分句，

先设计，在实现特性功能，这是顺序。

如果要检查条件分句或者则分句的合理性，不能等到保存逻辑规则时执行。

保存不等于检查合理性+保存
保存只执行单纯的保存到数据库的操作

检查合理性，应该是检查第二个和第N个如果条件分句和则分句的合理性。

则分句，
a. 只能有一个则条件分句的选择状态是跳转，0<=num<2
b. 不能有两个一模一样的则分句

如果条件分句，
a.不能有两个一模一样的条件分句


bug
重构出现了bug
这是数据传输的问题
因为
getConditionStatesByType（condition.element）
condition.element等于undefined

我可以在condition.element要是第一个选择题目下拉框选择所选择的element

这是整个数据流向的问题。
我可以从LogicSettingDialog, 直接为ifCondition和thenConditon定义currentElement。
那么这样在修改currentElement时，我就要发送事件出去。

但是每一个ifCondition都会可能频繁的修改如果条件从句，这确实是真的。

最好计算如果从句选中了那个题目元素还是自己计算把


发现
一般下拉框，option的value就是它绑定的值

原来setup标签下，是不能使用export关键字的

逻辑设置中的警告信息，
如果条件组：该条件与其他条件相反，请重新设置

则条件组：逻辑条件为且，逻辑结果暂不支持选择跳转逻辑

我要如何才能获取客户选择的逻辑条件的值？
通过changeIfConditionElement方法获取选择的ElementId，然后查询获得element。
上面的倒是可以用计算属性来实现。

现在获取了element
然后将获取的element保存在对应的数组元素中

只要按蓝色的加号，就添加一项，就添加一个对应的对象。
在用户设置分句的时候，会触发每次的下拉框的change事件，change事件的处理方法中就可以对整个logicRules的如果条件组或者则条件组进行遍历查询，比较所选择的值，是否违反了某些逻辑规则。

如果违反了逻辑规则，那么在该逻辑分句之下，出现警告信息。

显示了警告信息之后，最好是不能再做任何修改。必须消除警告信息才能添加新的逻辑分句。

先尽可能的收集逻辑规则，但我的逻辑规则很可能有遗漏，那么我要考虑的就是容易添加和修改遗漏的逻辑规则

还是先进行设计，不开始实现，我优先写接口

如果报错了，如何修正逻辑，或者说修正逻辑的流程是什么？

观察
第一个，如果单选题1，选中，选项1
第二个，或，单选题2，未选中，选项1
选项重复，所以会显示错误信息：
该条件已设置，不可重复，请重新设置，
显示这个错误信息之后，
若修改第二个如果条件从句的选项，会报错，并将选项强制设置为空。报错信息是，"请修正逻辑后新增"
这时，如果设置选择其他题目元素，也会报上述同样的错误。

在同一个rule对象里，当已经出现了错误的逻辑规则时，
什么行为会报"请修正逻辑后新增"的错误？

1.当一个下拉框在选择前为空时，进行的选择。会出现上述报错
2.当选项下拉框，重新选择对象时，会出现上述报错
3.在此时点击添加如果条件按钮，会出现上述报错

在同一个rule对象里，当已经出现了错误的逻辑规则时，
什么行为不会报"请修正逻辑后新增"的错误？
1.修改已经设置过了的选中的题目元素标题，选择状态时，这会让同一个rule对象里，如果条件组中同时出现两条或者两条以上的错误信息
2.删除条件时


修正错误的方法是重新选择引发错误的两个如果条件从句，其中任何一个的选项状态，选择正确的选项状态
或者重新设置

一个隐含的条件是，同一个rule对象里，如果条件组中只会出现一条错误信息，不会同时出现两条或者两条以上的错误信息
这个条件是错的，验证表明，同一个rule对象里，如果条件组中可以同时出现两条或者两条以上的错误信息

bug
选择题的选项不能保存修改，checkbox的选项也不能保存修改

原因是targetObject对象和targetKey搞错了


### 什么情况下不能保存
比如打分或者评价题目，选择状态设置为选中或者未选中，设置了起始分数没有设置结束分数，则不能保存不能保存。

下一步要考虑则条件组和如果条件组

Bug
设置
设置第二个如果条件时，

`{ ${ifElement.name} } != '${choiceValue}'`
`{ ${ifElement.name} } = '${choiceValue}'`
`{ ${ifElement.name} } >= ${ifConditions[i].startScore} and { ${ifElement.name} } <= ${ifConditions[i].endScore}`
`{ ${ifElement.name} } < ${ifConditions[i].startScore} and { ${ifElement.name} } > ${ifConditions[i].endScore}`
`{${ifElement.name}} notempty`
`{ ${ifElement.name} } = ${ifConditions[i].startScore}`
`{ ${ifElement.name} } < ${ifConditions[i].startScore}`
`{ ${ifElement.name} } > ${ifConditions[i].startScore}`

从符号判读
'!=' 未选中
'=' 选中或者等于
">= and <=" 介于或者选中
"< and >" 未选中
"<" 小于
">" 大于
"notempty" 已答

只用indexOf()
不会有干扰的"notempty","!="
先判断>= 介于或者选中
再判断< 和 and 未选中
= 选中或者等于
<

const isExpressionContained = (char) => { 
	return expression.indexOf(char) !== -1
}

// 已答
if(isExpressionContained('notempty'))
	state = 'answered'
// 未选中且是选择题，不是打分和评价
else if (isExpressionContained('!=') ||    	
(isExpressionContained('<') and isExpressionContained('and')))
	state = 'notBeSelected'
else if (isExpressionContained(''))

测试选中单个跳转

测试多个跳转

题目的标题不能保存已经

大于等于
小于等于
大于
小于

修改操作等价于，删除旧的元素，插入新的元素

到底要修改逻辑分句，构建一个修改的队列，队列中的元素以id作为标识

将这些装入一个队列中，如果最后点击取消，那么就将队列取消。每个队列的元素是旧元素，要监听logicRules的变化，将旧的值

这个watch，logicRules只用来存储，原来有，但是现在元素属性值发生改变的情况

而history需要存储被删除和被修改的元素。

上面解决的是被修改的元素。

删除操作需要点击删除按钮，在点击确定删除的事件处理方法中，将被删除的元素保留，并存入history。这样就可以进行下一步。

这是需要删除其影响的元素。
统一删除，统一插入。

修改某一个已有规则和删除规则略有不同。
现在测试一下修改之后存入数组的旧元素
和被删除的旧元素

在存入数据库之前，要把默认的，无意义的逻辑规则元素删除。

如果删除的是一个空的默认的，无意义的逻辑规则元素，则不应该将该元素放入history中。

插入新元素，这也算是修改操作的一种，那么就元素就会是默认的，无意义的逻辑对象。这时是不需要去删除这些默认的无意义的对象的。所以在执行删除操作的时候，需要有一道过滤。过滤掉history中，是默认逻辑元素的项，因为这是插入新元素的时候添加的。直接执行插入操作就好。不用执行删除操作。

若是将一个非空的，非默认的逻辑规则，修改成空的，默认的逻辑规则。这样需要删除旧的逻辑规则，不需要插入新的而且空的逻辑规则。为了做到这点，需要在存入数据库时，将无意义的逻辑规则元素删掉。


如果是插入新元素，这也算是修改操作的一种。监听的对象，应该是logicRule还是displayLogicRule

删除是删除displayedLogicRule还是logicRule

这两个问题都应该是监听logicRule,监听logicRule的修改和删除，是为了构造history数组。而监听displayLogicRule，不能构造合适的history数组。

之所以可以监听logicRule的修改是因为watch可以返回旧元素，但是删除，删除的索引index是哪个索引。
删除方法splice(index,1)中的index是被删除元素在displayedLogicRules中的索引，不是logicRules中的索引。那么，我删除元素的语句logicRules.splice(index, 1)[0]就有问题。


这样history数组中装着的元素就都是需要摸出其对json影响的元素。然后统一进行管理就行。

是数据源有问题。questionSettings.logicRules总是空数组，所以一切都有问题。

props.questionSettings.logicRules || [] 
--> logicRules

if selectedLogic.value == all 

