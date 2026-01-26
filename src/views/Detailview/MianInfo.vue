<template>
    <section ref="videoDetailUPDom" class=" bg-slate-600">
        <videoMetaInfo>

        </videoMetaInfo>
        <VideoActionBar>

        </VideoActionBar>
        <EpisodeSelector>

        </EpisodeSelector>
    </section>

    <AdBanner>

    </AdBanner>
    <VideoList>

    </VideoList>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import videoMetaInfo from '@/components/VideoDetail.vue/VideoMetaInfo/Index.vue'
import VideoActionBar from '@/components/VideoDetail.vue/VideoActionBar/Index.vue'
import EpisodeSelector from '@/components/VideoDetail.vue/EpisodeSelector/index.vue'
import AdBanner from '@/components/VideoDetail.vue/AdBanner.vue'
import VideoList from '@/components/VideoDetail.vue/VideoList.vue'

const videoDetailUPDom = ref<HTMLElement | null>(null)

// 暴露 DOM 引用给父组件使用
defineExpose({
    videoDetailUPDom
})
</script>