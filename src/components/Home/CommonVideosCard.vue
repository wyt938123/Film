<template>
    <div class="contaner px-6 h-full">
        <wc-waterfall :gap="20" :cols="2">
            <div class="card boder rounded-lg shadow-lg" v-for="item in items" :key="item.name">
                <img v-lazy="item.img" alt="" class="rounded-lg">
                <div class="text">
                    <p class="text-[0.8rem] mb-1 font-bold font-mono">{{ item.name }}</p>
                    <div class="flex items-center justify-around">
                        <div
                            class="text-[0.6rem] text-gray-400 overflow-hidden overflow-ellipsis overflow-auto text-nowrap">
                            {{ item.title }}
                        </div>
                        <div class="flex items-center">
                            <div class="text-[0.5rem] text-white-400 ml-2 overflow-hidden">
                                {{ item.msg }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <van-back-top right="5vw" bottom="10vh"/>
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