<script setup>
import { computed, onMounted, ref, reactive, watch, nextTick, unref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Draggable from 'vuedraggable'
import { NIcon, NDropdown } from 'naive-ui'
import elementResizeDetectorMaker from 'element-resize-detector';
import {
    ReloadOutlined,
    CloseOutlined,
    ColumnWidthOutlined,
    MinusOutlined,
    LeftOutlined,
    RightOutlined,
} from '@vicons/antd'
import { PageEnum } from '@/common/page'
import { renderIcon } from '@/utils/tree'
const props = defineProps({
    // 侧边栏菜单是否收起
    collapsed: Boolean
})
const route = useRoute()
const router = useRouter()
const store = useStore()
const navScroll = ref(null)
const navWrap = ref(null)
const isCurrent = ref(null)
const state = reactive({
    activeKey: route.fullPath,
    scrollable: false,
    dropdownX: 0,
    dropdownY: 0,
    showDropdown: false,
    checkedItem: null
})

const tabsList = computed(() => store.getters['tabsView/tabsList']);

const getChangeStyle = computed(() => {
    // 菜单展开和缩进时宽度不一样
    if (props.collapsed) {
        return {
            // 减去左侧菜单的宽度和margin左右各10px
            width: `calc(calc(100% - 64px) - 20px)`
        }
    } else {
        return {
            // 减去左侧菜单的宽度和margin左右各10px
            width: `calc(calc(100% - 200px) - 20px)`
        }
    }
})
// 右键菜单触发
const handleContextMenu = (e, item) => {
    e.preventDefault();
    isCurrent.value = PageEnum.BASE_HOME_REDIRECT === item.path;
    state.showDropdown = false;
    nextTick().then(() => {
        state.showDropdown = true;
        state.dropdownX = e.clientX;
        state.dropdownY = e.clientY;
        state.checkedItem = item
    });
}
// tags右侧下拉菜单
const TabsMenuOptions = computed(() => {
    const isDisabled = unref(tabsList).length <= 1;
    return [
        {
            label: '刷新页面',
            key: '1',
            icon: renderIcon(ReloadOutlined),
        },
        {
            label: `关闭页面`,
            key: '2',
            disabled: unref(isCurrent) || isDisabled,
            icon: renderIcon(CloseOutlined),
        },
        {
            label: '关闭其他',
            key: '3',
            disabled: isDisabled,
            icon: renderIcon(ColumnWidthOutlined),
        },
        {
            label: '关闭全部',
            key: '4',
            disabled: isDisabled,
            icon: renderIcon(MinusOutlined),
        },
    ];
});
// tab操作
const closeHandleSelect = (key) => {
    switch (key) {
        //刷新
        case '1':
            reloadPage();
            break;
        //关闭
        case '2':
            removeTab(state.checkedItem);
            break;
        //关闭其他
        case '3':
            closeOther(state.checkedItem);
            break;
        //关闭所有
        case '4':
            closeAll();
            break;
    }
    updateNavScroll();
    state.showDropdown = false;
};
// 刷新页面
const reloadPage = () => {
    delKeepAliveCompName(state.checkedItem);
    router.push({
        path: '/redirect' + unref(state.checkedItem).fullPath,
    });
};
// 注入刷新页面方法
provide('reloadPage', reloadPage);
// 关闭页面
const removeTab = (route) => {
    if (tabsList.value.length === 1) return window['$message'].warning('这已经是最后一页，不能再关闭了！');
    delKeepAliveCompName(route)
    store.dispatch("tabsView/CloseCurrentTab", route)
    // 如果关闭的是当前页
    if (state.activeKey === route.fullPath) {
        const currentRoute = tabsList.value[Math.max(0, tabsList.value.length - 1)];
        state.activeKey = currentRoute.fullPath;
        router.push(currentRoute);
    }
    updateNavScroll();
};
// 关闭其他
const closeOther = (route) => {
    store.dispatch("tabsView/CloseOtherTabs", route);
    state.activeKey = route.fullPath;
    router.replace(route.fullPath);
    updateNavScroll();
};
// 关闭全部
const closeAll = () => {
    store.dispatch("tabsView/CloseAllTabs");
    router.replace(PageEnum.BASE_HOME);
    updateNavScroll();
};
// 跳转页面
const goPage = (e) => {
    const { fullPath } = e;
    if (fullPath === route.fullPath) return;
    state.activeKey = fullPath;
    router.push(fullPath)
}
// 关闭页面
const closeTabItem = (e) => {
    const { fullPath } = e;
    const routeInfo = tabsList.value.find((item) => item.fullPath == fullPath);
    removeTab(routeInfo);
}
// 移除缓存组件名称
const delKeepAliveCompName = (delRoute) => {
    if (delRoute.meta.keepAlive) {
        const keepAliveComponents = store.getters["route/keepAliveComponents"].filter(item => item != delRoute.name)
        store.dispatch("route/SetKeepAliveComponents", keepAliveComponents)
    }
};


// 滚动
const scrollTo = (value, amplitude) => {
    const currentScroll = navScroll.value.scrollLeft;
    const scrollWidth =
        (amplitude > 0 && currentScroll + amplitude >= value) ||
            (amplitude < 0 && currentScroll + amplitude <= value)
            ? value
            : currentScroll + amplitude;
    navScroll.value && navScroll.value.scrollTo(scrollWidth, 0);
    if (scrollWidth === value) return;
    return window.requestAnimationFrame(() => scrollTo(value, amplitude));
}
const scrollPrev = () => {
    const containerWidth = navScroll.value.offsetWidth;
    const currentScroll = navScroll.value.scrollLeft;

    if (!currentScroll) return;
    const scrollLeft = currentScroll > containerWidth ? currentScroll - containerWidth : 0;
    scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20);
}
const scrollNext = () => {
    const containerWidth = navScroll.value.offsetWidth;
    const navWidth = navScroll.value.scrollWidth;
    const currentScroll = navScroll.value.scrollLeft;

    if (navWidth - currentScroll <= containerWidth) return;
    const scrollLeft =
        navWidth - currentScroll > containerWidth * 2
            ? currentScroll + containerWidth
            : navWidth - containerWidth;
    scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20);
}
// 更新tab滚动
const updateNavScroll = async (autoScroll) => {
    await nextTick();
    if (!navScroll.value) return;
    const containerWidth = navScroll.value.offsetWidth;
    const navWidth = navScroll.value.scrollWidth;
    if (containerWidth < navWidth) {
        state.scrollable = true;
        if (autoScroll) {
            let tagList = navScroll.value.querySelectorAll('.tabs-card-scroll-item') || [];
            [...tagList].forEach((tag) => {
                // fix SyntaxError
                if (tag.id === `tag${state.activeKey.split('/').join('\/')}`) {
                    tag.scrollIntoView && tag.scrollIntoView();
                }
            });
        }
    } else {
        state.scrollable = false;
    }
}
// 处理调整
const handleResize = () => {
    updateNavScroll(true);
}
// 监听界面变动
const onElementResize = () => {
    let observer;
    observer = elementResizeDetectorMaker();
    observer.listenTo(navWrap.value, handleResize);
}
onMounted(() => {
    onElementResize();
});
// 监听当前路由
watch(
    () => route.fullPath,
    (to) => {
        state.activeKey = to;
        updateNavScroll(true);
    },
    { immediate: true }
);
</script>
<template>
    <div class="tabs-view" :style="getChangeStyle">
        <div class="tabs-view-main">
            <div ref="navWrap" class="tabs-card" :class="{ 'tabs-card-scrollable': state.scrollable }">
                <span class="tabs-card-prev" :class="{ 'tabs-card-prev-hide': !state.scrollable }" @click="scrollPrev">
                    <n-icon size="16" color="#515a6e">
                        <LeftOutlined />
                    </n-icon>
                </span>
                <span class="tabs-card-next" :class="{ 'tabs-card-next-hide': !state.scrollable }" @click="scrollNext">
                    <n-icon size="16" color="#515a6e">
                        <RightOutlined />
                    </n-icon>
                </span>
                <div ref="navScroll" class="tabs-card-scroll">
                    <Draggable :list="tabsList" item-key="fullPath" animation="300" class="flex">
                        <template #item="{ element }">
                            <div :id="`tag${element.fullPath.split('/').join('\/')}`" class="tabs-card-scroll-item"
                                :class="{ 'active-item': state.activeKey === element.path }"
                                @click.stop="goPage(element)" @contextmenu="handleContextMenu($event, element)">
                                <span>{{ element.meta.title }}</span>
                                <n-icon size="14" @click.stop="closeTabItem(element)" v-if="!element.meta.affix">
                                    <CloseOutlined />
                                </n-icon>
                            </div>
                        </template>
                    </Draggable>
                </div>
            </div>
            <n-dropdown :show="state.showDropdown" :x="state.dropdownX" :y="state.dropdownY"
                @clickoutside="state.showDropdown = false" placement="bottom-start" @select="closeHandleSelect"
                :options="TabsMenuOptions" />
        </div>
    </div>
</template>
<style scoped>
.tabs-view {
    width: 100%;
    padding: 6px 0;
    display: flex;
    transition: all 0.2s ease-in-out;
    position: fixed;
    z-index: 5;
    background: #f5f7f9;
}


.tabs-view-main {
    height: 32px;
    display: flex;
    max-width: 100%;
    min-width: 100%;
}

.tabs-card {
    -webkit-box-flex: 1;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    position: relative;

}

.tabs-card-scroll {
    white-space: nowrap;
    overflow: hidden;
}

.flex {
    display: flex;
}

.tabs-card-scroll-item {
    background: #FFFFFF;
    color: #0c0202;
    height: 32px;
    padding: 0px 16px;
    border-radius: 3px;
    margin-right: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.tabs-card-scroll-item:hover {
    color: #515a6e;
}

.active-item:hover {
    color: #2d8cf0;
}

.tabs-card-scroll-item>span {
    float: left;
    vertical-align: middle;
}

.n-icon {
    margin-right: -10px;
    vertical-align: middle;
    text-align: center;
    color: #808695;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.active-item {
    color: #2d8cf0;
}

.tabs-card-scrollable {
    padding: 0 32px;
    overflow: hidden;
}

.tabs-card-prev,
.tabs-card-next {
    width: 32px;
    text-align: center;
    position: absolute;
    line-height: 32px;
    cursor: pointer;
}

.tabs-card-prev {
    left: 0;
}

.tabs-card-next {
    right: 0;
}

.tabs-card-prev>.n-icon,
.tabs-card-next>.n-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
}

.tabs-card-next-hide,
.tabs-card-prev-hide {
    display: none;
}

.tabs-close {
    min-width: 32px;
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    background: var(--color);
    border-radius: 2px;
    cursor: pointer;
    /* margin-right: 10px; */
}

.tabs-close-btn {
    color: var(--color);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>