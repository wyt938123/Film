<template>
    <div class="contaner h-full px-6">
        <Loading :item-date="props.items" :buffer="5" :loading="loading" @getMoreData="addData" :gap="20" :cols="2">
            <template #item="{ item }">
                <div class="card">
                    <img v-lazy="item.img" alt="" class="block h-[400px] w-full object-cover" />
                </div>
            </template>
            <template #loading>
                <van-loading size="24px">努力加载中...</van-loading>
            </template>
        </Loading>
        <!-- 把一个默认插槽传入 -->
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Loading from "./Loading.vue";
import type { CommonVideosItem } from "@/types/home";

//接口定义类型约束
interface Props {
    items: CommonVideosItem[];
}
//接收父组件传递的数据
const props = defineProps<Props>();
const loading = ref(false);

const addData = () => {
    loading.value = true;
    setTimeout(() => {
        //模拟异步获取数据
        const moreData = [];
        for (let i = 0; i < 10; i++) {
            moreData.push({
                index: props.items.length + i,
                name: "小小的我",
                title: "易烊千玺饰演脑瘫患者",
                msg: "9.3",
                img: "https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc002006a6qthq1733721799297/0?max_age=7776000",
            });
        }
        props.items.push(...moreData); //违背了props不可变原则，仅为模拟数据使用
        loading.value = false;
    }, 1500);
    // loading.value = false;   --- 这里不能直接设置为false，因为setTimeout是异步的
};
</script>

<style scoped></style>
