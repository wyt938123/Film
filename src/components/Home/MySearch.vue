<template>
    <van-search  
    v-model="searchField" 
    v-bind="$attrs"
    >
    <template v-for="(_,index) in slots" :key="index" #[index]="slotdata">
        <slot :name="index" v-bind="slotdata || {}"></slot>
    </template>
        
    </van-search>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAttrs ,useSlots} from 'vue';
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
}); 
const emit = defineEmits(['update:modelValue']);

// 使用计算属性实现双向绑定
const searchField = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});
console.log(useAttrs());
const slots = useSlots(); //index是键-函数名  []是作用域插槽动态绑定的标准，#index是写死的
//动态插槽名（v-slot:[变量]）在 Vue 2.6+ 和 Vue 3 中都支持

</script>