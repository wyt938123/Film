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