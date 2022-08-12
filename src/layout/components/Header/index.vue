<script setup>
import { reactive, unref, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    ReloadOutlined,
    GithubFilled,
    FullscreenOutlined,
    FullscreenExitOutlined,
    QqCircleFilled,
    MoreOutlined,
    SearchOutlined
} from '@vicons/antd'
import { NBreadcrumb, NIcon, NBreadcrumbItem, NDropdown, NTooltip, NAvatar, NGradientText, NSelect } from 'naive-ui';
import { useStore } from 'vuex';
import { generatorMenuTree, generatorBreadcrumbTree } from '@/utils/tree';
import { UserOutlined, LogoutOutlined } from '@vicons/antd'
import { renderIcon } from '@/utils/tree'
import avatarPath from "/src/assets/images/avatar.jpeg";
const props = defineProps({
    // 侧边栏菜单是否收起
    collapsed: Boolean
})
const emit = defineEmits(["update:collapsed"])
const router = useRouter()
const route = useRoute()
const store = useStore()
const searchRef = ref(null)
const state = reactive({
    isFullscreen: false,
    isSearch: false,
    searchValue: null,
    userInfo: store.getters["user/userInfo"]
})

// 面包屑路径列表
const breadcrumbList = computed(() => {
    return generatorBreadcrumbTree(route.matched);
});
// 面包屑菜单选中
const dropdownSelect = (key) => {
    if (/http(s)?:/.test(key)) {
        window.open(key);
    } else {
        router.push({ name: key });
    }
};
// 刷新页面
const reloadPage = () => {
    router.push({
        path: '/redirect' + unref(route).fullPath,
    });
};
// 搜索菜单列表
const searchList = computed(() => {
    return generatorMenuTree(store.getters["route/menus"], true);
});
// 搜索选中
const searchUpdate = (value) => {
    const { name } = route
    if (name === value) {
        state.isSearch = false
        window.$message.warning("已经是当前菜单了,你还要我怎样?")
        return
    }
    if (/http(s)?:/.test(value)) {
        window.open(value);
    } else {
        router.push({ name: value });
    }
}
// 搜索blur事件
const searchBlur = () => {
    state.searchValue = null
    state.isSearch = false
}
// 用于github和QQ群跳转 
const openUrl = (path) => {
    window.open(path)
}
// 切换全屏图标
const toggleFullscreenIcon = () => {
    state.isFullscreen = !state.isFullscreen
}
// 监听全屏切换事件
document.addEventListener('fullscreenchange', toggleFullscreenIcon);
// 全屏切换
const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};
// 头像下拉菜单
const avatarOptions = [
    {
        label: '个人设置',
        key: 1,
        icon: renderIcon(UserOutlined)
    },
    {
        label: '退出登录',
        key: 2,
        icon: renderIcon(LogoutOutlined)
    },
];

// 头像下拉菜单选中
const avatarSelect = (key) => {
    switch (key) {
        case 1:
            router.push({ name: 'userSettingSon' });
            break;
        case 2:
            window.$dialog.info({
                title: '提示',
                content: '您确定要退出登录吗',
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: () => {
                    window.$message.success("退出登录成功,即将为您跳转至登录页面");
                    setTimeout(() => {
                        store.dispatch("user/LogOut");
                    }, 1500);
                },
                onNegativeClick: () => { },
            });
            break;
    }
};
// 监听搜索组件ref
watch(() => searchRef.value, (to) => {
    searchRef.value?.focus()
})
// 监听路由变化
watch(() => route.fullPath, (to) => {
    state.isSearch = false
})
</script>
<template>
    <div class="layout-header">
        <!-- 左侧菜单 -->
        <div class="layout-header-left">
            <!-- 菜单收放 -->
            <div class="layout-header-trigger" @click="() => emit('update:collapsed', !props.collapsed)">
                <n-icon class="n-icon" size="18" v-if="props.collapsed">
                    <MenuUnfoldOutlined />
                </n-icon>
                <n-icon class="n-icon" size="18" v-else>
                    <MenuFoldOutlined />
                </n-icon>
            </div>
            <!-- 刷新 -->
            <div class="layout-header-trigger mr-1" @click="reloadPage">
                <n-tooltip placement="bottom">
                    <template #trigger>
                        <n-icon class="n-icon" size="18">
                            <ReloadOutlined />
                        </n-icon>
                    </template>
                    <span>刷新页面</span>
                </n-tooltip>
            </div>
            <!-- 面包屑 -->
            <n-breadcrumb>
                <template v-for="routeItem in breadcrumbList" :key="routeItem.name">
                    <n-breadcrumb-item>
                        <n-dropdown v-if="routeItem.children?.length" :options="routeItem.children"
                            @select="dropdownSelect">
                            <span class="link-text">
                                {{ routeItem.meta.title }}
                            </span>
                        </n-dropdown>
                        <span class="link-text" v-else>
                            {{ routeItem.meta.title }}
                        </span>
                    </n-breadcrumb-item>
                </template>
            </n-breadcrumb>
        </div>
        <!-- 右侧菜单 -->
        <div class="layout-header-right">
            <transition name="fade" mode="out-in">
                <div class="search" v-if="state.isSearch">
                    <n-select ref="searchRef" v-model:value="state.searchValue" filterable placeholder="请选择或输入..."
                        :options="searchList" @blur="searchBlur" @update:value="searchUpdate" />
                </div>
                <div v-else>
                    <!-- 搜索 -->
                    <div class="layout-header-trigger" @click="() => state.isSearch = !state.isSearch">
                        <n-tooltip placement="bottom">
                            <template #trigger>
                                <n-icon class="n-icon" size="18">
                                    <SearchOutlined />
                                </n-icon>
                            </template>
                            <span>搜索</span>
                        </n-tooltip>
                    </div>
                    <!-- Github地址 -->
                    <div class="layout-header-trigger" @click="openUrl('http://baidu.com')">
                        <n-tooltip placement="bottom">
                            <template #trigger>
                                <n-icon class="n-icon" size="18">
                                    <GithubFilled />
                                </n-icon>
                            </template>
                            <span>Github地址</span>
                        </n-tooltip>
                    </div>
                    <!--QQ群-->
                    <div class="layout-header-trigger" @click="openUrl('http://baidu.com')">
                        <n-tooltip placement="bottom">
                            <template #trigger>
                                <n-icon class="n-icon" size="18">
                                    <QqCircleFilled />
                                </n-icon>
                            </template>
                            <span>加入QQ群</span>
                        </n-tooltip>
                    </div>
                    <!--切换全屏-->
                    <div class="layout-header-trigger" @click="toggleFullScreen">
                        <n-tooltip placement="bottom">
                            <template #trigger>
                                <n-icon class="n-icon" size="18">
                                    <FullscreenOutlined v-if="!state.isFullscreen" />
                                    <FullscreenExitOutlined v-else />
                                </n-icon>
                            </template>
                            <span>全屏</span>
                        </n-tooltip>
                    </div>
                </div>
            </transition>
            <!-- 个人中心 -->
            <n-dropdown trigger="hover" @select="avatarSelect" :options="avatarOptions" :show-arrow="true">
                <div class="layout-header-trigger userInfo">
                    <div class="avatar">
                        <n-avatar :size="32" round :src="state.userInfo.avatar || avatarPath">
                        </n-avatar>
                    </div>
                    <div class="name">
                        <n-gradient-text gradient="linear-gradient(90deg, red 0%, green 50%, blue 100%)">
                            {{ state.userInfo.nickName }}
                        </n-gradient-text>
                    </div>
                    <n-icon class="n-icon avatar-icon">
                        <MoreOutlined />
                    </n-icon>
                </div>
            </n-dropdown>
        </div>
    </div>
</template>
<style scoped>
.layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    height: 64px;
    box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
    transition: all 0.2s ease-in-out;
    width: 100%;
    z-index: 11;
}

.layout-header-left {
    display: flex;
    align-items: center;
}

.layout-header-right {
    display: flex;
    align-items: center;
}

.layout-header-trigger {
    display: inline-block;
    height: 64px;
    padding: 0 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    -webkit-transition: background .3s;
    transition: background .3s;
}

.layout-header-trigger:hover {
    background: #F8F8F8;
}

.ml-1 {
    margin-left: 0.25rem;
}

.mr-1 {
    margin-right: 0.25rem;
}

.n-icon {
    display: flex;
    align-items: center;
    height: 64px;
    line-height: 64px;
    font-size: 18px;
}

.avatar-icon {
    font-size: 18px;
}

.avatar {
    display: flex;
    align-items: center;
    height: 64px;
}

.userInfo {
    display: flex;
    align-items: center;
}

.name {
    margin-left: 10px;
}

.search {
    width: 160px;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

.fade-enter-active {
    transition: opacity 1.2s ease;
}
</style>