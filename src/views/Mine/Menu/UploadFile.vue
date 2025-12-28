<template>
    <div class="upload-file-page min-h-screen bg-gray-50">
        <!-- 顶部导航栏 -->
        <div class="fixed top-0 left-0 right-0 bg-white z-50">
            <van-nav-bar title="上传视频" left-arrow @click-left="onClickLeft" />
        </div>

        <!-- 主体内容 -->
        <div class="pt-[46px] px-4 py-6">
            <!-- 上传区域 -->
            <upload-area @select="handleUploadFile" />

            <!-- 上传文件列表 -->
            <div class="mt-4 space-y-3" v-if="uploadFileList.length > 0">
                <div v-for="item in uploadFileList" :key="item.fileHash" class="bg-white rounded-lg p-4 shadow-sm">
                    <upload-progress-item :item="item" @cancel="cancelUpload" @stop="stopUpload" @resume="onResumeUpload" />
                </div>
                
            </div>
            
        </div>
    </div>
</template>

<script setup lang="ts">
// 核心逻辑父亲处理
import UploadArea from '@/components/Mine/Upload/UploadArea.vue';
import UploadProgressItem from '@/components/Mine/Upload/UploadProgressItem.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { UploadFile } from '@/types/file';
import { useFileUpload } from '@/hooks/useFileUpload';

const { uploadFiles , pauseUpload, resumeUpload } = useFileUpload();

const router = useRouter();

// 注意
// ref="fileInput" 被绑定在了 UploadArea 组件上，而不是原生的 input 元素上。
// const fileInput = ref<InstanceType<typeof UploadArea> | null>(null);
//t) 里已经拿到了事件对象，因此不需要再去点击 DOM 直接读取 input 元素：

const chunkSize = 1 * 1024 * 1024; // 1MB 分片大小

//const uploadFileList  只是个载体
const uploadFileList = ref<UploadFile[]>([]);  // 上传文件列表

//事件对象是子组件传递过来的
// const handleUploadFile = async (event: Event) => {
//     // 此处不实现具体逻辑，仅作为占位
//     console.log('文件选择', event);
//     const files = (event.target as HTMLInputElement).files;
//     if (!files || files.length === 0) {
//         return;
//     }
//     uploadFiles(files, uploadFileList, chunkSize);
// };

const handleUploadFile = async (files: FileList) => {
    if (!files || files.length === 0) {
        return;
    }
    uploadFiles(files, uploadFileList, chunkSize);
};

const onClickLeft = () => {
    router.back();
};


const cancelUpload = (item: UploadFile) => {
    
    // 此处不实现具体逻辑，仅作为占位
    console.log('取消上传', item);
};

// 虽然目前只有 UploadFile.vue 使用了上传逻辑，但未来如果“个人资料页”需要上传头像，或者“评论区”需要上传附件，你只需要一行代码即可复用：

const stopUpload = (item: UploadFile) => {
    console.log('--------------------------------------------------------------------')

    pauseUpload(item);
    // 此处不实现具体逻辑，仅作为占位
    console.log('暂停上传', item);
};

const onResumeUpload = (item: UploadFile) => {
    //uploadFileList可以由作用域直接拿到
        resumeUpload(item, uploadFileList);

    // 此处不实现具体逻辑，仅作为占位
    console.log('继续上传', item);
};
</script>

<style scoped>
.upload-drag {
    transition: all 0.3s ease;
}

.upload-drag:hover {
    border-color: #1989fa;
}
</style>
