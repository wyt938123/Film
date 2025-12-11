<template>
    <div ref="containerRef" class="w-[300px] h-[500px] bg-[#00ffff]  relative overflow-auto touch-auto" @scroll="ScrollEvent">
        <!-- .content 对应 Tailwind 样式 -->
        <div :style="{ height: phantomHeight + 'px' }">
            <!-- .content-item 对应 Tailwind 样式 -->

        </div>
        <div :style="{ transform: getTransform }" class="absolute left-0 top-0 w-full bg-yellow">
            <div v-for="item in visibleData" :key="item.index" ref="itemRefs"
                class="box-border border border-[#ddd] text-center text-[#333]"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
// @ts-ignore
import { faker } from 'https://esm.sh/@faker-js/faker'

const itemDate = new Array(1000).fill({}).map((item, index) => ({ index, text: faker.lorem.sentences() }))

const containerRef = ref<HTMLElement | null>(null); // 容器元素引用
const itemRefs = ref<HTMLElement | null>(null); // 内容元素引用
const phantomHeight = ref(0); // 虚拟内容高度

const estimateHeight = ref(100) // 预估每个元素高度
const itemPositions = ref<{ index: number; top: number; bottom: number; height: number }[]>([]) // 每个元素的位置信息  ----- 核心数据




const visibleInfo = reactive({  // 可见区域信息
    startIndex: 0,
    endIndex: 0,
    count: 0,
    height: 0
})
// 渲染可见数据
const visibleData = computed(() => {
    return itemDate.slice(visibleInfo.startIndex, Math.min(visibleInfo.endIndex, itemDate.length))
})

let offSetY = ref(0); // 当前滚动位置
const getTransform = computed(() => {
    return `translateY(${offSetY}px)`
})

onMounted(()=>{
    visibleInfo.height = containerRef.value?.clientHeight || 0;
    phantomHeight.value = itemDate.length * estimateHeight.value;
    visibleInfo.startIndex = 0;
    visibleInfo.count = Math.ceil(visibleInfo.height / estimateHeight.value);
    visibleInfo.endIndex = visibleInfo.startIndex + visibleInfo.count;
    // itemPositions.value = itemDate.reduce((acc, item, index) => {
    //     acc[index] = {
    //         index: index,
    //         top: index * estimateHeight.value,
    //         height: estimateHeight.value,
    //         endIndex: (index + 1) * estimateHeight.value
    //     }
    //     return acc;
    // }, {} as Record<number, { top: number, height: number }>); 
    itemPositions.value = itemDate.map((item, index) => {
        return {
          index,
          top: index * estimateHeight.value,
          bottom: (index + 1) * estimateHeight.value,
          height: estimateHeight.value,
        }
      })
})

function getStartIndex(scrollTop: number): number {
    // 二分查找法确定 startIndex
    let low = 0;
    let high = itemPositions.value.length - 1;
    let mid;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (itemPositions.value[mid].bottom < scrollTop) {
            low = mid + 1;
        } else if (itemPositions.value[mid].top > scrollTop) {
            high = mid - 1;
        } else {
            return mid;
        }
    }
    return low;
}

//用来更新 visibleInfo 信息的 ---》影响 visibleData ---》dom更新（渲染关系）

function ScrollEvent(e: Event) {
    // 安全地获取 scrollTop：优先用事件目标，再回退到容器引用
    const target = e.target as HTMLElement | null;
    const scrollTop = target?.scrollTop ?? containerRef.value?.scrollTop ?? 0;

    // 根据 scrollTop 计算 startIndex 和 endIndex
    visibleInfo.startIndex = getStartIndex(scrollTop);
    visibleInfo.endIndex = visibleInfo.startIndex + visibleInfo.count;
    offSetY.value = itemPositions.value[visibleInfo.startIndex]?.top ?? 0;
}

</script>
<style scoped></style>