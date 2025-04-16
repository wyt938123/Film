<template>
    <div>
        <router-view v-slot="{ Component }">  
            <keep-alive :include="cachedComponents">
                <component :is="Component" />               
            </keep-alive>
        </router-view>
        <div class="footer h-12">
            <TabBar class="fixed bottom-0"></TabBar>
        </div>
    </div>
</template>

<script setup lang="ts">
import TabBar from "@/components/Home/TabBar.vue"
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

console.log(router.getRoutes())
//conputer 的作用 用来代替复杂的计算
const cachedComponents = computed(() => {
  const cacheRoutes = router.getRoutes().filter(route => route.meta.cache);
  console.log(cacheRoutes);
  return cacheRoutes.map(route => route.name);      //响应式数据
});

console.log(cachedComponents.value)    //computerref


</script>

<style scoped></style>