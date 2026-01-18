<template>
    <div ref="videoDetailDom" class="video-detail-UP sticky top-0 z-10">
        <VideoPlayer>

        </VideoPlayer>
        <div class="video-detail-main-banner bg-orange-400">
            <section ref="VipPromotionBannerDom">
                <VipPromotionBanner>

                </VipPromotionBanner>
            </section>

            <videoMetaInfo>

            </videoMetaInfo>
        </div>
    </div>
    <!-- 直接设置margin-top的话无法做到不同设备的兼容 因为不知道video的具体高度？？-->
    <!-- 以doucumnt来滚动时，min-h-screen就是ok的 -->
    <div class="video-detail bg-orange-800   min-h-screen relative ">

        <div class="video-detail-main " ref="videoDetailMainDom">
            <section ref="videoDetailUPDom" class=" bg-slate-600">
                <VideoActionBar>

                </VideoActionBar>
                <EpisodeSelector>

                </EpisodeSelector>
            </section>

            <AdBanner>

            </AdBanner>
            <VideoList>

            </VideoList>

        </div>
    </div>

</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

import VideoPlayer from '@/components/VideoDetail.vue/VideoPlayer.vue';
import VipPromotionBanner from '@/components/VideoDetail.vue/VipPromotionBanner.vue'
import videoMetaInfo from '@/components/VideoDetail.vue/VideoMetaInfo/Index.vue'
import VideoActionBar from '@/components/VideoDetail.vue/VideoActionBar/Index.vue'
import EpisodeSelector from '@/components/VideoDetail.vue/EpisodeSelector/index.vue'
import AdBanner from '@/components/VideoDetail.vue/AdBanner.vue'
import VideoList from '@/components/VideoDetail.vue/VideoList.vue'

let sign = true

const videoDetailDom = ref<HTMLElement | null>(null)
const VipPromotionBannerDom = ref<HTMLElement | null>(null)
const videoDetailUPDom = ref<HTMLElement | null>(null)
const videoDetailMainDom = ref<HTMLElement | null>(null)
let upDomHeight = 0
let bannerHeight = 0
//videoDetailUPDom.value.clientHeight是会变得 ---  最好先拿到值，不要在滚动事件中每次都获取
nextTick(() => {
    if (videoDetailUPDom.value) {
        upDomHeight = videoDetailUPDom.value.clientHeight
    }

})

const handleScroll = () => {
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
</script>