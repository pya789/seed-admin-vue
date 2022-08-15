<script setup lang="jsx">
const message = "我是在.vue文件的template使用jsx的demo哦"
const dom = <div>{message}</div>
</script>
<template>
    <component :is="dom" />
</template>
<script lang="jsx">
import { defineComponent } from 'vue'
export default defineComponent({
    setup() {
        const message = "我是在.vue文件使用jsx的demo哦"
        return () => (
            <div>{message}</div>
        )
    }
})
</script>
