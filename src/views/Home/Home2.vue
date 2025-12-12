<template>
    <div ref="containerRef" class="w-[300px] h-[500px] bg-[#00ffff]  relative overflow-auto touch-auto" @scroll="ScrollEvent">
        <!-- .content 对应 Tailwind 样式 -->
        <div :style="{ height: phantomHeight + 'px' }">
            <!-- .content-item 对应 Tailwind 样式 -->

        </div>
        <div :style="{ transform: getTransform }" class="absolute left-0 top-0 w-full bg-yellow">
            <div v-for="item in visibleData" :key="item.index" ref="itemRefs" :id = "String(item.index)"
                class="box-border border border-[#ddd] text-center text-[#333]">
                {{ item.text }} <!-- ✅ 显示文字内容 -->
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUpdated } from 'vue'
// @ts-ignore
import { faker } from 'https://esm.sh/@faker-js/faker'

//这个index十分重要，作为每个dom的标识
const itemDate = new Array(1000).fill({}).map((item, index) => ({ index, text: faker.lorem.sentences() }))

const containerRef = ref<HTMLElement | null>(null); // 容器元素引用
const itemRefs = ref<Array<HTMLElement | null>>([]); // 内容元素引用
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
    return  `translate3d(0,${offSetY.value}px,0)`
})

onMounted(()=>{
    visibleInfo.height = containerRef.value?.clientHeight || 0;
    phantomHeight.value = itemDate.length * estimateHeight.value;
    visibleInfo.startIndex = 0;
    visibleInfo.count = Math.ceil(visibleInfo.height / estimateHeight.value);     //导致每次固定截取x个元素，可以优化缓冲区？？
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
    itemPositions.value = itemDate.map((_, index) => {
        return {
          index,
          top: index * estimateHeight.value,
          bottom: (index + 1) * estimateHeight.value,
          height: estimateHeight.value,
        }
      })
})

function getScrollTop() {
    offSetY.value = 
        visibleInfo.startIndex >= 1 ? itemPositions.value[visibleInfo.startIndex].top : 0
}
// 查找第一个大于等于 scrollTop 的元素索引  -
//
function getStartIndex(scrollTop: number): number {
    // 二分查找法确定 startIndex
    let low = 0;
    let high = itemPositions.value.length - 1;
    let mid = 0;
    let temp = null;
    while (low <= high) {
        mid = low + Math.floor((high - low) / 2);
        if (itemPositions.value[mid].bottom < scrollTop) {
            low = mid + 1;
        } else if (itemPositions.value[mid].top > scrollTop) {
            if(temp === null || temp > mid) {
                temp = mid;
            }
            high = mid - 1;
        } else {
        //刚好等于，下一个元素即可
            temp = mid+1;
            return temp ;
        }
    }
    return temp !== null ? temp : low;
}

//用来更新 visibleInfo 信息的 ---》影响 visibleData ---》dom更新（渲染关系）

function ScrollEvent(e: Event) {
    // 安全地获取 scrollTop：优先用事件目标，再回退到容器引用
    const target = e.target as HTMLElement | null;
    const scrollTop = target?.scrollTop ?? containerRef.value?.scrollTop ?? 0;

    // 根据 scrollTop 计算 startIndex 和 endIndex
    visibleInfo.startIndex = getStartIndex(scrollTop)-1;          //高度设置的可能有问题
    console.log('visibleInfo.startIndex', visibleInfo.startIndex);
    visibleInfo.endIndex = visibleInfo.startIndex + visibleInfo.count;
    getScrollTop();
    console.log('scrollTop', offSetY.value);
}
// 根据渲染dom的变化，来修正 estimateHeight 和 itemPositions
onUpdated(()=>{
    if (!itemRefs.value.length) return
    itemRefs.value.forEach((item) => {
        if (!item) return;
        let id = Number(item.id);
        const realHeight = item.clientHeight;
        // const oldHeight = itemPositions.value[id].height || estimateHeight.value;
            const oldHeight = itemPositions.value[id]?.height ?? estimateHeight.value //有什么区别 为什么后面会导致奔溃 --无限制触发onupdataed
        //这两行代码核心都是为 oldHeight 赋值（优先取元素原有高度，取不到则用预估高度），
        // 但在空值判断逻辑、容错性、安全性上有本质区别，也是导致你代码 “崩溃 / 无限触发 onUpdated” 的关键原因之一
        //

        let pre = realHeight - oldHeight;
        if(pre){
            itemPositions.value[id].height = realHeight;
            itemPositions.value[id].bottom = itemPositions.value[id].top + realHeight;
            //更新后续元素的位置    
            for(let i = id + 1; i < itemPositions.value.length; i++){
                itemPositions.value[i].top += pre;
                itemPositions.value[i].bottom += pre;
            }
        }
    });
    //更新 phantomHeight
     phantomHeight.value = itemPositions.value[itemPositions.value.length - 1].bottom;
    //  getScrollTop();
})
// 根据渲染后的真实高度修正位置和总高度
// onUpdated(() => {
//   if (!itemRefs.value.length) return
//   itemRefs.value.forEach((item) => {
//     if (!item) return
//     const id = Number(item.id)
//     const realHeight = item.clientHeight
//     const oldHeight = itemPositions.value[id]?.height ?? estimateHeight.value
//     const diff = realHeight - oldHeight
//     if (diff !== 0) {
//       itemPositions.value[id].height = realHeight
//       itemPositions.value[id].bottom = itemPositions.value[id].top + realHeight
//       for (let i = id + 1; i < itemPositions.value.length; i++) {
//         itemPositions.value[i].top += diff
//         itemPositions.value[i].bottom += diff
//       }
//     }
//   })
//   phantomHeight.value = itemPositions.value[itemPositions.value.length - 1].bottom
//   getScrollTop()
// })
</script>
<style scoped></style>