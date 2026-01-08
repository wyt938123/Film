<template>
    <!-- // 上传点击区域组件 -->
    <div class="upload-drag bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
        @click="triggerClick">

        <input type="file" ref="fileInput" @change="handleFileChange" :accept="accept" :multiple="multiple"
            style="display: none" />

        <div class="flex flex-col items-center justify-center ">
            <van-icon name="upgrade" size="50" color="#c0c4cc" />
            <p class="mt-4 text-gray-500">{{ title }}</p>
        </div>
        <div class="">

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// 负责模板，部分逻辑
// 拿到了触发了事件，拿到了事件对象，也是要将事件对象传递出去
//逻辑交给父组件处理

interface Props {
    accept?: string;
    multiple?: boolean;
    title?: string;
}
// 设置默认值
const props = withDefaults(defineProps<Props>(), {
    accept: "",
    multiple: true,
    title: '点击选择视频文件'
});

const fileInput = ref<HTMLInputElement | null>(null);

// 定义 emits
const emit = defineEmits<{
    // 文件选择触发，传递 FileList 或 File[]
    (e: 'select', files: FileList): void;
}>();

const handleFileChange = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        emit('select', files);
    }
    // 清空 input，允许重复选择同一个文件
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// 暴露给父组件的方法，也可以内部直接使用
//这个方法触发后，会触发 input 的点击事件-然后才可以进入上传，使用input按钮隐藏也没事
const triggerClick = () => {
    fileInput.value?.click();
};

defineExpose({
    triggerClick
});
</script>