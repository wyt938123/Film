<template>
  <van-swipe :autoplay="2500" lazy-render relative
    class="scrollbar-hide mx-5 my-3 rounded-2xl border border-white shadow-2xl shadow-white ring-offset-2">
    <van-swipe-item v-for="(item, index) in items" :key="index" class="relative">
      <img :src="item.img" class="center-fit h-48 w-full" />
      <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1">
        <span class="block overflow-hidden text-ellipsis whitespace-nowrap text-left text-[0.5rem] text-white">
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

<style scoped></style>
