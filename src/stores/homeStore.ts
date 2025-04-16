import { defineStore } from "pinia";
// 引诱 面试官 es6 module 问题
import { ref } from "vue";
// 关键数据要限制类型
import type { 
    HomeTopBarItem,
    PopularVideosItem,
    CommonVideosItem 
} from "@/types/home";

export const useHomeStore = defineStore('home',()=>{
    // 定义状态

    //导航
    const topBarState = ref<HomeTopBarItem[]>([
        {
            title: '电视剧',
            icon: 'dianshiju'
        },
        {
            title: '电影',
            icon: 'dianying'
        },
        {
            title: '综艺',
            icon: 'liebiaodaohang_zongyi'
        },
        {
            title: '动漫',
            icon: 'dongman'
        },
        {
            title: '更多',
            icon: 'xiala'
        }
    ])
    
    // 热门影视
    const popularVideosState = ref<PopularVideosItem[]>([
        {
            title: '小丑2: 双重妄想',
            msg: '影帝华金与LadyGaga飙戏',
            img: 'https://tv.puui.qpic.cn/tv/0/mz_tv_image_frontend_1f0e95-5_2053125534_1744798214277506_pic_540x304/450?max_age=7776001'
        },
        {
            title: '食神',
            msg: '周星驰狂秀炸裂厨艺',
            img: 'https://tv.puui.qpic.cn/tv/0/mz_tv_image_frontend_1f0e95-5_19330170_1744767691710619_pic_540x304/450?max_age=7776001'
        },
        {
            title: '绝地战警',
            msg: '威尔史密斯黑人兄弟整活',
            img: 'https://puui.qpic.cn/vcover_hz_pic/0/nbusftujqwczi7y1629250388865/810?max_age=7776001'
        },
        {
            title: '毒液：最后一舞',
            msg: '共生体大战解锁毒液马新形态',
            img: 'https://tv.puui.qpic.cn/tv/0/mz_tv_image_frontend_1f0e95-5_1154704009_1740968074122501_pic_540x304/450?max_age=7776001'
        },
        {
            title: '神雕侠侣',
            msg: '杨过小龙女旷世奇恋',
            img: 'https://vcover-hz-pic.puui.qpic.cn/vcover_hz_pic/0/hwogw342vzidfdb1729047781272/0?max_age=7776001'
        },
        {
            title: '大奉打更人',
            msg: '大奉第一阵师你的幻来了',
            img: 'https://puui.qpic.cn/vpic_cover/a0038aa7s5r/a0038aa7s5r_hz.jpg/640'
        },
        {
            title: '笑傲江湖',
            msg: '宋雨琦版东方不败惊艳',
            img: 'https://puui.qpic.cn/vpic_cover/n0041u7auug/n0041u7auug_hz.jpg/640'
        },
    ])

    // 常用影视
    const commonVideosState = ref<CommonVideosItem[]>([
        {
            name: '斗破苍穹',
            title: '萧炎升斗尊!异火毁天灭地',
            msg: '更新至133集',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc0020027yzd9e1723195259313/0?max_age=7776000'
        },
        {
            name: '功夫熊猫',
            title: '时隔八年重榜归来',
            msg: '9.4',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200n8j0p5f1706242586720/0?max_age=7776000'
        },
        {
            name: '误判',
            title: '甄子丹正义厮杀拳拳到肉',
            msg: '9.2',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200shxravh1737726102985/0?max_age=7776000'
        },
        {
            name: '奇妙萌可之魔法甜心',
            title: '快加入捕捉甜心的新旅程',
            msg: '全26集',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc0020065woy041732699865355/0?max_age=7776000'
        },
        {
            name: '老枪',
            title: '老枪：全面瓦解',
            msg: '9.3',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc0020088jtn3y1738723345694/0?max_age=7776000'
        },
        {
            name: '剑来',
            title: '天行健，君子以自强不息',
            msg: '全26集',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc0020072zgk611721874669799/0?max_age=7776000'
        },
        {
            name: '假爸爸',
            title: '贾冰伊正假冒父子组团捞钱',
            msg: '8.8',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc00200pa18nf91738044757094/0?max_age=7776000'
        },
        {
            name: '小小的我',
            title: '易烊千玺饰演脑瘫患者',
            msg: '9.3',
            img: 'https://vcover-vt-pic.puui.qpic.cn/vcover_vt_pic/0/mzc002006a6qthq1733721799297/0?max_age=7776000'
        },
        {
            name: '哪吒之魔童降世',
            title: '东方英雄拯救世界',
            msg: '9.6',
            img: 'https://puui.qpic.cn/vcover_vt_pic/0/zr5a67l333ehzu91574817414/0?max_age=7776000'
        }
    ])
        

    return {
        topBarState,
        popularVideosState,
        commonVideosState
    }
})
