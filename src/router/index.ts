import { createRouter, createWebHistory } from "vue-router";
/*
import type 语法：这是 TypeScript 3.8 引入的新语法，其目的是把类型导入和值导入区分开。
RouteRecordRaw 类型：这是 vue-router 库定义的一个类型，代表路由记录的原始格式。
*/
import type { RouteRecordRaw } from "vue-router";

// : 声明一个类型 RouteRecordRaw 一个route 类型 RouteRecordRaw[] route数组
const rootRoutes: RouteRecordRaw[] = [
  {
    path: "home",
    //路由配置一个别名有一个作用 就是parmar传参必须要有名字
    name: "Home",
    meta: {
      title: "首页",
      cache: true,
    },
    component: () => import("@/views/Home/Home.vue"),
  },
  {
    path: "assistant",
    name: "Assistant",
    meta: {
      title: "ai助手",
      cache: true,
    },
    component: () => import("@/views/Assistant/Assistant.vue"),
  },
  {
    path: "video",
    name: "Video",
    meta: {
      title: "好片",
      cache: true,
    },
    component: () => import("@/views/Video/Video.vue"),
  },
  {
    path: "mine",
    name: "Mine",
    meta: {
      title: "个人中心", //个人中心不进行缓存
      cache: false,
    },
    component: () => import("@/views/Mine/Mine.vue"),
  },
];

const detailRoutes: RouteRecordRaw[] = [
  {
    path: "detail", // 去掉前面的 /，使其相对于父级路径
    name: "VideoDetailContent",
    meta: {
      title: "详情",
      cache: false,
    },
    component: () => import("@/views/Detailview/MianInfo.vue"),
  },
  // {
  //   path: "ugc",
  //   name: "VideoUGC",
  //   meta: { title: "二创", cache: false },
  //   component: () => import("@/views/Detailview/UGC.vue"), // 假设你有这些组件
  // },
  // {
  //   path: "comments",
  //   name: "VideoComments",
  //   meta: { title: "讨论", cache: false },
  //   component: () => import("@/views/Detailview/Comments.vue"),
  // }
];

const videoRoutes: RouteRecordRaw[] = [
  {
    path: "/videoDetail/:id", /// // 核心：使用 :id 动态参数
    name: "VideoDetail",
    meta: {
      title: "视频详情",
      cache: false,
    },
    component: () => import("@/views/videoDetail.vue"),
    children: [...detailRoutes],
    redirect: (to) => `/video/${to.params.id}/detail`, // 自动补全路径-跳转二级路由
  },
];

// 独立页面路由（不在 tabbar 下）
const standaloneRoutes: RouteRecordRaw[] = [
  {
    path: "/download",
    name: "Download",
    meta: {
      title: "下载管理",
      cache: false,
    },
    component: () => import("@/views/Mine/Menu/Upload.vue"),
  },
  {
    path: "/playlist",
    name: "Playlist",
    meta: {
      title: "我的片单",
      cache: false,
    },
    component: () => import("@/views/Mine/Menu/Upload.vue"),
  },
  {
    path: "/collection",
    name: "Collection",
    meta: {
      title: "我的收藏",
      cache: false,
    },
    component: () => import("@/views/Mine/Menu/Upload.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    meta: {
      title: "上传视频",
      cache: false,
    },
    component: () => import("@/views/Mine/Menu/Upload.vue"),
  },
  {
    path: "/upload-file",
    name: "UploadFile",
    meta: {
      title: "上传视频",
      cache: false,
    },
    component: () => import("@/views/Mine/Menu/UploadFile.vue"),
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "App",
    //-------------------------------------------------------------路由配置中
    component: () => import("@/views/KeepAlive.vue"),
    redirect: "/home",
    children: rootRoutes,
    //我的是对二级路由进行操作，一级路由的KeepAlive是不变的，即tarbar是不变的
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  ...standaloneRoutes,
  ...videoRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 每次路由切换时，将页面滚动到顶部
    return { top: 0 };
  },
});

console.log(router);

console.log(document);

//  document.title可以直接获取html的title
console.log(document.title);

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string;
  console.log(document.title);
  next(); //正常进行不做拦截   没有判断
});

// 这段代码是 Vue Router 中的全局前置守卫（router.beforeEach），用于在路由切换之前执行一些逻辑。具体来说，它的作用是：

// 动态设置页面标题：根据目标路由（to）的 meta 属性中的 title 字段，更新页面的标题（document.title）。

// 继续路由导航：调用 next()，允许路由导航继续进行  next还有其他属性。

export default router;
