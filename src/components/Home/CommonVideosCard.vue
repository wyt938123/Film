<template>
    <div class="contaner h-full px-6">
        <wc-waterfall :gap="20" :cols="2">
            <!-- 把一个默认插槽传入 -->
            <div class="card boder rounded-lg shadow-lg" v-for="item in items" :key="item.name">
                <img v-lazy="item.img" alt="" class="rounded-lg" />
                <div class="text">
                    <p class="mb-1 font-mono text-[0.8rem] font-bold">{{ item.name }}</p>
                    <div class="flex items-center justify-around">
                        <div
                            class="overflow-auto overflow-hidden overflow-ellipsis text-nowrap text-[0.6rem] text-gray-400">
                            {{ item.title }}
                        </div>
                        <div class="flex items-center">
                            <div class="text-white-400 ml-2 overflow-hidden text-[0.5rem]">
                                {{ item.msg }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <van-back-top right="5vw" bottom="10vh" />
        </wc-waterfall>
    </div>
</template>

<script setup lang="ts">
import type { CommonVideosItem } from "@/types/home";

//接口定义类型约束
interface Props {
    items: CommonVideosItem[];
}
//接收父组件传递的数据
defineProps<Props>();
</script>

<style scoped></style>
