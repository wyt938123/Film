/**
 * Hash Worker - TypeScript 版本
 * 负责文件哈希计算和分片
 * 支持进度报告和标准消息协议
 */

// @ts-ignore
import SparkMD5 from "spark-md5";
import type {
  WorkerMessage,
  HashWorkerInput,
  HashWorkerOutput,
  HashWorkerProgress,
} from "../utils/workerTypes";

/**
 * 监听主线程消息
 */
self.onmessage = (e: MessageEvent<WorkerMessage<HashWorkerInput>>) => {
  const message = e.data;
  const { id, data } = message;
  const { file, chunkSize } = data;

  try {
    // 调用核心处理函数
    processFile(id, file, chunkSize);
  } catch (error: any) {
    // 发送错误消息
    sendError(id, error.message || "文件处理失败");
  }
};

/**
 * 核心处理函数 - 计算文件 hash 和分片
 * @param taskId - 任务 ID
 * @param file - 文件对象
 * @param chunkSize - 分片大小
 */
function processFile(taskId: string, file: File, chunkSize: number): void {
  const fileChunkList: Array<{ chunkFile: Blob }> = [];
  const chunkCount = Math.ceil(file.size / chunkSize); // 总分片数
  const spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();
  let currentChunk = 0;

  /**
   * 发送进度更新
   * 每处理完一个分片就发送一次进度
   */
  const sendProgress = () => {
    const progress = Math.floor((currentChunk / chunkCount) * 100);

    const progressData: HashWorkerProgress = {
      progress,
      currentChunk,
      totalChunks: chunkCount,
    };

    const progressMessage: WorkerMessage<HashWorkerProgress> = {
      id: taskId,
      type: "progress",
      data: progressData,
      timestamp: Date.now(),
    };

    self.postMessage(progressMessage);
  };

  /**
   * 读取下一个分片
   */
  const loadNext = () => {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    // 保存分片
    fileChunkList.push({ chunkFile: chunk });

    // 异步读取分片为二进制数据
    fileReader.readAsArrayBuffer(chunk);
  };

  /**
   * 分片读取成功的回调
   */
  fileReader.onload = (e: ProgressEvent<FileReader>) => {
    if (!e.target?.result) {
      sendError(taskId, "分片读取失败");
      return;
    }

    try {
      // 追加到 MD5 计算
      spark.append(e.target.result as ArrayBuffer);
      currentChunk++;

      // 发送进度更新
      sendProgress();

      // 判断是否还有更多分片
      if (currentChunk < chunkCount) {
        // 继续读取下一个分片
        loadNext();
      } else {
        // 所有分片读取完成,计算最终 hash
        const fileHash = spark.end();

        // 构造响应数据
        const result: HashWorkerOutput = {
          fileHash,
          fileChunkList,
        };

        // 发送成功响应
        sendResponse(taskId, result);
      }
    } catch (error: any) {
      sendError(taskId, `分片处理失败: ${error.message}`);
    }
  };

  /**
   * 分片读取失败的回调
   */
  fileReader.onerror = () => {
    sendError(
      taskId,
      `文件读取失败: ${fileReader.error?.message || "未知错误"}`,
    );
  };

  // 开始读取第一个分片
  loadNext();
}

/**
 * 发送成功响应到主线程  ---  最总成功结果
 */
function sendResponse(taskId: string, data: HashWorkerOutput): void {
  const message: WorkerMessage<HashWorkerOutput> = {
    id: taskId,
    type: "response",
    data,
    timestamp: Date.now(),
  };

  self.postMessage(message);
}

/**
 * 发送错误消息到主线程
 */
function sendError(taskId: string, error: string): void {
  const message: WorkerMessage = {
    id: taskId,
    type: "error",
    data: { error },
    timestamp: Date.now(),
  };

  self.postMessage(message);
}

// 防止 TypeScript 报错
export {};
