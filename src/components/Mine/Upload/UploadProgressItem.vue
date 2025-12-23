<template>
    <!-- // 单个文件进度组件 -->
    <div class="flex items-center justify-between">
        <div class="flex-1 mr-3">
            <!-- 文件名 -->
            <div class="text-sm font-medium text-gray-700 mb-1 truncate w-48">
                {{ item.fileName }}
            </div>
            <!-- 进度条 -->
            <div class="mb-2">
                <van-progress :percentage="item.percentage" :show-pivot="true" stroke-width="8" color="#1989fa" />
            </div>

            <!-- 状态文字 -->
            <div class="text-xs">
                <p v-if="item.state === UploadState.PARSING" class="text-blue-500">正在解析中...</p>
                <p v-else-if="item.state === UploadState.UPLOADING" class="text-blue-500">正在上传中...</p>
                <p v-else-if="item.state === UploadState.SUCCESS" class="text-green-500">上传完成</p>
                <p v-else-if="item.state === UploadState.FAILURE" class="text-red-500">上传失败</p>
                <div v-else class="h-4"></div>
            </div>
        </div>

        <!-- 取消按钮 -->
        <van-button v-if="canCancel" type="danger" size="small" plain round @click="onCancel">
            取消
        </van-button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UploadState, type UploadFile } from '@/types/file';

const props = defineProps<{
    item: UploadFile
}>();

const emit = defineEmits<{
    (e: 'cancel', item: UploadFile): void;
}>();

const canCancel = computed(() => {
    return [UploadState.UPLOADING, UploadState.FAILURE].includes(props.item.state);
});

const onCancel = () => {
    emit('cancel', props.item);
};
</script>