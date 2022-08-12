<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex'
const store = useStore()
// 需要缓存的路由组件
const keepAliveComponents = computed(() => store.getters['route/keepAliveComponents']);
</script>
<template>
    <RouterView>
        <template #default="{ Component, route }">
            <transition name="zoom-fade" mode="out-in" appear>
                <keep-alive :include="keepAliveComponents">
                    <component :is="Component" :key="route.fullPath" />
                </keep-alive>
            </transition>
        </template>
    </RouterView>
</template>
<style scoped>
</style>