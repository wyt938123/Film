<template>
    <div class="tarbar w-full h-16 flex items-center justify-around bg-gray-200">
        <div class="flex-1" v-for="tab in topBarState" :key="tab.key">
            <router-link :to="`/VideoDetail/${route.params.id}/${tab.key}`" class="tab-item text-center py-3"
                active-class="text-blue-500 border-b-2 border-blue-500">
                {{ tab.label }}
            </router-link>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TopBarItem } from '@/types/detail'

const route = useRoute()
const props = defineProps<{ topBarState: TopBarItem[] }>()
const topBarState = computed(() => props.topBarState)

</script>