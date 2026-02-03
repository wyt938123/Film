/**
 * 神蓍广告 SDK 配置文件
 * 用于 WebView H5 环境，通过 JSBridge 与 App 端通信
 * 
 * 注意：由于运行在 App WebView 环境，需要确保：
 * 1. App 端已集成神蓍 SDK
 * 2. web-view 组件已配置 @message 监听
 * 3. uni.postMessage 可用
 */

// 广告位配置 - 基于 adUnitId 的逻辑池
export const AD_UNITS = {
  // 激励视频广告位
  REWARD_VIDEO: {
    adUnitId: 'reward_video_001',
    name: '激励视频广告',
    type: 'REWARD_VIDEO' as const
  },
  // 插屏广告位
  INTERSTITIAL: {
    adUnitId: 'interstitial_001',
    name: '插屏广告',
    type: 'INTERSTITIAL' as const
  },
  // Banner 广告位
  BANNER: {
    adUnitId: 'banner_001',
    name: 'Banner广告',
    type: 'BANNER' as const
  }
}

// 广告层级配置示例
export const AD_STOREY_CONFIG = {
  JL: [
    {
      platform: 'shenshi',
      adUnitIds: ['reward_video_001', 'reward_video_002'],
      probability: [50, 50], // 随机权重
      price: 100
    }
  ],
  YS: [
    {
      platform: 'shenshi',
      adUnitIds: ['interstitial_001'],
      probability: [100],
      price: 80
    }
  ]
}

/**
 * 初始化神蓍广告 SDK
 * 注意：需要在 App 端 ready 后调用
 */
export function initAdSdk(userId: string, extra?: Record<string, any>) {
  console.log('[AD SDK] 神蓍广告 SDK 配置已加载')
  console.log('[AD SDK] 用户ID:', userId)
  console.log('[AD SDK] 扩展参数:', extra)
  
  // TODO: 实际初始化逻辑
  // 由于类型问题，暂时注释，待解决后启用
  /*
  const startup = Startup.GetInstance()
  startup.init()
  
  const aop = Aop.GetInstance()
  aop.init()
  
  const adManager = AdManager.GetInstance()
  adManager.init({ userId, extra, debug: import.meta.env.DEV, storeyConfig: AD_STOREY_CONFIG })
  */
  
  return true
}

/**
 * 获取广告管理器实例
 * 暂时返回 mock 对象，待类型问题解决后更新
 */
export function getAdManager() {
  // TODO: 返回真实的 AdManager 实例
  return {
    showAd: (type: string, callbacks?: any) => {
      console.log('[AD SDK Mock] showAd called:', type)
      console.warn('[AD SDK Mock] 真实 SDK 尚未初始化，这是 Mock 版本')
    }
  }
}
