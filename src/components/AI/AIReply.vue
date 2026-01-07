<template>
  <div class="flex items-start items-center py-2 pr-4">
    <div class="relative ml-4 rounded-lg bg-blue-500 px-4 py-2 text-white">
      <div class="avatar absolute -left-7 top-1">
        <van-icon class="iconfont" size="1.5rem" class-prefix="icon" name="Chatgpt" color="#666666" />
      </div>
      <p v-html="Text"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
interface Props {
  msg: string;
}
const props = defineProps<Props>();
const Text = ref(processText(props.msg));
function processText(text: string) {
  // 替换制表符为四个非换行空格
  let processedText = text.replace(/\t/g, "&emsp;");
  // 替换换行符为 <br>
  processedText = processedText.replace(/\n/g, "<br>");
  //替换#*号为<span class="hashtag">
  processedText = processedText.replace(/#/g, "");
  processedText = processedText.replace(/\*/g, "");

  return processedText;
}
</script>

<style lang="less" scoped></style>
