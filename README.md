# Vue 3 + TypeScript + Vite

## 加载

const oldHeight = itemPositions.value[id]?.height ?? estimateHeight.value //有什么区别 为什么后面会导致奔溃 --无限制触发onupdataed

visibleInfo.startIndex = getStartIndex(scrollTop)-1;          //高度设置的可能有问题


### 添加缓冲区
增加截取的info就可以了，偏移量还是真实的


### 滚动方案修改
方案一：让组件成为唯一的滚动容器（禁用页面滚动）
方案二：组件内部滚动但隐藏滚动条（仍可滚）
方案三：用页面滚动，不让组件自己滚   -- 优



## 文件上传

### 不使用webworker的版本
前端 1.选择好文件后点击打开触发change事件-->andleUploadFile处理文件上传
2.
初始化上传文件，计算哈希和分片 getHashAndChunk
配置好所有切片的信息，
3.进行文件上传 uploadSignleFile

#### getHashAndChunk

FileReader
sparkMD5

工具	定位	核心作用
FileReader	浏览器原生 API	读取 File/Blob 二进制数据（转为 ArrayBuffer/Base64 等），供哈希计算使用
sparkMD5	轻量第三方库	高效计算二进制数据的 MD5 哈希值（文件唯一标识），支持分片增量计算


file.slice(start, end) 是直接分割文件的合法操作，原因：
File 是 Blob 的子类（继承关系：File → Blob → Object）；
Blob.prototype.slice() 是浏览器原生方法，专门用于截取二进制数据的「片段」，返回一个新的 Blob（File 切片后返回的也是 Blob 类型，本质仍是原文件的二进制片段）。


readAsArrayBuffer(blob)	异步读取二进制数据（哈希计算首选）







#####  input事件
浏览器的文件选择对话框是模态的，只有在用户在对话框里确认（点击“打开/确定”）后，input 的 value 才会更新，change 事件才会触发。
如果用户选择的文件和上次相同，value 没变也不会触发 change。
建议两点改进（简短）：

打开对话框前清空 input.value，保证重复选择同一文件也会触发 change。
移除模板中错误的 multiple="false"（multiple 是布尔属性，写 "false" 会被视为存在）。




## 抽离组件
https://juejin.cn/post/7536467524998103092?searchId=2025122211140410A56CDD0EAAB7770F06
业务组件去业务化，你表达的内容和标题完全相反。你这是把业务聚合在了组件内。真正的去业务化是在组件外处理业务逻辑，组件只保留渲染逻辑。这样做的好处是不同页面复用该组件时，其业务逻辑归属到具体的页面组件中，业务逻辑简单明了。如果你把业务聚合到业务组件中就要确保后面的业务逻辑不会再成倍膨胀并且被复用到很多个页面中，如果你这样做了，恭喜你你会得到一个很复杂的业务组件。缺点是难维护和组件代码冗余度高

实现初步的文件上传组件抽离