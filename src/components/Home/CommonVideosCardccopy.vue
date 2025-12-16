<template>
    <div class="contaner px-6 h-full">
    <Loading 
        :item-date="props.items" 
        :buffer='5' 
        :loading="loading" 
        @getMoreData="addData"
        >

    </Loading>
        <!-- 把一个默认插槽传入 -->
        
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Loading from './Loading.vue';
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
                name: '小小的我',
                title: '易烊千玺饰演脑瘫患者',
                msg: '9.3',
                img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc002006a6qthq1733721799297/0?max_age=7776000'
            });
        }
        props.items.push(...moreData);     //违背了props不可变原则，仅为模拟数据使用
    }, 1500);
    loading.value = false;

};
</script>

<style scoped></style>