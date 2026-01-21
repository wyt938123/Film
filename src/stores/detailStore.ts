import { defineStore } from "pinia";
import { ref } from "vue";

import type { TopBarItem } from "@/types/detail";

export const useDetailStore = defineStore("detail", () => {
  const topBarState = ref<TopBarItem[]>([
    { key: "detail", label: "详情" },
    { key: "ugc", label: "二创" },
    { key: "comments", label: "讨论" },
    { key: "shop", label: "买周边" },
    { key: "report", label: "观影报告" },
  ]);

  const topBarState2 = ref<TopBarItem[]>([
    { key: "detail", label: "详情" },
    { key: "ugc", label: "二创" },
    { key: "comments", label: "讨论" },
  ]);
  return { topBarState, topBarState2 };
});
