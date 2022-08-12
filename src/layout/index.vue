<script setup>
import { ref, onMounted } from 'vue'
import { Header, Menu, TagsView, Main, Logo, Footer } from './index'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutFooter, NLayoutContent } from 'naive-ui'
const collapsed = ref(false)
const watchWidth = () => {
    const Width = document.body.clientWidth;
    if (Width <= 950) {
        collapsed.value = true;
    } else collapsed.value = false;
};
onMounted(() => {
    watchWidth()
    window.addEventListener('resize', watchWidth);
});
</script>
<template>
    <div style="position: relative;height: 100vh;">
        <n-layout class="layout" has-sider position="absolute">
            <n-layout-sider class="layout-sider" bordered collapse-mode="width" :collapsed-width="64" :width="200"
                :collapsed="collapsed" :inverted="true" show-trigger="bar" :native-scrollbar="false"
                @collapse="collapsed = true" @expand="collapsed = false" position="absolute">
                <Logo :collapsed="collapsed"></Logo>
                <Menu :collapsed="collapsed"></Menu>
            </n-layout-sider>
            <n-layout>
                <n-layout-header class="layout-header" position="absolute">
                    <Header v-model:collapsed="collapsed"></Header>
                </n-layout-header>
                <n-layout-content class="layout-content">
                    <div class="layout-content-main">
                        <TagsView :collapsed="collapsed"></TagsView>
                        <div class="layout-main">
                            <Main></Main>
                        </div>
                    </div>
                </n-layout-content>
                <!-- footer暂时隐藏 -->
                <!-- <n-layout-footer class="layout-footer">
                    <Footer></Footer>
                </n-layout-footer>-->
            </n-layout>
        </n-layout>
    </div>
</template>
<style scoped>
.layout-sider {
    min-height: 100vh;
    box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
    position: relative;
    z-index: 13;
    transition: all 0.2s ease-in-out;
}

.layout-header {
    height: 64px;
}

.layout-content {
    flex: auto;
    min-height: 100vh;
    padding-top: 64px;
    background: #f5f7f9;
}

.n-layout-header.n-layout-header--absolute-positioned {
    z-index: 11;
}

.layout-content-main {
    margin: 0 10px 10px;
    position: relative;
    overflow-y: hidden;
    overflow-x: hidden;
}

.layout-main {
    padding-top: 44px;
}
</style>