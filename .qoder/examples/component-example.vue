<template>
  <div class="user-card">
    <!-- 标题显示 -->
    <h3 class="card-title">{{ title }}</h3>
    
    <!-- 用户信息 -->
    <div class="user-info">
      <span class="user-name">{{ userName }}</span>
      <span class="user-status" :class="statusClass">{{ statusText }}</span>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="handleEdit">编辑</button>
      <button @click="handleDelete" :disabled="isDeleting">删除</button>
    </div>
    
    <!-- 插槽：自定义内容区域 -->
    <slot name="content" :user-data="userData"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserInfo } from '@/types/user'

// Props 定义
const props = defineProps({
  // 用户数据
  userData: {
    type: Object as () => UserInfo,
    required: true
  },
  // 卡片标题
  title: {
    type: String,
    default: '用户信息'
  }
})

// Emits 定义
const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

// 状态定义
const isDeleting = ref(false)

// 计算属性：用户名称
const userName = computed(() => {
  return props.userData.name || '未命名用户'
})

// 计算属性：状态文本
const statusText = computed(() => {
  return props.userData.isActive ? '在线' : '离线'
})

// 计算属性：状态样式类
const statusClass = computed(() => {
  return {
    'status-online': props.userData.isActive,
    'status-offline': !props.userData.isActive
  }
})

// 方法：处理编辑操作
const handleEdit = () => {
  emit('edit', props.userData.id)
}

// 方法：处理删除操作
const handleDelete = async () => {
  if (isDeleting.value) return
  
  isDeleting.value = true
  try {
    // 模拟删除操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('delete', props.userData.id)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.user-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.user-info {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-name {
  font-weight: 500;
}

.user-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-online {
  background-color: #4caf50;
  color: white;
}

.status-offline {
  background-color: #9e9e9e;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
