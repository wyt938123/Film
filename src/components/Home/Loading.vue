<template>

    <!-- https://github.com/huodoushigemi/wc-flow-layout.git -->

    <!-- 去掉容器的固定高度和 overflow-auto，让它自然撑开 -->
    <div ref="containerRef" class="w-full min-h-screen bg-[#ffffff] relative">
        <!-- .content 对应 Tailwind 样式 -->
        <div :style="{ height: phantomHeight + 'px' }">
            <!-- .content-item 对应 Tailwind 样式 -->

        </div>
        <div :style="{ transform: getTransform, columnCount: props.cols ?? 1, gap: props.gap ?? 0 }"
            class="absolute left-0 top-0 w-full bg-yellow">
            <div v-for="item in visibleData" :key="item.index" ref="itemRefs" :id="String(item.index)"
                class="box-border border border-[#ddd] text-center text-[#333]">
                <!-- {{ item.img }} ✅ 显示文字内容 -->
                <!-- <img :src="item.img" class="h-[100px] w-full object-cover block" /> -->
                <slot name="item" :item="item"></slot>
            </div>
        </div>
        <!-- 加载状态提示 应该是利用插槽传入-->
        <div class="py-4 text-center">
            <slot name="loading" v-if="loading">
                <!-- 默认加载样式 -->
                <div class="text-gray-500">加载中...</div>
            </slot>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUpdated, watch, nextTick } from 'vue'
// @ts-ignore
import { faker } from 'https://esm.sh/@faker-js/faker'

import type { CommonVideosItem } from "@/types/home";

//无响应s
interface Props {
    // { type: Number; default: 100 } | 100   vue2
    estimateHeight?: number,
    itemDate: CommonVideosItem[];
    buffer?: number;
    loading: boolean;
    gap?: number;
    cols?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'getMoreData'): void;
}>();


const buffer = props.buffer ?? 5;





//这个index十分重要，作为每个dom的标识 
//数据肯定是接口来的，这里为了测试先用假数据代替
// const itemDate = new Array(1000).fill({}).map((_, index) => ({ index, text: faker.lorem.sentences() }))

const itemDate = computed(() => props.itemDate.map((item, index) => ({ index, ...item })));
///itemDate 原本是个常量，在组件初始化时从 props.itemDate 创建后就不再更新。
// 当父组件加载新数据更新 props.itemDate 时，itemDate 仍然是旧数据，导致 visibleData 计算属性无法获取新数据。

const containerRef = ref<HTMLElement | null>(null); // 容器元素引用
const itemRefs = ref<Array<HTMLElement | null>>([]); // 内容元素引用
const phantomHeight = ref(0); // 虚拟内容高度

// const estimateHeight = ref(100) // 预估每个元素高度
// const estimateHeight = props['estimateHeight']// 预估每个元素高度
const estimateHeight = computed(() => props.estimateHeight ?? 100);
const itemPositions = ref<{ index: number; top: number; bottom: number; height: number }[]>([]) // 每个元素的位置信息  ----- 核心数据


const visibleInfo = reactive({  // 可见区域信息
    startIndex: 0,
    endIndex: 0,
    count: 0,
    height: 0
})
// 渲染可见数据
const visibleData = computed(() => {
    return itemDate.value.slice(visibleInfo.startIndex,
        Math.min(visibleInfo.endIndex, itemDate.value.length)
    )
})

let offSetY = ref(0); // 当前滚动位置
const getTransform = computed(() => {
    return `translate3d(0,${offSetY.value}px,0)`
})

onMounted(() => {
    if (!containerRef.value) return;
    // 使用视口高度作为可见区域高度
    visibleInfo.height = window.innerHeight; //这里是整个window视口高度 --后续多渲染的作为缓冲区，防止留白

    // visibleInfo.height = containerRef.value?.clientHeight || 0;
    //造成“触底后加载的 DOM 数量远远超过 10 条”（实际上是渲染了所有数据）的根本原因是：
    // 你在 onMounted 中错误地重置了 visibleInfo.height


    phantomHeight.value = (itemDate.value.length * estimateHeight.value) / (props.cols ?? 1);
    visibleInfo.startIndex = 0;
    visibleInfo.count = Math.ceil(visibleInfo.height / estimateHeight.value) * (props.cols ?? 1) + buffer;     //导致每次固定截取x个元素，可以优化缓冲区？？
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
    itemPositions.value = itemDate.value.map((_, index) => {
        return {
            index,
            top: index * estimateHeight.value,
            bottom: (index + 1) * estimateHeight.value,
            height: estimateHeight.value,
        }
    })
    // 监听 window 滚动
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

})

watch(() => props.itemDate.length, (newLen, oldLen) => {
    nextTick(() => {
        // 当 itemDate 长度变化时，更新 itemPositions
        if (newLen > oldLen) {
            const oldLength = itemPositions.value.length;
            for (let index = oldLength; index < newLen; index++) {
                const lastBottom = itemPositions.value[oldLength - 1]?.bottom ?? 0;
                itemPositions.value.push({
                    index,
                    top: lastBottom + (index - oldLength) * estimateHeight.value,
                    bottom: lastBottom + (index - oldLength + 1) * estimateHeight.value,
                    height: estimateHeight.value,
                });
            }
            phantomHeight.value = itemPositions.value[itemPositions.value.length - 1].bottom;
        }
    });

});

function getScrollTop() {
    offSetY.value =
        visibleInfo.startIndex >= 1 ? itemPositions.value[visibleInfo.startIndex].top : 0
}
// 查找第一个大于等于 scrollTop 的元素索引  -
// 这套仅适用于二分应用
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
            if (temp === null || temp > mid) {
                temp = mid;
            }
            high = mid - 1;
        } else {
            //刚好等于，下一个元素即可
            temp = mid + 1;
            return temp;
        }
    }
    return temp !== null ? temp : low;
}

//用来更新 visibleInfo 信息的 ---》影响 visibleData ---》dom更新（渲染关系）


// const loading = props.loading;  ---props 才是响应式数据，prosp.loading 不是

// 新增一个本地锁，用于解决 props 异步更新的时间差问题
//保证成功为 true 或者 false 之后，才能再次触发加载更多
const isEmitting = ref(false);
// let emitTimer: number | null = null;

watch(() => props.loading, (newVal) => {
    // 当 loading 变为 false 时，就是没有加载时，解锁
    if (!newVal) {
        isEmitting.value = false;
    }
});

// ...existing code...



// !!!!!!!!!!!!!!!
//其实只用本地锁判断就可以了 


function handleWindowScroll() {
    if (!containerRef.value) return;
    // 获取容器顶部相对于视口的位置



    const rect = containerRef.value.getBoundingClientRect();
    const containerTop = rect.top;
    console.log('containerTop', containerTop);
    // 当容器顶部滑出视口时，scrollTop 为正值 -- 其余逻辑照旧
    const scrollTop = Math.max(0, -containerTop);
    // 根据 scrollTop 计算 startIndex 和 endIndex
    visibleInfo.startIndex = Math.max(getStartIndex(scrollTop) - 1 - buffer, 0);
    console.log('visibleInfo.startIndex', visibleInfo.startIndex);
    visibleInfo.endIndex = Math.min(visibleInfo.startIndex + visibleInfo.count + buffer, itemDate.value.length);
    getScrollTop();
    console.log('scrollTop', offSetY.value);

    // 触底加载检测
    // if (!containerRef.value || loading.value) return;
    // if (scrollTop > window.innerHeight) {
    //只有在顶部时才触发加载更多
    // const scrollHeight = containerRef.value.scrollHeight;
    // const clientHeight = containerRef.value.clientHeight;
    // const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    // / ✅ 2. 只有触底加载时才检查锁 -- 不能
    // 如果正在加载或刚触发过emit，跳过触底检测，但不影响上面的滚动计算

    //正在加载或者上锁了，就不触发加载更多
    if (props.loading || isEmitting.value) return;


    const distanceToBottom = containerRef.value.getBoundingClientRect().bottom - window.innerHeight;
    console.log('distanceToBottom', distanceToBottom);

    // 距离底部小于100px时触发加载
    if (distanceToBottom < 200) {
        console.log('触发加载更多');

        // 立即上锁
        isEmitting.value = true;


    }
    //关键在于loading的修改权限在父组件
    // 导致会出现重复触发的问题
    //加载框也只是告知在加载的工具
    emit('getMoreData');

    // ✅ 添加超时解锁（兜底保护）
    // 如果 3 秒后 props.loading 还没变化，强制解锁
    window.setTimeout(() => {
        if (isEmitting.value) {
            console.log('超时解锁（props.loading 未更新）');
            isEmitting.value = false;
        }
    }, 3000);
}

    // }



// function ScrollEvent(e: Event) {
//     // 安全地获取 scrollTop：优先用事件目标，再回退到容器引用
//     const target = e.target as HTMLElement | null;
//     const scrollTop = target?.scrollTop ?? containerRef.value?.scrollTop ?? 0;

//     // 根据 scrollTop 计算 startIndex 和 endIndex
//     visibleInfo.startIndex = Math.max(getStartIndex(scrollTop) - 1 - buffer, 0);
//     console.log('visibleInfo.startIndex', visibleInfo.startIndex);
//     visibleInfo.endIndex = Math.min(visibleInfo.startIndex + visibleInfo.count + buffer, itemDate.value.length);
//     getScrollTop();
//     console.log('scrollTop', offSetY.value);

//     // 触底加载检测
//     if (!containerRef.value || loading.value) return;
//     const scrollHeight = containerRef.value.scrollHeight;
//     const clientHeight = containerRef.value.clientHeight;
//     const distanceToBottom = scrollHeight - scrollTop - clientHeight;

//     // 距离底部小于100px时触发加载
//     if (distanceToBottom < 10  && !loading.value) {
//         emit('getMoreData');
//     }
// }
// 根据渲染dom的变化，来修正 estimateHeight 和 itemPositions
onUpdated(() => {
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
        if (pre) {
            itemPositions.value[id].height = realHeight;
            itemPositions.value[id].bottom = itemPositions.value[id].top + realHeight;
            //更新后续元素的位置    
            for (let i = id + 1; i < itemPositions.value.length; i++) {
                itemPositions.value[i].top += pre;
                itemPositions.value[i].bottom += pre;
            }
        }
    });
    //更新 phantomHeight
    phantomHeight.value = itemPositions.value[itemPositions.value.length - 1].bottom / (props.cols ?? 1);
    //  getScrollTop();
})

</script>
<style scoped></style>