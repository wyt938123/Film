<template>
    <div class="contaner px-6 h-full">
        <Loading :item-date="props.items" :buffer = '5'></Loading>
    </div>
</template>

<script setup lang="ts">
import Loading from './Loading.vue';
import type { CommonVideosItem } from "@/types/home";

//接口定义类型约束
interface Props {
    items: CommonVideosItem[];  
}
//接收父组件传递的数据
const props = defineProps<Props>();
</script>

<style scoped></style>