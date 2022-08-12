<script setup>
import { reactive, watch, h, onMounted, toRaw } from 'vue'
import { NIcon, NSelect } from 'naive-ui'
import { iconObj } from "@/utils/icon.js";
const emit = defineEmits(["update:value"])
const state = reactive({
    value: null,
    list: []
})
const renderLabel = (opt) => {
    if (!opt.icon) {
        return
    }
    return h("div", { style: "display:flex;align-items: center;" }, [
        h(NIcon, { size: 18 }, { default: () => h(toRaw(opt.icon)) }),
        h("span", {}, { default: () => opt.value })
    ])
}
watch(() => state.value, (value) => {
    emit("update:value", value)
})
onMounted(() => {
    for (const key of Object.keys(iconObj)) {
        state.list.push({
            label: key,
            value: key,
            icon: iconObj[key]
        })
    }
})
</script>
<template>
    <n-select v-model:value="state.value" :render-label="renderLabel" filterable clearable
        placeholder="选择图标 utils/icon.js文件添加自定义图标" :options="state.list" />
</template>
<style scoped>
</style>