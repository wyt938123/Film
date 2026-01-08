<template>
    <div class="video">
        <div class="fixed top-0 left-0 w-full h-[35rem] -z-10 transform -translate-y-0 bg-cover bg-center overflow-hidden"
            style="background-image: url('https://images.unsplash.com/photo-1518889735218-3e3a03fd3128?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG5hdHVyZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D');">
        </div>
        <div
            class="mine-header fixed top-0 left-0 right-0 h-10 bg-black flex items-center justify-between shadow-sm z-50 opacity-90">
            <div class="flex items-center ml-2.5 text-white">
                {{ currentDate }}
            </div>
            <div class="flex items-center justify-between w-[150px] mr-2.5">
                <van-icon name="tv-o" size="25" class="text-white" />
                <van-icon name="search" size="25" class="text-white" />
                <van-icon name="filter-o" size="25" class="text-white" />
            </div>
        </div>
        <div class="show-image flex flex-col items-center mt-6 px-4">
            <img src="//tv.puui.qpic.cn/tv/0/mz_tv_image_frontend_442f1e-8_1612066528_1744802167872647/450?max_age=7776001"
                alt="视频封面" class="w-[280px] h-[330px] object-cover rounded-lg shadow-lg" />
            <div class="w-[280px] mt-2 px-3 py-2 bg-black bg-opacity-50 rounded-lg">
                <span class="text-white text-sm text-left whitespace-nowrap overflow-hidden text-ellipsis block">
                    我的后半生·爽看全集 - 腾讯视频
                </span>
            </div>
        </div>
        <van-divider />
        <div class="top-bar flex items-center justify-around w-full ">
            <div class="flex items-center bg-gray-800 rounded opacity-80 "
            v-for="(item, _index) in topBarState"
            :key="item.title"
            >
                <van-icon class="iconfont text-white" class-prefix="icon" :name="item.icon" size="1rem" />
                <span class="ml-2 text-white text-sm">{{ item.title }}</span>
            </div>
        </div>
        <van-tabs v-model:active="active" background="black" class="opacity-80 bg-black" >
            <van-tab v-for="items in recommendItemState" :title="items.title"
            class="bg-black"
            >
                <van-card
                class="rounded-lg "
                v-for="(item, _index) in items.items"
                :key="item.title"
                :desc="item.discuss"
                :title="item.title"
                :thumb="item.img"
                :price="item.score"
                currency=""
                >
                <template #tags>
                    <van-tag plain type="primary">{{ item.msg }}</van-tag>
                </template>
                <template #footer>
                    <div class="flex items-center justify-end " >
                        <van-icon class="iconfont text-[1.5rem]" color="#000000" class-prefix="icon" :size="20"
                          name="jiazhui-24-bofangqi" />
                        <van-button size="mini">追</van-button>
                    </div>
                </template>
                </van-card>

            </van-tab>
        </van-tabs>
        <div class=" ">

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRefs } from 'vue';
import {useVideoStore} from '@/stores/videoStore';

const active = ref(0);
const videoStore = useVideoStore();

const { topBarState, recommendItemState } = toRefs(videoStore);

const currentDate = ref('');

onMounted(() => {
    //来获取当前日期
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 格式化日期为 YYYY-MM-DD 格式
    currentDate.value = `${month}-${day}`;
});
</script>

<style scoped>
:v-deep .van-card {
  background-color: gray !important; /* 调整透明度为30% */
  color: black !important; /* 主文字颜色改为深灰 */
}

/* 处理卡片内部所有文字元素 */
:v-deep .van-card__title,
:v-deep .van-card__desc,
:v-deep .van-card__price,
:v-deep .van-card__num {
  color: black !important; /* 深黑色 */
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3); /* 可选文字阴影增强可读性 */
}
</style>