<template>
    <!-- // 单个文件进度组件 -->
    <div class="flex items-center justify-between">
        <div class="flex-1 mr-3">
            <!-- 进度条 -->
            <div class="mb-2">
                <van-progress :percentage="item.percentage" :show-pivot="true" stroke-width="8" color="#1989fa" />
            </div>

            <!-- 状态文字 -->
            <div class="text-sm text-gray-600">
                <div v-if="item.state === 0" class="h-6"></div>
                <p v-else-if="item.state === 1" class="text-blue-500">正在解析中...</p>
                <p v-else-if="item.state === 2" class="text-blue-500">正在上传中...</p>
                <p v-else-if="item.state === 3" class="text-green-500">上传完成</p>
                <p v-else-if="item.state === 4" class="text-red-500">上传失败</p>
            </div>
        </div>

        <!-- 取消按钮 -->
        <van-button v-if="![0, 1].includes(item.state)" type="danger" size="small" @click="cancelUpload(item)">
            取消
        </van-button>
    </div>
</template>

<script setup lang="ts">
import type { UploadFile } from '@/types/file';
import { toRefs } from 'vue';
const props = defineProps<{
    item: UploadFile
}>();

// 使用 toRefs 恢复 item 的响应式，这样在模板中可以直接用 item，在脚本中用 item.value
const { item } = toRefs(props);

const emit = defineEmits<{
    (e: 'cancelUpload', item: UploadFile): void;
}>();

const cancelUpload = (item: UploadFile) => {
    emit('cancelUpload', item);
};
</script>