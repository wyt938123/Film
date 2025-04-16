<template>
    <van-tabbar v-model="active" class="shadow-black shadow-2xl opacity-90">
        <van-tabbar-item to="/assistant">
            <template #icon>
                <van-icon class="iconfont" class-prefix="icon" name="AI" size="20"/>
            </template>
            AI识片酱
        </van-tabbar-item>
        <van-tabbar-item icon="play-circle" to="/home">首页</van-tabbar-item>
        <van-tabbar-item icon="video" to="/video">好片</van-tabbar-item>
        <van-tabbar-item icon="manager" to="/mine">我的</van-tabbar-item>
    </van-tabbar>
</template>
<!-- 1. v-model 和 active        类似于 element ui 
van-tabbar 组件有一个 v-model 属性，它实际上是对组件的 active 属性进行绑定。当 v-model="active" 被应用时，active 变量的值会决定 van-tabbar 中哪个选项是激活的（即高亮的）。
active 是一个 ref 类型的变量，绑定到 van-tabbar 的 v-model 上。因此，当 active 的值变化时，van-tabbar 组件会根据这个值更新显示当前激活的标签项（tab）。 -->
<script setup lang="ts">
import { ref,onMounted } from "vue";
import { useRoute } from "vue-router";
const active = ref<number>(0);
    onMounted(() => {
    const route = useRoute();
    console.log(1)
    const path = route.path;
    switch (path) {
      case "/assistant":
        active.value = 0;
        break;
      case "/home":
        active.value = 1;
        break;
      case "/video":
        active.value = 2;
        break;
      case "/mine":
        active.value = 3;
        break;
      default:
        active.value = 1;
        break;
    }
  })

//   onMounted 和路由同步
// 在 onMounted 生命周期钩子中，代码根据当前路由的路径来设置 active 的值。具体来说：
// 如果路由路径是 /assistant，active 被设置为 0，意味着第一个 van-tabbar-item 被激活。
// 如果路由路径是 /home，active 被设置为 1，第二个 van-tabbar-item 被激活，依此类推。
// 这样，当页面加载完成时，根据当前的路由路径，active 会被更新，从而控制相应的 van-tabbar-item 处于激活状态，展示高亮效果。
</script>

<style scoped></style>
