<template>
    <div class="video-detail-container">
        <!-- 顶部：视频播放器、标题、操作栏等固定内容 -->
        <div ref="videoDetailDom" class="video-detail-UP sticky top-0 z-10">
            <VideoPlayer>

            </VideoPlayer>
            <div class="video-detail-main-banner bg-orange-400">
                <section ref="VipPromotionBannerDom">
                    <VipPromotionBanner>

                    </VipPromotionBanner>
                </section>
                <!-- Tab 导航 -->
                <TarBar :topBarState="store.topBarState">

                </TarBar>
            </div>
        </div>
        <!-- 直接设置margin-top的话无法做到不同设备的兼容 因为不知道video的具体高度？？-->
        <!-- 以doucumnt来滚动时，min-h-screen就是ok的 -->

        <!-- 子路由出口：这里显示切换的内容 -->
        <div class="video-detail bg-orange-800   min-h-screen relative ">

            <div class="video-detail-main " ref="videoDetailMainDom">
                <!-- <section ref="videoDetailUPDom" class=" bg-slate-600">
                    <VideoActionBar>

                    </VideoActionBar>
                    <EpisodeSelector>

                    </EpisodeSelector>
                </section>

                <AdBanner>

                </AdBanner>
                <VideoList>

                </VideoList> -->

                <router-view v-slot="{ Component }">
                    <component :is="Component" ref="childComponentRef" />
                </router-view>


            </div>
        </div>
    </div>


</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

import VideoPlayer from '@/components/VideoDetail.vue/VideoPlayer.vue';
import VipPromotionBanner from '@/components/VideoDetail.vue/VipPromotionBanner.vue'
import TarBar from '@/components/VideoDetail.vue/VideoMetaInfo/TarBar.vue'
// import VideoActionBar from '@/components/VideoDetail.vue/VideoActionBar/Index.vue'
// import EpisodeSelector from '@/components/VideoDetail.vue/EpisodeSelector/index.vue'
// import AdBanner from '@/components/VideoDetail.vue/AdBanner.vue'
// import VideoList from '@/components/VideoDetail.vue/VideoList.vue'


import { useDetailStore } from '@/stores/detailStore'
let sign = true

const videoDetailDom = ref<HTMLElement | null>(null)
const VipPromotionBannerDom = ref<HTMLElement | null>(null)
const childComponentRef = ref<any>(null) // 引用子组件实例
const videoDetailUPDom = ref<HTMLElement | null>(null) // 引用子组件暴露出的 DOM
const videoDetailMainDom = ref<HTMLElement | null>(null)

const store = useDetailStore()

let upDomHeight = 0
let bannerHeight = 0

// 监听子组件变化，获取真正暴露出来的 DOM 和高度
watch(childComponentRef, (instance) => {
    if (instance) {
        nextTick(() => {
            const dom = instance.videoDetailUPDom
            if (dom) {
                videoDetailUPDom.value = dom
                upDomHeight = dom.clientHeight
                console.log('成功获取子组件 DOM 高度:', upDomHeight)
            }
        })
    }
})

const handleScroll = () => {
    // 兜底：如果高度还没拿到，尝试再次获取
    if (!upDomHeight && videoDetailUPDom.value) {
        upDomHeight = videoDetailUPDom.value.clientHeight
    }

    if (!(videoDetailUPDom.value && videoDetailDom.value && VipPromotionBannerDom.value && videoDetailMainDom.value)) {
        return;
    }
    // 只有在显示状态下才更新高度缓存，避免隐藏后获取到 0
    if (VipPromotionBannerDom.value.style.display !== 'none') {
        bannerHeight = VipPromotionBannerDom.value.offsetHeight;
    }


    if (upDomHeight && document.documentElement.scrollTop > upDomHeight) {
        console.log('滚动到底部了')
        // window.removeEventListener('scroll', handleScroll)
        if (sign) {
            // 1. 获取 Banner 的当前高度

            // 2. 隐藏 Banner
            VipPromotionBannerDom.value.style.display = 'none'

            // 3. 让 videoDetailUPDom 向上平移 Banner 的高度
            // 使用 transform 性能更好，也可以增加 transition 效果
            videoDetailMainDom.value.style.transition = 'transform 0.3s ease'
            // videoDetailMainDom.value.style.transform = `translateY(-${bannerHeight}px)`
            //VipPromotionBannerDom隐藏后 ，scrollTop = scrollTop - bannerHeight
            document.documentElement.scrollTop += bannerHeight // 修正滚动条位置
            sign = false
        }
        // ！！！！！！！！好像就让scrollTop += bannerHeight 就可以了，不需要偏移videoDetailMainDom
    }
    else {
        if (!sign) {
            VipPromotionBannerDom.value.style.display = 'block'
            document.documentElement.scrollTop -= bannerHeight // 修正滚动条位置
        }

        // if (videoDetailMainDom.value) {
        //     videoDetailMainDom.value.style.transform = 'translateY(0px)'
        // }
        sign = true
    }
    console.log((upDomHeight || 0), document.documentElement.scrollTop)
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    console.log(videoDetailDom.value?.clientHeight)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})



//下面才是真正需要进行的请求，比如获取视频详情、评论等，上面只是假数据

// const videoId = ref(route.params.id) // 拿到当前视频ID

// // 监听路由变化（如果是从视频A跳转到视频B，组件会被复用，需要监听变化）
// watch(() => route.params.id, (newId) => {
//     videoId.value = newId
//     fetchVideoData(newId as string) // 重新获取视频数据
// })

// const fetchVideoData = (id: string) => {
//     console.log('正在加载视频 ID 为:', id, '的数据')
//     // 这里执行你的 API 请求逻辑
// }

// onMounted(() => {
//     fetchVideoData(videoId.value as string)
// })


</script>