/**
 * 工具函数示例
 * 展示项目中常用的工具函数编写规范
 */

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  timestamp: number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const date = new Date(timestamp)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 防抖函数
 * 延迟执行函数，在延迟期间如果再次触发则重新计时
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 * 限制函数在指定时间内只能执行一次
 * @param func 要节流的函数
 * @param interval 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  interval: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  
  return function(...args: Parameters<T>) {
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      func(...args)
      lastTime = now
    }
  }
}

/**
 * 深拷贝对象
 * 使用递归方式实现深度克隆
 * @param obj 要克隆的对象
 * @returns 克隆后的新对象
 */
export const deepClone = <T>(obj: T): T => {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  // 处理普通对象
  const clonedObj = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  
  return clonedObj
}

/**
 * 格式化文件大小
 * 将字节数转换为可读的文件大小格式
 * @param bytes 字节数
 * @param decimals 小数位数，默认 2
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * 生成唯一 ID
 * 基于时间戳和随机数生成唯一标识符
 * @param prefix 可选的前缀
 * @returns 唯一 ID 字符串
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

/**
 * 延迟执行
 * 返回一个 Promise，在指定时间后 resolve
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * URL 参数解析
 * 将 URL 查询字符串解析为对象
 * @param url URL 字符串或查询字符串
 * @returns 参数对象
 */
export const parseQueryString = (url: string): Record<string, string> => {
  const query = url.includes('?') ? url.split('?')[1] : url
  const params: Record<string, string> = {}
  
  if (!query) return params
  
  query.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

/**
 * 数组去重
 * 使用 Set 实现数组去重
 * @param arr 原数组
 * @returns 去重后的新数组
 */
export const unique = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr))
}

/**
 * 数组分组
 * 根据指定键将数组元素分组
 * @param arr 原数组
 * @param key 分组依据的键名
 * @returns 分组后的对象
 */
export const groupBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> => {
  return arr.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}
