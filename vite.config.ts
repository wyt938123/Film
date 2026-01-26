import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
// 预先加载UI 组件库
import Components from "unplugin-vue-components/vite";
// 引入vant组件  编译阶段  按需加载
import { VantResolver } from "@vant/auto-import-resolver";
import path from "path";
// 引入打包压缩插件
import viteCompression from "vite-plugin-compression";
// 引入打包分析插件
import { visualizer } from "rollup-plugin-visualizer";
// 引入图片优化插件
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

import importToCDN from "vite-plugin-cdn-import";
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";

  return {
    base: "/",
    plugins: [
      vue(),
      Components({
        resolvers: [VantResolver()],
      }),
      // 图片资源自动优化
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        exclude: undefined,
        include: undefined,
        includePublic: true,
        logStats: true,
        ansiColors: true,
        svg: {
          multipass: true,
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  cleanupNumericValues: false,
                  removeViewBox: false, // 防止图标变形
                },
              },
            },
            "sortAttrs",
            {
              name: "addAttributesToSVGElement",
              params: {
                attribute: { xmlns: "http://www.w3.org/2000/svg" },
              },
            },
          ],
        },
        png: { quality: 80 },
        jpeg: { quality: 75 },
        jpg: { quality: 75 },
        webp: { lossy: true, quality: 75 },
        avif: { lossy: true, quality: 60 },
      }),
      // 生产环境开启 Gzip 压缩
      isProd &&
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240, // 超过 10kb 则压缩
          algorithm: "gzip",
          ext: ".gz",
        }),
      // 打包分析 (生成 report.html)
      isProd &&
        visualizer({
          open: true,
          filename: "report.html",
          gzipSize: true,
          brotliSize: true,
        }),
      // 2. 只有在生产环境才启用 CDN
      isProd &&
        importToCDN({
          generateScriptTag: (name, scriptUrl) => ({
            attrs: {
              src: scriptUrl,
            },
          }),
          modules: [
            {
              name: "vue",
              var: "Vue",
              path: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue/3.5.13/vue.global.prod.min.js",
            },
            {
              name: "vue-router",
              var: "VueRouter",
              path: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue-router/4.5.0/vue-router.global.prod.min.js",
            },
            {
              name: "axios",
              var: "axios",
              path: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/axios/1.7.9/axios.min.js",
            },
            {
              name: "vant",
              var: "vant",
              path: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vant/4.9.3/index.min.js",
              css: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vant/4.9.3/index.css",
            },
            // 补充 Pinia
            {
              name: "vue-demi", // Pinia 的依赖
              var: "VueDemi",
              path: "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/vue-demi/0.14.10/index.iife.min.js",
            },
            {
              name: "pinia",
              var: "Pinia",
              path: "https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/pinia/2.3.1/pinia.iife.prod.min.js",
            },
          ],
        }),
    ].filter(Boolean), // 过滤掉 false 的项
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      // 生产环境开启压缩，开发环境关闭以提升速度
      minify: isProd ? "esbuild" : false,
      // 开发环境生成 sourcemap
      sourcemap: !isProd,
      // 启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      // 资源内联限制 (4kb)
      assetsInlineLimit: 4096,
      rollupOptions: {
        // 显式开启 Tree-shaking 优化
        treeshake: true,
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("vant")) return "vant-vendor";
              if (
                id.includes("vue") ||
                id.includes("pinia") ||
                id.includes("vue-router")
              )
                return "vue-vendor";
              return "vendor";
            }
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    esbuild: {
      // 仅在生产环境剔除 console
      drop: isProd ? ["console", "debugger"] : [],
    },
    // Web Worker 配置
    worker: {
      format: "es", // 保持 ES 模块格式，适配现代浏览器
    },
    server: {
      host: "0.0.0.0", // 允许局域网访问
      port: 5173,
      open: true, // 启动后自动打开浏览器
      cors: true, // 允许开发环境跨域
      proxy: {
        // 配合环境变量进行接口代理
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      fs: {
        allow: [path.resolve(__dirname), "D:/node_modules"],
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      open: true,
      strictPort: true, // 端口占用时直接报错而非寻找下一个
    },
  };
});
