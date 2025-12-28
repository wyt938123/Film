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
                <p v-else-if="item.state === UploadState.STOPPED" class="text-gray-500">上传已取消</p>
                <div v-else class="h-4"></div>
            </div>
        </div>
        <!-- 调试代码：放在按钮旁边 -->
        <div class="text-xs text-red-500">
            Debug: Cancel={{ canCancel }}, Stop={{ stopUpload }}
        </div>
        <!-- 取消按钮 -->
        <van-button v-if="canCancel" type="danger" size="small" plain round @click="onCancel">
            取消
        </van-button>
        <van-button v-if="stopUpload" type="default" size="small" plain round @click="onStop">
            暂停
        </van-button>
        <van-button v-if="resumeUpload" type="default" size="small" plain round @click="onResume">
            继续
        </van-button>
        {{ stopUploadtrest }}
        {{  }}
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { UploadState, type UploadFile } from '@/types/file';

const props = defineProps<{
    item: UploadFile
}>();

console.log('UploadProgressItem props.item:', props.item);

const emit = defineEmits<{
    (e: 'cancel', item: UploadFile): void;
    (e: 'stop', item: UploadFile): void;
    (e: 'resume', item: UploadFile): void;
}>();

const canCancel = ref(false);
const stopUpload = ref(false);
const resumeUpload = ref(false);



//响应式数据有问题
// const canCancel = computed(() => {
//     return [UploadState.UPLOADING, UploadState.FAILURE].includes(props.item.state);
// });
// //如果处于上传中才显示暂停按钮
const stopUploadtrest = computed(() => {
    console.log('状态调试:', props.item.state, typeof props.item.state, UploadState.UPLOADING, typeof UploadState.UPLOADING);
    //"1" === 1 是 false，这会导致 v-if 判断失败，按钮无法渲染
    return (props.item.state == UploadState.UPLOADING);
});



watch(() => props.item, (newVal) => {
    console.log(`[Item Update] State: ${newVal.state}, Progress: ${newVal.percentage}%`);
}, { deep: true });


//监听 props.item 的变化.但是不应该监听item整体变化，而是监听 item.state 的变化，不然会触发·非常多

watch(() => props.item.state, (newVal) => {
    //所以打印后可以证明，传入的确实是响应式对象props.item
    // console.log('UploadProgressItem item changed:', props.item);
    console.log('[watchPropsItem]状态变化:', newVal);
    canCancel.value = [UploadState.UPLOADING, UploadState.FAILURE].includes(newVal);
    stopUpload.value = (newVal === UploadState.UPLOADING);
    resumeUpload.value = (newVal === UploadState.STOPPED);
    // console.log('状态更新:', canCancel.value, stopUpload.value, resumeUpload.value);
}, { immediate: true, deep: true });

const onCancel = () => {
    emit('cancel', props.item);
};
const onStop = () => {
    emit('stop', props.item);
};
const onResume = () => {
    emit('resume', props.item);
};
</script>