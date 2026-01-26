---
trigger: always_on
---
# 项目背景
这是一个影视平台项目，前端使用 Vue 3 + TypeScript + Vant + TailwindCSS，
基于 Vite 6.0 构建。支持视频浏览、分片文件上传、虚拟列表等功能。

# 编码标准
- 所有代码必须使用 TypeScript，关键数据必须添加类型约束。
- 变量和函数使用 camelCase：`searchField`、`handleClick`。
- 组件文件和类型定义使用 PascalCase：`MySearch.vue`、`VideoItem`。
- 常量使用 UPPER_SNAKE_CASE：`API_BASE_URL`、`MAX_FILE_SIZE`。
- Store 函数使用 `use` 前缀：`useHomeStore`、`useVideoStore`。
- 布尔值变量使用 `is/has/should` 前缀：`isLoading`、`hasMore`。

# 技术栈约束
- 必须使用 Vue 3 Composition API（`<script setup lang="ts">`）。
- 状态管理使用 Pinia（Composition API 风格）。
- UI 组件使用 Vant 4，自动按需引入。
- 样式使用 TailwindCSS，组件内部样式使用 `<style scoped>`。
- 类型导入必须使用 `import type { ... }`。
- 路径别名使用 `@` 指向 `src` 目录，不使用相对路径。

# 组件开发规范

## 组件结构顺序
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入语句（Vue核心 → UI库 → 工具库 → 本地类型 → 本地组件）
// 2. Props 定义（必须指定类型和默认值）
// 3. Emits 定义（使用 TypeScript 类型约束）
// 4. 响应式状态（ref/reactive，必须添加泛型）
// 5. 计算属性（computed）
// 6. 方法定义
// 7. 生命周期钩子
// 8. Watch 监听
</script>

<style scoped>
/* 样式内容 */
</style>
```

## Props 和 Emits
```typescript
// Props 必须指定类型
const props = defineProps({
  modelValue: { type: String, required: true },
  title: { type: String, default: '' },
  userData: { type: Object as () => UserInfo, required: true }
})

// Emits 使用 TypeScript 类型约束
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [data: FormData]
}>()
```

## v-model 实现
使用计算属性实现双向绑定：
```typescript
const modelValue = computed({
  get() { return props.modelValue },
  set(value) { emit('update:modelValue', value) }
})
```

# Store 开发规范

## Store 结构
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VideoItem } from '@/types/video'

export const useVideoStore = defineStore('video', () => {
  // ========== 状态定义 ==========
  const videos = ref<VideoItem[]>([])
  const isLoading = ref<boolean>(false)
  
  // ========== 计算属性 ==========
  const totalCount = computed(() => videos.value.length)
  
  // ========== 方法定义 ==========
  const fetchVideos = async () => {
    isLoading.value = true
    try {
      // 实现逻辑
    } finally {
      isLoading.value = false
    }
  }
  
  // ========== 返回导出 ==========
  return { videos, isLoading, totalCount, fetchVideos }
})
```

# TypeScript 规范
- 所有 ref 状态必须添加泛型：`ref<VideoItem[]>([])`、`ref<boolean>(false)`。
- 避免使用 `any`，使用具体类型或 `unknown`。
- 对象类型使用 `interface`，联合类型使用 `type`。
- 推荐使用 `const enum` 提升性能。
- 函数必须标注参数和返回值类型。

# 文件结构
```
src/
├── api/              # API 接口封装
├── components/       # 业务组件（按模块分目录：Home/、Mine/、VideoDetail/）
├── directives/       # 自定义指令
├── hooks/            # 组合式函数（Composables）
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义（按模块分文件）
├── utils/            # 工具函数
├── views/            # 页面组件（对应路由）
├── workers/          # Web Worker
└── main.ts
```

# 特殊功能实现

## 文件上传
- 使用分片上传方案，基于 spark-md5 计算文件哈希。
- 大文件处理必须使用 Web Worker，避免阻塞主线程。
- 相关文件：`hooks/useFileUpload.ts`、`workers/hash.worker.ts`。

## 虚拟列表 / 瀑布流
- **禁止使用 `onUpdated` 钩子**，可能导致页面崩溃。
- 使用 Intersection Observer API 实现懒加载和虚拟滚动。
- 相关文件：`hooks/useIntersectionObserver.ts`、`directives/lazy.ts`。

# 文档规范
- 导出的 API 方法必须写 JSDoc 注释。
- 复杂逻辑的 Hooks 必须写注释，说明参数和返回值。
- 每个页面组件文件顶部必须有模块说明注释。

# 安全规范
- 不要把明文 API Key、token 写在代码里。
- 所有配置从 `.env` 里读取，通过 `import.meta.env.VITE_*` 使用。

# 参考文档

## 官方文档
- **Vue 3 官方文档**: https://cn.vuejs.org/guide/introduction.html
- **TypeScript 官方文档**: https://www.typescriptlang.org/docs/
- **Pinia 官方文档**: https://pinia.vuejs.org/zh/
- **Vant 4 组件库**: https://vant-ui.github.io/vant/#/zh-CN
- **Vite 官方文档**: https://cn.vitejs.dev/guide/
- **TailwindCSS 文档**: https://tailwindcss.com/docs

## 技术指南
- **Vue 3 Composition API 最佳实践**: https://vuejs.org/guide/extras/composition-api-faq.html
- **TypeScript 与 Vue 配合使用**: https://cn.vuejs.org/guide/typescript/overview.html
- **Web Worker MDN 文档**: https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API
- **Intersection Observer API**: https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API

## 项目内部文档
- 详细示例代码请参考：`.qoder/examples/` 目录
- 组件示例：`.qoder/examples/component-example.vue`
- Store 示例：`.qoder/examples/store-example.ts`
- 工具函数示例：`.qoder/examples/utils-example.ts`
