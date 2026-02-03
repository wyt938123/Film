/**
 * 广告 SDK 使用示例
 * 在 App WebView 环境中使用神蓍广告 SDK
 */
import { getAdManager } from '../sdk/adConfig'

/**
 * 展示激励视频广告
 */
export function showRewardVideoAd() {
  const adManager = getAdManager()
  
  adManager.showAd('REWARD_VIDEO', {
    onLoad: () => {
      console.log('[广告] 激励视频加载成功')
    },
    onShow: () => {
      console.log('[广告] 激励视频开始播放')
    },
    onClose: (isReward: boolean) => {
      console.log('[广告] 激励视频关闭', isReward ? '已获得奖励' : '未获得奖励')
    },
    onError: (error: any) => {
      console.error('[广告] 激励视频错误:', error)
    }
  })
}

/**
 * 展示插屏广告
 */
export function showInterstitialAd() {
  const adManager = getAdManager()
  
  adManager.showAd('INTERSTITIAL', {
    onLoad: () => {
      console.log('[广告] 插屏广告加载成功')
    },
    onShow: () => {
      console.log('[广告] 插屏广告显示')
    },
    onClose: () => {
      console.log('[广告] 插屏广告关闭')
    },
    onError: (error: any) => {
      console.error('[广告] 插屏广告错误:', error)
    }
  })
}

/**
 * 预加载广告
 * 建议在应用启动、页面切换时调用
 */
export function preloadAds() {
  // AdNet 会自动管理预加载
  console.log('[广告] 开始预加载广告...')
}
