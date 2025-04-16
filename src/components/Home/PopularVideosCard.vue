<template>
    <van-swipe :autoplay="2500" lazy-render relative class="mx-5 my-3 scrollbar-hide rounded-2xl ring-offset-2 shadow-white shadow-2xl border border-white">
      <van-swipe-item v-for="(item, index) in items" :key="index" class="relative">
        <img :src="item.img" class="w-full h-48 center-fit" />
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1">
          <span class="text-white text-[0.5rem] text-left whitespace-nowrap overflow-hidden text-ellipsis block">
            {{ item.title }} | {{ item.msg }}
          </span>
        </div>
      </van-swipe-item>
    </van-swipe>
  </template>
  
  <script setup lang="ts">
  
  import type { PopularVideosItem } from "@/types/home.ts";
  
  //接口定义类型约束
  interface Props {
    items: PopularVideosItem[];
  }
  //接收父组件传递的数据
  defineProps<Props>();

  </script>
  
  <style scoped>
  
  </style>
  