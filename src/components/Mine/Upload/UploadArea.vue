<template>
    <!-- // 上传点击区域组件 -->
    <div class="upload-drag bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
        @click="handleClick">

        <input type="file" ref="fileInput" @change="handleUploadFile" accept="" multiple="false"
            style="display: none" />

        <div class="flex flex-col items-center justify-center">
            <van-icon name="upgrade" size="50" color="#c0c4cc" />
            <p class="mt-4 text-gray-500">点击选择视频文件</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const fileInput = ref<HTMLInputElement | null>(null);
// 定义 emits
const emit = defineEmits<{
  // 点击区域触发，无参数
  (e: 'handleClick'): void;
  // 文件选择触发，传递原始 Event 对象
  (e: 'handleUploadFile', event: Event): void;
}>();

const handleClick = () => {
    emit('handleClick');
};

const handleUploadFile = (event: Event) => {
    emit('handleUploadFile', event);
};

// 【关键】暴露给父组件的方法  --- 否则父组件不好拿子组件的dom
const triggerClick = () => {
  fileInput.value?.click();
};

defineExpose({
  triggerClick
});
</script>