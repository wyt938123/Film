// directives/lazy.js
import type { DirectiveBinding } from 'vue';     
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// import { useIntersectionObserver } from '@vueuse/core'
//有现成的封装好了的API

export default {
    //是vue自带的钩子函数是自定义指令（directive）的一部分
//     在自定义指令中使用 mounted 时不需要导入它，它会自动作为指令对象的一部分存在。
// 你只需要定义在指令的钩子对象中并注册到 Vue 实例或组件中，Vue 会根据需要自动调用。
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        // 确保绑定的值是字符串类型，这里假设它是一个图片的URL
        if (typeof binding.value === 'string') {
            el.dataset.src = binding.value;
        }
        //通过打印次数可以知道 --- 每一个绑定了指令的dom 在dom挂载完成后，执行mounted钩子函数
        console.dir(el.dataset)
        const { observer }: any = useIntersectionObserver();   //他也要执行多次
        observer.observe(el);
    },
    unmounted(el: any) {
        // 当元素卸载时，取消观察
        const { observer }: any = useIntersectionObserver();
        if (observer) {
            observer.unobserve(el);
        }
    }
};

// binding: DirectiveBinding：

// binding 对象包含了指令的详细信息，提供了与指令绑定相关的各种属性和信息。它的结构大致如下：

// interface DirectiveBinding {
//     name: string;         // 指令的名字，像 v-bind、v-if 等
//     value: any;           // 绑定到指令的值
//     oldValue: any;        // 以前的绑定值
//     expression: string;   // 绑定值的表达式
//     arg: string | undefined; // 指令参数（如果有）
//     modifiers: Record<string, boolean>; // 指令的修饰符（如果有）
// }
// 在你的例子中，binding 对象特别关注 value 属性，它代表了传递给指令的值。通常这是你在模板中使用指令时传入的参数。