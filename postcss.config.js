export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 生产环境开启 CSS 压缩和优化
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
