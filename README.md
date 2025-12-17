# Vue 3 + TypeScript + Vite

## 加载

const oldHeight = itemPositions.value[id]?.height ?? estimateHeight.value //有什么区别 为什么后面会导致奔溃 --无限制触发onupdataed

visibleInfo.startIndex = getStartIndex(scrollTop)-1;          //高度设置的可能有问题


### 添加缓冲区
增加截取的info就可以了，偏移量还是真实的



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




