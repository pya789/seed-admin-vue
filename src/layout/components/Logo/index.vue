<script setup>
import { NGradientText } from 'naive-ui';
const props = defineProps({
    // 侧边栏菜单是否收起
    collapsed: Boolean
})
const title = import.meta.env.VITE_TITLE
</script>
<template>
    <div class="logo">
        <img src="@/assets/logo.png" alt="" />
        <span v-show="!props.collapsed" class="title">
            <n-gradient-text gradient="linear-gradient(90deg, #D5EAF5 0%, #F5DDDA 100%)">
                {{title}}
            </n-gradient-text>
        </span>
    </div>
</template>
<style scoped>
.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    line-height: 64px;
    overflow: hidden;
    white-space: nowrap;
}

img {
    width: auto;
    height: 48px;
}

.title {
    margin-left: 4px;
    margin-bottom: 0;
    font-weight: bold;
    font-size: 16px;
}
</style>