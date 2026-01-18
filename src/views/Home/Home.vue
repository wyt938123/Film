<template>
    <div>
        <!-- 背景 -->
        <div class="top-bg absolute h-[35rem] w-full -z-10 w-screen 
      bg-[url('https://images.unsplash.com/photo-1518889735218-3e3a03fd3128?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG5hdHVyZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D')] 
      bg-cover bg-center"></div>
        <!-- 搜索+头部 -->
        <div class="search flex items-center px-5 text-sm py-4">
            <div class="title font-bold text-gray-900
              text-lg w-[6rem] text-center font-serif mr-5 bg-gray-200 rounded-full bg-opacity-50">
                影视影音
            </div>
            <!-- 搜索框 -->
            <div>
                <MySearch v-model="searchField" show-action placeholder="请输入搜索关键词" shape="round"
                    background="transparent" class="w-full">
                    <template #action>
                        <div class="text-white justify-center items-center flex">
                            <van-icon name="tv-o" size="1.25rem" />
                        </div>
                    </template>
                </MySearch>
            </div>
            <div class="w-3xs ml-4 text-white h-10">
                {{ searchField }}
            </div>

        </div>
        <!-- 主体 -->
        <main class="flex flex-col space-y-4">
            <!-- 导航栏 -->
            <header class="w-[calc(100vw-2rem)] min-h-18 rounded-2xl p-2 shadow-md self-center bg-white bg-opacity-50">
                <section class="topbar flex justify-around my-[0.5rem]">
                    <!-- 普通导航项 -->
                    <div class="topbar-item flex flex-col items-center"
                        v-for="(item, _index) in topBarState.slice(0, -1)" :key="item.title">
                        <!-- 导航项图标 -->
                        <div>
                            <van-icon class="iconfont" class-prefix="icon" :name="item.icon" size="2rem" />
                        </div>
                        <!-- 导航项标题 -->
                        <div class="topbar-item__text text-xs font-bold">
                            {{ item.title }}
                        </div>
                    </div>

                    <!-- 最后一个导航项 -->
                    <div class="topbar-item flex flex-col items-center" @click="handleClick">
                        <!-- 导航项图标 -->
                        <div>
                            <van-icon class="iconfont" class-prefix="icon"
                                :name="topBarState[topBarState.length - 1].icon" size="2rem" />
                        </div>
                        <!-- 导航项标题 -->
                        <div class="topbar-item__text text-xs font-bold">
                            {{ topBarState[topBarState.length - 1].title }}
                        </div>
                    </div>
                </section>
            </header>
            <!-- 影视推荐 -->
            <section>
                <div class="flex justify-between items-center px-6 text-sm text-white">
                    <h2 class="title font-bold text-lg">热门影视</h2>
                    <span class="flex flex-row items-center justify-center text-xs ">
                        查看更多
                        <van-icon name="arrow" size="1rem" class="ml-1" />
                    </span>
                </div>
                <PopularVideosCard :items="popularVideosState"></PopularVideosCard>
            </section>
            <!-- 影视 -->
            <section>
                <div class="flex justify-between items-center px-6 text-sm text-white">
                    <h2 class="title font-bold text-lg">海量好剧</h2>
                </div>
                <CommonVideosCardccopy :items="commonVideosState"></CommonVideosCardccopy>
            </section>
        </main>



        <!-- 底部选择器弹出层 -->
        <van-popup v-model:show="showPicker" position="bottom" round>
            <van-picker :columns="columns" @confirm="onConfirm" @cancel="showPicker = false" title="请选择" />
        </van-popup>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useHomeStore } from '@/stores/homeStore';
import PopularVideosCard from '@/components/Home/PopularVideosCard.vue';
import CommonVideosCardccopy from '@/components/Home/CommonVideosCardccopy.vue';
import MySearch from '@/components/Home/MySearch.vue';
const searchField = ref('12313')
const homeStore = useHomeStore()
const getcahnge = ref('')
const { topBarState, popularVideosState, commonVideosState } = storeToRefs(homeStore)

const showPicker = ref(false);

const columns = [
    { text: '电视剧', value: '1' },
    { text: '电影', value: '2' },
    { text: '综艺', value: '3' },
    { text: '动漫', value: '4' },
    { text: 'NBA', value: '5' },
    { text: '热门', value: '6' },
    { text: '纪录片', value: '7' }
]


const handleClick = () => {
    showPicker.value = true;
}

const onConfirm = (value: string) => {
    console.log('选中的值：', value);
    showPicker.value = false;
}


</script>

<style scoped></style>