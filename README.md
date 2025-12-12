# Vue 3 + TypeScript + Vite

## 加载

const oldHeight = itemPositions.value[id]?.height ?? estimateHeight.value //有什么区别 为什么后面会导致奔溃 --无限制触发onupdataed

visibleInfo.startIndex = getStartIndex(scrollTop)-1;          //高度设置的可能有问题