<script  setup>
import { onMounted, reactive, watch, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex';
import { generatorMenuTree } from '@/utils/tree'
import { NMenu } from 'naive-ui'
const props = defineProps({
    // 侧边栏菜单是否收起
    collapsed: Boolean
})
// 当前路由
const currentRoute = useRoute()
const router = useRouter()
const store = useStore()

// 获取当前打开的子菜单
const matched = currentRoute.matched
const getOpenKeys = matched && matched.length ? matched.map((item) => item.name) : [];
const state = reactive({
    openKeys: getOpenKeys,
    menuList: [],
    active: currentRoute.name
});

// 跟随页面路由变化，切换菜单选中状态
watch(
    () => currentRoute.fullPath,
    () => {
        updateMenu();
        const matched = currentRoute.matched;
        state.openKeys = matched.map((item) => item.name);
        const activeMenu = currentRoute.meta?.activeMenu || '';
        state.active = activeMenu ? activeMenu : currentRoute.name;
    }
)
onMounted(() => {
    updateMenu();
});
// 解析菜单
const updateMenu = () => {
    state.menuList = generatorMenuTree(store.getters["route/menus"])
}
// 点击菜单
const clickMenuItem = (key) => {
    if (/http(s)?:/.test(key)) {
        window.open(key);
    } else {
        router.push({ name: key });
    }
}
//展开菜单
const menuExpanded = (openKeys) => {
    if (!openKeys) return;
    const latestOpenKey = openKeys.find((key) => state.openKeys.indexOf(key) === -1);
    const isExistChildren = findChildrenLen(latestOpenKey);
    state.openKeys = isExistChildren ? (latestOpenKey ? [latestOpenKey] : []) : openKeys;
}
//查找是否存在子路由
const findChildrenLen = (key) => {
    if (!key) return false;
    const subRouteChildren = [];
    for (const { children, key } of toRaw(state.menuList)) {
        if (children && children.length) {
            subRouteChildren.push(key);
        }
    }
    return subRouteChildren.includes(key);
}
</script>
<template>
    <n-menu :value="state.active" :collapsed="props.collapsed" :collapsed-width="64" :collapsed-icon-size="20"
        :indent="24" :options="state.menuList" :inverted="true" :root-indent="20" @update:value="clickMenuItem"
        :expanded-keys="state.openKeys" @update:expanded-keys="menuExpanded" />
</template>
<style scoped>
</style>