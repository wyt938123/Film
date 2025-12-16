import { defineStore } from "pinia";
import { ref } from "vue";
import type { MineBarItem } from "@/types/mine";

export const useMineStore = defineStore("mine", ()=> {

    const barItems = ref<MineBarItem[]>([
        {
            name: '预约/追加',
            icon: 'jiazhui-24-bofangqi'
        },
        {
            name: '下载',
            icon: 'download-1-copy',
            route: '/download'
        },
        {
            name: '片单',
            icon: 'piandan',
            route: '/playlist'
        },
        {
            name: '收藏',
            icon: 'shoucang',
            route: '/collection'
        },
        {
            name: '上传视频',
            icon: 'shoucang',
            route: '/upload'
        },
        {
            name: '我的金币',
            icon: 'wodejinbi'
        },
        {
            name: '我的游戏',
            icon: 'wodeyouxi'
        },
        {
            name: '草地场订单',
            icon: 'dingdan'
        },
        {
            name: '我的资产',
            icon: 'wodezichan'
        },
        {
            name: '更多',
            icon: 'gengduo'
        },    
        
    ])
    
    return {
        barItems
    }

    //导出图标对象 数组
})
