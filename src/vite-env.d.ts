/// <reference types="vite/client" />
// ...existing code...

// 解决 worker 导入的类型报错
declare module '*?worker' {
    const workerConstructor: {
        new (): Worker;
    };
    export default workerConstructor;
}

// 如果你确实需要直接导入 .js 文件而不加 ?worker (不推荐用于 Worker)，可以加上这个：
declare module '*.js';

export interface AppJsonConfig {
  key1: string;
  key2: string;
  [key: string]: any; // 处理更多未知的键
}


interface ImportMetaEnv {
  // 在这里定义你的环境变量
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
    readonly VITE_APP_JSON_DATA: AppJsonConfig;
    // 更多变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}