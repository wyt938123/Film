import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, CartItem } from '@/types/shop'

/**
 * 购物车 Store
 * 管理购物车状态和商品操作
 */
export const useCartStore = defineStore('cart', () => {
  // ========== 状态定义 ==========
  
  // 购物车商品列表
  const cartItems = ref<CartItem[]>([])
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // ========== 计算属性 ==========
  
  // 购物车商品总数
  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  // 购物车总价
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      return sum + item.product.price * item.quantity
    }, 0)
  })
  
  // 是否为空购物车
  const isEmpty = computed(() => {
    return cartItems.value.length === 0
  })
  
  // ========== 方法定义 ==========
  
  /**
   * 添加商品到购物车
   * @param product 商品信息
   * @param quantity 数量
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.value.find(
      item => item.product.id === product.id
    )
    
    if (existingItem) {
      // 如果商品已存在，增加数量
      existingItem.quantity += quantity
    } else {
      // 如果是新商品，添加到购物车
      cartItems.value.push({
        product,
        quantity,
        addedAt: Date.now()
      })
    }
  }
  
  /**
   * 从购物车移除商品
   * @param productId 商品 ID
   */
  const removeFromCart = (productId: string) => {
    const index = cartItems.value.findIndex(
      item => item.product.id === productId
    )
    
    if (index !== -1) {
      cartItems.value.splice(index, 1)
    }
  }
  
  /**
   * 更新商品数量
   * @param productId 商品 ID
   * @param quantity 新数量
   */
  const updateQuantity = (productId: string, quantity: number) => {
    const item = cartItems.value.find(
      item => item.product.id === productId
    )
    
    if (item) {
      if (quantity <= 0) {
        // 如果数量为 0 或负数，移除商品
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }
  
  /**
   * 清空购物车
   */
  const clearCart = () => {
    cartItems.value = []
  }
  
  /**
   * 从服务器加载购物车数据
   */
  const fetchCart = async () => {
    isLoading.value = true
    try {
      // 模拟 API 请求
      const response = await fetch('/api/cart')
      const data = await response.json()
      cartItems.value = data.items
    } catch (error) {
      console.error('加载购物车失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // ========== 返回导出 ==========
  
  return {
    // 状态
    cartItems,
    isLoading,
    
    // 计算属性
    totalCount,
    totalPrice,
    isEmpty,
    
    // 方法
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart
  }
})
