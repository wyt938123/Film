<template>
    <div class="mine h-100rem">
        <!-- 头部导航 -->
        <!-- height: 100rem 设置父元素的高度为 100rem（默认情况下为 1600px）。
        height: 10rem 设置子元素的高度为 10rem（默认情况下为 160px）。
        子元素的高度是父元素高度的 10%。 -->
        <div
            class="mine-header fixed top-0 left-0 right-0 h-10 bg-white flex items-center justify-between shadow-sm z-50 opacity-90">
            <div class="flex items-center ml-2.5">
                <van-icon name="exchange" size="25" />
            </div>
            <div class="flex items-center justify-between w-[150px] mr-2.5">
                <van-icon name="friends-o" size="25" />
                <van-icon name="scan" size="25" />
                <van-icon name="coupon-o" size="25" />
                <van-icon name="setting-o" size="25" />
            </div>
        </div>

        <!-- 背景图片区域 -->
        <div class="minePage container h-[8rem] relative shadow-md
            bg-[url('https://images.unsplash.com/photo-1518889735218-3e3a03fd3128?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG5hdHVyZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D')] 
            bg-cover bg-center">
            <!-- 头像 -->
            <img src="https://img0.baidu.com/it/u=1547643615,3476109594&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400"
                alt=""
                class="rounded-full w-20 h-20 mx-auto border-2 border-white shadow-md shadow-gray-400 absolute bottom-0 left-5 transform translate-y-[3rem]" />
        </div>

        <!-- 页面主体 -->
        <main class="mine-main mt-2.5">
            <!-- 菜单栏 -->
            <section class="rounded-xl mt-[1rem] pb-[0.5rem] shadow-md bg-gray-90 mx-2 border">
                <div class="topbar flex justify-around mt-[1.5rem]">
                    <div class="topbar-item flex flex-col items-center cursor-pointer"
                        v-for="item in barItems.slice(0, 5)" :key="item.name" @click="handleItemClick(item)">
                        <div class="topbar-item__icon">
                            <van-icon class="iconfont text-[1.5rem]" color="#000000" class-prefix="icon" :size="20"
                                :name="item.icon" />
                        </div>
                        <div class="text-[0.8rem] text-gray-500">{{ item.name }}</div>
                    </div>
                </div>
            </section>

            <!-- 观看历史 -->
            <section
                class="rounded-xl py-2 pl-4 pt-4 shadow-md bg-gray-90 mx-2 mt-3 border relative flex items-center justify-between">
                <div class="font-bold flex items-center">
                    <van-icon class="iconfont text-[1rem] mr-2" color="black" class-prefix="icon" name="guankanlishi"
                        size="25" />
                    <div class="text-[0.8rem] text-gray-500">观看历史</div>
                </div>
                <div>
                    <van-icon name="arrow" class="text-gray-400" />
                </div>
            </section>

            <!-- 功能列表 -->
            <div class="function-box rounded-xl py-2 pl-4 pt-4 shadow-md bg-gray-90 mx-2 mt-3 border relative">
                <section v-for="item in barItems.slice(5, 10)" :key="item.name"
                    class="flex items-center justify-between h-16 border-b border-gray-100 last:border-b-0 pr-4">
                    <div class="font-bold flex items-center">
                        <van-icon class="iconfont text-[1rem] mr-2" color="black" class-prefix="icon" :name="item.icon"
                            size="25" />
                        <div class="text-[0.8rem] text-gray-500">{{ item.name }}</div>
                    </div>
                    <div>
                        <van-icon name="arrow" class="text-gray-400" />
                    </div>
                </section>
            </div>

            <!-- 帮助反馈 -->
            <section
                class="rounded-xl py-2 pl-4 pt-4 shadow-md bg-gray-90 mx-2 mt-3 border relative flex items-center justify-between">
                <div class="font-bold flex items-center">
                    <van-icon class="iconfont text-[1rem] mr-2" color="black" class-prefix="icon" name="bangzhufankui"
                        size="25" />
                    <div class="text-[0.8rem] text-gray-500">帮助反馈</div>
                </div>
                <div>
                    <van-icon name="arrow" class="text-gray-400" />
                </div>
            </section>
            <section class=" size-60 bg-[#fb2481] ">
                <button class="film-btn2 ">嘻嘻</button>
                <button class="film-btn-blue bg-stone-950">哈哈</button>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMineStore } from '@/stores/mineStore';
import { useRouter } from 'vue-router';
import type { MineBarItem } from '@/types/mine';

const mineStore = useMineStore();
const { barItems } = storeToRefs(mineStore);
const router = useRouter();

const handleItemClick = (item: MineBarItem) => {
    if (item.route) {
        router.push(item.route);
    }
};
</script>

<style scoped></style>