/**
 * Web Worker 通信类型系统
 * 定义了所有 Worker 的输入输出类型和消息格式
 */

// ============= 基础消息类型 =============

/**
 * Worker 消息的基础类型
 * @template T - 消息携带的数据类型
 */
export interface WorkerMessage<T = any> {
  id: string; // 消息唯一标识符,用于匹配请求和响应
  type: "request" | "response" | "progress" | "error"; // 消息类型
  data: T; // 实际数据
  timestamp: number; // 时间戳
}

/**
 * Worker 进度消息
 */
export interface WorkerProgressMessage {
  progress: number; // 进度百分比 0-100
  message?: string; // 进度描述信息
}

/**
 * Worker 错误消息
 */
export interface WorkerErrorMessage {
  error: string; // 错误信息
  code?: string; // 错误代码
}

// ============= Hash Worker 特定类型 =============

/**
 * Hash Worker 输入类型
 * 用于文件哈希计算和分片
 */
export interface HashWorkerInput {
  file: File; // 要处理的文件
  chunkSize: number; // 分片大小(字节)
}

/**
 * Hash Worker 输出类型
 */
export interface HashWorkerOutput {
  fileHash: string; // 文件的 MD5 哈希值
  fileChunkList: Array<{ chunkFile: Blob }>; // 文件分片数组
}

/**
 * Hash Worker 进度信息
 */
export interface HashWorkerProgress {
  progress: number; // 当前进度 0-100
  currentChunk: number; // 当前处理的分片索引
  totalChunks: number; // 总分片数
}

// ============= Worker 配置类型 =============

/**
 * Worker 执行选项
 */
export interface WorkerOptions {
  timeout?: number; // 超时时间(毫秒),默认 30000
  onProgress?: (progress: number, data?: any) => void; // 进度回调
  signal?: AbortSignal; // 取消信号
}

/**
 * Worker 实例配置
 */
export interface WorkerConfig {
  name: string; // Worker 名称
  worker: Worker; // Worker 实例
  maxInstances?: number; // 最大实例数,默认 1
}

// ============= Worker 注册表类型 =============

/**
 * Worker 工厂函数类型
 * 返回一个新的 Worker 实例
 */
export type WorkerFactory = () => Worker;

/**
 * Worker 注册信息
 */
export interface WorkerRegistration {
  name: string; // Worker 名称
  factory: WorkerFactory; // Worker 工厂函数
  maxInstances: number; // 最大实例数
}
