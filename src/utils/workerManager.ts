/**
 * Worker 管理器
 * 提供 Promise 化的 Worker 调用接口,支持超时、进度、取消等功能
 */

// 针对每个 workerName 维护 Worker 实例池；execute 被调用时：
// 1. 为当前任务生成唯一 taskId，并按 Worker 维度将任务映射到 taskQueues 中
// 2. 从对应 workerName 的实例池中优先复用空闲 Worker 执行任务（必要时创建新实例

import type {
  WorkerMessage,
  WorkerOptions,
  WorkerProgressMessage,
  WorkerErrorMessage,
} from "./workerTypes";
import workerRegistry from "./workerRegistry";

/**
 * Worker 任务信息
 * 用于跟踪单个任务的状态
 */
interface WorkerTask {
  id: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout?: number;
  timeoutId?: number;
}

/**
 * Worker 管理器类
 * 负责 Worker 的创建、通信、销毁
 */
class WorkerManager {
  // Worker 实例池 (workerName -> Worker 实例数组)
  //从 regisername --- 映射到可工作实例
  private workerPool = new Map<string, Worker[]>();

  // 任务队列 (Worker 实例 -> 任务 Map)
  //string 是task.id
  private taskQueues = new Map<Worker, Map<string, WorkerTask>>();

  /**
   * 附帶暴露的核心函數
   *
   *
   * 执行 Worker 任务
   * @param workerName - Worker 名称(在 registry 中注册的名称)
   * @param input - 输入数据
   * @param options - 执行选项
   * @returns Promise<Output>
   *
   * @example
   * const result = await execute<HashWorkerInput, HashWorkerOutput>(
   *   'hash-worker',
   *   { file, chunkSize: 1024 * 1024 },
   *   { timeout: 30000, onProgress: (p) => console.log(p) }
   * )
   */
  async execute<Input, Output>(
    workerName: string,
    input: Input,
    options: WorkerOptions = {},
  ): Promise<Output> {
    // 1. 获取或创建 Worker 实例
    const worker = this.getOrCreateWorker(workerName);

    // 2. 生成唯一任务 ID
    const taskId = this.generateTaskId();

    // 3. 设置默认超时时间
    const timeout = options.timeout ?? 30000; // 默认 30 秒

    // 4. 创建 Promise 包装 Worker 通信
    //
    //注意task封装了结束 promise的能力
    return new Promise<Output>((resolve, reject) => {
      // 保存任务信息
      const task: WorkerTask = {
        id: taskId,
        resolve,
        reject,
        timeout,
      };

      // 设置超时定时器
      if (timeout > 0) {
        task.timeoutId = window.setTimeout(() => {
          this.handleTimeout(worker, taskId, timeout);
        }, timeout);
      }

      // 注册任务
      this.registerTask(worker, task);

      // 监听 Worker 消息(只监听一次,避免重复监听)
      if (!this.taskQueues.get(worker)) {
        this.setupWorkerListeners(worker, options);
      }

      // 监听取消信号
      if (options.signal) {
        options.signal.addEventListener("abort", () => {
          this.cancelTask(worker, taskId, "Task was aborted");
        });
      }

      // 发送任务到 Worker
      const message: WorkerMessage<Input> = {
        id: taskId,
        type: "request",
        data: input,
        timestamp: Date.now(),
      };

      worker.postMessage(message);
    });
  }

  /**
   * 获取或创建 Worker 实例
   * @param workerName - Worker 名称
   * @returns Worker 实例
   */
  private getOrCreateWorker(workerName: string): Worker {
    // 检查是否已注册
    if (!workerRegistry.has(workerName)) {
      throw new Error(`[WorkerManager] Worker "${workerName}" 未注册`);
    }

    // 获取现有 Worker 池
    let workers = this.workerPool.get(workerName);

    if (!workers) {
      workers = [];
      this.workerPool.set(workerName, workers);
    }

    // 获取注册信息
    const registration = workerRegistry.get(workerName)!;

    // 查找空闲的 Worker (没有正在执行的任务)
    const idleWorker = workers.find((w) => {
      const tasks = this.taskQueues.get(w);
      return !tasks || tasks.size === 0;
    });

    if (idleWorker) {
      return idleWorker;
    }

    // 如果没有空闲 Worker 且未达到最大实例数,创建新实例
    if (workers.length < registration.maxInstances) {
      const newWorker = workerRegistry.createWorker(workerName);
      workers.push(newWorker);
      console.log(
        `[WorkerManager] 创建新的 ${workerName} 实例,当前数量: ${workers.length}`,
      );
      return newWorker;
    }
    //达到最大实例数 且都是非空闲
    // 返回任务数最少的 Worker
    //键不是唯一的吗？
    // 负载均衡 -- 选择任务数最少的 Worker -- 一个worker是可以对应多个任务的
    return workers.reduce((min, current) => {
      const minTasks = this.taskQueues.get(min)?.size ?? 0;
      const currentTasks = this.taskQueues.get(current)?.size ?? 0;
      return currentTasks < minTasks ? current : min;
    });
  }

  /**
   * 设置 Worker 消息监听
   * @param worker - Worker 实例
   * @param options - 执行选项
   */

  // 项目中也是对官网的api进行aop整合 ， 比如onshow等监听事件
  private setupWorkerListeners(worker: Worker, options: WorkerOptions): void {
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      // 根据消息类型处理
      switch (message.type) {
        case "response":
          this.handleResponse(worker, message.id, message.data);
          break;

        case "progress":
          this.handleProgress(
            worker,
            message.id,
            message.data,
            options.onProgress,
          );
          break;

        case "error":
          this.handleError(worker, message.id, message.data);
          break;
      }
    };

    worker.onerror = (error) => {
      console.error("[WorkerManager] Worker 错误:", error);
      // 清理所有该 Worker 的任务 --- 任务队列中的
      const tasks = this.taskQueues.get(worker);
      if (tasks) {
        tasks.forEach((task) => {
          task.reject(new Error("Worker 执行出错"));
          if (task.timeoutId) {
            clearTimeout(task.timeoutId);
          }
        });
        tasks.clear();
      }
    };
  }

  /**
   * 处理 Worker 响应
   */
  private handleResponse(worker: Worker, taskId: string, data: any): void {
    const task = this.getTask(worker, taskId);
    if (!task) return;

    // 清理超时定时器
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }

    // 解析 Promise
    task.resolve(data);

    // 移除任务
    this.removeTask(worker, taskId);
  }

  /**
   * 处理进度消息
   */
  private handleProgress(
    worker: Worker,
    taskId: string,
    data: WorkerProgressMessage,
    onProgress?: (progress: number, data?: any) => void,
  ): void {
    if (onProgress) {
      onProgress(data.progress, data);
    }
  }

  /**
   * 处理错误消息
   */
  private handleError(
    worker: Worker,
    taskId: string,
    data: WorkerErrorMessage,
  ): void {
    const task = this.getTask(worker, taskId);
    if (!task) return;

    // 清理超时定时器
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }

    // 拒绝 Promise
    task.reject(new Error(data.error));

    // 移除任务
    this.removeTask(worker, taskId);
  }

  /**
   * 处理超时
   */
  private handleTimeout(worker: Worker, taskId: string, timeout: number): void {
    const task = this.getTask(worker, taskId);
    if (!task) return;

    // 拒绝 Promise
    task.reject(new Error(`Worker 任务超时 (${timeout}ms)`));

    // 移除任务
    this.removeTask(worker, taskId);

    // 可选: 终止超时的 Worker
    // worker.terminate()
  }

  /**
   * 取消任务
   */
  private cancelTask(worker: Worker, taskId: string, reason: string): void {
    const task = this.getTask(worker, taskId);
    if (!task) return;

    // 清理超时定时器
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }

    // 拒绝 Promise
    task.reject(new Error(reason));

    // 移除任务
    this.removeTask(worker, taskId);
  }

  /**
   * 注册任务
   */
  private registerTask(worker: Worker, task: WorkerTask): void {
    let tasks = this.taskQueues.get(worker);
    if (!tasks) {
      tasks = new Map();
      this.taskQueues.set(worker, tasks);
    }
    tasks.set(task.id, task);
  }

  /**
   * 获取任务
   */
  private getTask(worker: Worker, taskId: string): WorkerTask | undefined {
    return this.taskQueues.get(worker)?.get(taskId);
  }

  /**
   * 移除任务
   */
  private removeTask(worker: Worker, taskId: string): void {
    this.taskQueues.get(worker)?.delete(taskId);
  }

  /**
   * 生成唯一任务 ID
   */
  private generateTaskId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 终止所有 Worker
   * 清理资源,在应用卸载时调用
   */
  terminateAll(): void {
    this.workerPool.forEach((workers) => {
      workers.forEach((worker) => worker.terminate());
    });
    this.workerPool.clear();
    this.taskQueues.clear();
    console.log("[WorkerManager] 所有 Worker 已终止");
  }

  /**
   * 终止指定名称的所有 Worker
   */
  terminate(workerName: string): void {
    const workers = this.workerPool.get(workerName);
    if (workers) {
      workers.forEach((worker) => {
        worker.terminate();
        this.taskQueues.delete(worker);
      });
      this.workerPool.delete(workerName);
      console.log(`[WorkerManager] ${workerName} 的所有实例已终止`);
    }
  }
}

// 创建单例实例
const workerManager = new WorkerManager();

/**
 * 便捷的 Hook 函数
 * 返回 Worker 执行器
 *
 * @example
 * const { execute } = useWorker('hash-worker')
 * const result = await execute<Input, Output>(data, options)
 */
export function useWorker(workerName: string) {
  return {
    execute: <Input, Output>(input: Input, options?: WorkerOptions) =>
      workerManager.execute<Input, Output>(workerName, input, options),
    terminate: () => workerManager.terminate(workerName),
  };
}

export default workerManager;
