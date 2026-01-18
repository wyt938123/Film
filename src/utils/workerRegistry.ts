//如何只用一个map的话，貌似也是可以的，但是会出现耦合性过高，将方法属性封装才好

/**
 * Worker 注册中心
 * 注意 -- 注册的是工厂实例，然后与字符串进行映射
 * 集中管理所有可用的 Worker 类型
 */

import type { WorkerFactory, WorkerRegistration } from "./workerTypes";
import HashWorker from "@/workers/hash.worker.ts?worker";

/**
 * Worker 注册表
 * 存储所有已注册的 Worker 配置
 */
class WorkerRegistry {
  // 使用 Map 存储 Worker 注册信息
  private registry = new Map<string, WorkerRegistration>();

  /**
   * 注册一个新的 Worker 类型
   * @param name - Worker 名称(唯一标识)
   * @param factory - Worker 工厂函数
   * @param maxInstances - 最大实例数,默认 1
   *
   * @example
   * registry.register('hash-worker', () => new HashWorker(), 2)
   */
  register(
    name: string,
    factory: WorkerFactory,
    maxInstances: number = 1,
  ): void {
    if (this.registry.has(name)) {
      console.warn(`[WorkerRegistry] Worker "${name}" 已存在,将被覆盖`);
    }

    this.registry.set(name, {
      name,
      factory,
      maxInstances,
    });

    console.log(
      `[WorkerRegistry] 注册 Worker: ${name}, 最大实例数: ${maxInstances}`,
    );
  }

  /**
   * 获取 Worker 注册信息
   * @param name - Worker 名称
   * @returns Worker 注册信息,不存在则返回 undefined
   */
  get(name: string): WorkerRegistration | undefined {
    return this.registry.get(name);
  }

  /**
   * 创建一个 Worker 实例
   * @param name - Worker 名称
   * @returns Worker 实例
   * @throws 如果 Worker 未注册则抛出错误
   */
  createWorker(name: string): Worker {
    const registration = this.registry.get(name);

    if (!registration) {
      throw new Error(`[WorkerRegistry] Worker "${name}" 未注册`);
    }

    return registration.factory();
  }

  /**
   * 检查 Worker 是否已注册
   * @param name - Worker 名称
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * 取消注册一个 Worker
   * @param name - Worker 名称
   */
  unregister(name: string): boolean {
    return this.registry.delete(name);
  }

  /**
   * 获取所有已注册的 Worker 名称
   */
  getAllNames(): string[] {
    return Array.from(this.registry.keys());
  }
}

// 创建单例实例
const workerRegistry = new WorkerRegistry();

// ============= 预注册常用 Worker =============

/**
 * 注册 Hash Worker
 * 用于文件哈希计算和分片
 */
workerRegistry.register(
  "hash-worker",
  () => new HashWorker(),
  1, // 单例模式,只创建一个实例
);

// 未来可以在这里注册更多 Worker
// workerRegistry.register('image-compress-worker', () => new ImageCompressWorker(), 2)
// workerRegistry.register('video-transcode-worker', () => new VideoTranscodeWorker(), 1)

export default workerRegistry;

/*
import HashWorker from "@/workers/hash.worker.ts?worker";
在 Vite 里，?worker 的意思是：
这不是普通的模块导入
Vite 会把 hash.worker.ts 单独打包成一个 Worker 脚本
这个 HashWorker 实际上就是一个 Worker 的构造函数，等价于：
ts
const worker = new Worker('打包后生成的 worker 文件 URL');
也就是说：URL 已经被 Vite 内置处理掉了，你拿到的是可以直接 new 的 Worker 类，而不是还需要自己传 URL 的裸构造函数。


*/
