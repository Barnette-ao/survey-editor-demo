我之前用Intersection Observer实现懒加载

## 问题：IntersectionObservers的实现与CRUD操作冲突，以至于CRUD操作之后，无法实现视图同步

### 分析原因：视图绑定的数据是renderItems

分析renderItems的数据流

```js
onMounted<--执行时机---视图renderItem<--赋值--- Composable<---返回---renderItems:Ref <--init()---allItems:computedRef <---questionSettings
```

onMounted只会在初始化组件的时候执行一次，
而且我并没有用watch监听allItems，所以不能更新renderItems

### 方案一：
watch allItems + updateRenderItem函数（负责更新renderItems）

现在要分析questionSettings在CRUD操作后的变化，以及对应的renderItems的变化

**重要前提：用户只能操作视口处的题目元素**
```js
| questionSettings | renderItems |
C 创建：[复制， 选中某题添加题目/页块， 不选中某题添加题目/页块]
U 更新（修改）：[增加/删除某题的选项，修改标题内容，修改选项内容]
D 删除 (删除)：[删除题目/分页块]
```
将其做成一个合适的适配器renderedItem = adapter(questionSettingsItem),循环

#### C-1: 复制某一题, 
设该题的索引为index, questionSettings[index+1] = 复制元素，
renderItens[index+1]= adapter(复制元素)
等价于
renderItens.splice(index + 1, 0, adapter(复制元素))

数据层面对了，视图层如何解决显示的问题，浏览器会自动进行滚动锚定。

#### C-2: 选中某题添加题目
设该题的索引为index, questionSettings[index+1] = 模版新元素，
renderItens[index+1]= adapter(模版新元素)
等价于
renderItens.splice(index + 1, 0, adapter(模版新元素))
数据层面对了

#### C-3: 不选中某题添加题目，在数组最后添加新元素
questionSettings[length] = 模版新元素，

当hasMore为true,那么就只要修改questionSettings,这个已经完成了
`hasMore = renderItems.length < questionSettings.length`

如果hasMore为false，表示，所有的都加载了，那么就需要将新添加的加载入renderitems
renderItens[length]= adapter(模版新元素)
等价于
renderItens.push(adapter(模版新元素))
数据层面对了

#### C-4：选中题目添加页块，
假设questionSettings可以正确的完成添加页块的数据层面的操作。
现在问题就是正确的同步renderItems
questionSettings变化后--> allItems扁平化数组全部重新计算。

设选中的是pageIndex中的elementIndex元素，假设在renderItems中的索引是renderIndex
预期在该元素后面会加上一个页面块
allItems对应的这个对象之后，会加入一个page类型的对象，后面的全部更新

假设renderIndex+1...length-1全部复制，包括新加入的页面标签

#### C-5：不选中题目添加页块

#### C-6: 增加删除某题的选项

#### U
更新单个对象的诸多操作，因为扁平化数组保留questionSettings的响应式，且slice不会破坏引用，slice，map遍历赋值不会破坏对象属性的响应式

但是refValue1.value = refValue2.value这样的方式，会破坏响应式，
refValue2.value这个只是快照，而不是引用地址。所以当refValue2的值改变的时候，
refValue1不会响应式更新

computed可以解决这个问题，

### D-1:删除题目
删除之后不会补位
questionSettings已经完成了删除
我要知道那个index删除了，同步更新到renderItem就可以了


##### 简化扁平化数组的结构
可以之后的一个优化，简化扁平化数组的数据结构，去除多余的page,之所以现在保留page是因为design组件的page中绑定的属性和事件处理函数
```js
getQuestionNameOf(item.page)
deletePage(questionSettings, item.page, item.pageIndex)
```
上述都需要用到item.page，所以renderItems的page类型的对象元素中才会有page这个属性
如果可以重构这两个，计算属性和函数，只要它接受pageIndex就行，那么就可以简化扁平化
数组的结构











## 方案一实现：Watch allItems + 粗暴替换

### 实现思路
监听 `allItems` 的变化，当检测到变化时，重新计算 `renderedItems`，保持当前已渲染的数量不变。

### 代码实现

```js
// 在 useIncrementalLoading composable 中添加
import { watch } from 'vue'

// 监听 allItems 变化，同步更新 renderedItems
watch(
  allItems,
  (newAllItems) => {
    // 获取当前已渲染的数量
    const currentRenderedCount = renderedItems.value.length
    
    // 重新计算 renderedItems，保持相同的渲染数量
    const newRenderedCount = Math.min(currentRenderedCount, newAllItems.length)
    renderedItems.value = newAllItems.slice(0, newRenderedCount)
    
    console.log(`allItems 变化检测: 总数 ${newAllItems.length}, 渲染数 ${newRenderedCount}`)
  },
  { 
    deep: true,  // 深度监听
    flush: 'sync'  // 同步执行，确保数据一致性
  }
)
```

### 优化版本（带防抖）

```js
import { watch, debounce } from 'vue'

// 防抖版本，避免频繁更新
const debouncedUpdate = debounce((newAllItems) => {
  const currentRenderedCount = renderedItems.value.length
  const newRenderedCount = Math.min(currentRenderedCount, newAllItems.length)
  renderedItems.value = newAllItems.slice(0, newRenderedCount)
}, 50)

watch(
  allItems,
  debouncedUpdate,
  { deep: true }
)
```

### 处理边界情况

```js
watch(
  allItems,
  (newAllItems, oldAllItems) => {
    const currentRenderedCount = renderedItems.value.length
    
    // 如果 allItems 为空或未初始化，清空 renderedItems
    if (!newAllItems || newAllItems.length === 0) {
      renderedItems.value = []
      return
    }
    
    // 计算新的渲染数量
    let newRenderedCount = Math.min(currentRenderedCount, newAllItems.length)
    
    // 如果是删除操作导致的变化，可能需要调整渲染数量
    if (oldAllItems && newAllItems.length < oldAllItems.length) {
      // 删除操作：保持当前渲染数量，但不超过新的总数
      newRenderedCount = Math.min(currentRenderedCount, newAllItems.length)
    } else if (oldAllItems && newAllItems.length > oldAllItems.length) {
      // 添加操作：如果之前已经全部加载，需要包含新添加的项
      if (currentRenderedCount === oldAllItems.length) {
        newRenderedCount = newAllItems.length
      }
    }
    
    // 更新 renderedItems
    renderedItems.value = newAllItems.slice(0, newRenderedCount)
    
    // 重新初始化 Observer（如果需要）
    if (observer.value && sentinelRef.value) {
      observer.value.disconnect()
      nextTick(() => {
        if (hasMore.value) {
          initObserver()
        }
      })
    }
  },
  { deep: true }
)
```

### 使用说明

1. 将上述 watch 代码添加到 `useIncrementalLoading` composable 的返回语句之前
2. 确保在 `init()` 方法调用之后，watch 才开始生效
3. 这个方案会在每次 `questionSettings` 变化时重新计算 `renderedItems`
4. 保持了增量加载的基本逻辑，同时解决了 CRUD 操作的同步问题

### 预期效果

- **C操作（创建）**：新项目会自动出现在正确位置
- **U操作（更新）**：由于保持了对象引用，会自动响应
- **D操作（删除）**：被删除的项目会从 `renderedItems` 中移除
- **滚动加载**：仍然正常工作，不影响原有的懒加载逻辑