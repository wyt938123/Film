<template>
    <div class="upload-page min-h-screen bg-gray-50">
        <!-- 顶部导航栏 -->
        <div class="fixed top-0 left-0 right-0 bg-white z-50">
            <van-nav-bar
                title="开启你的创作之旅"
                left-arrow
                @click-left="onClickLeft"
            />
        </div>

        <!-- 主体内容 -->
        <div class="pt-[46px] pb-4">
            <!-- 上传视频卡片 -->
            <div class="bg-white mx-4 mt-4 rounded-lg p-4 flex items-center justify-between shadow-sm cursor-pointer" @click="goToUploadFile">
                <div class="flex items-center">
                    <div class="w-10 h-10 flex items-center justify-center">
                        <van-icon name="upgrade" size="24" color="#ff6b6b" />
                    </div>
                    <span class="ml-3 text-base">上传视频</span>
                </div>
                <van-icon name="arrow" color="#c8c9cc" />
            </div>

            <!-- 开直播卡片 -->
            <div class="bg-white mx-4 mt-4 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div class="flex items-center">
                    <div class="w-10 h-10 flex items-center justify-center">
                        <van-icon name="video-o" size="24" color="#ff6b6b" />
                    </div>
                    <span class="ml-3 text-base">开直播</span>
                </div>
                <van-icon name="arrow" color="#c8c9cc" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const onClickLeft = () => {
    router.back();
};

const goToUploadFile = () => {
    router.push('/upload-file');
};
</script>

<style scoped>
</style>