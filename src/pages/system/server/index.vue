<script setup>
import { h, onMounted, reactive, onBeforeUnmount } from 'vue'
import {
    NCard, NGrid, NGi, NEllipsis, NProgress, NSpin
} from 'naive-ui'
import { useHttp } from '@/http';
const http = useHttp()
const state = reactive({
    info: {},
    loadShow: true,
    timer: null
})
// 获取数据
const getInfo = async () => {
    try {
        const res = await http.get("server/info")
        state.info = res.data
    } catch (error) {
        clearInterval(state.timer)
        state.timer = null
    }
}
onMounted(async () => {
    await getInfo()
    state.timer = setInterval(async () => {
        await getInfo()
    }, 8000)
    state.loadShow = false
})
onBeforeUnmount(() => {
    clearInterval(state.timer)
    state.timer = null
})
</script>
<template>
    <n-spin :show="state.loadShow">
        <div class="page">
            <n-card title="服务">
                <n-grid x-gap="6" :cols="2">
                    <n-gi>
                        <div class="list">
                            <div class="item">
                                <span>语言</span>
                                <span>
                                    {{ state.info?.runtime?.language }}
                                </span>
                            </div>
                            <div class="item">
                                <span>平台版本</span>
                                <span>{{ state.info?.runtime?.version }}</span>
                            </div>
                        </div>
                    </n-gi>
                    <n-gi>
                        <div class="list">
                            <div class="item">
                                <span>启动时间</span>
                                <span>{{ state.info?.runtime?.startTime }}</span>
                            </div>
                            <div class="item">
                                <span>运行时间</span>
                                <span>{{ state.info?.runtime?.runtime }}</span>
                            </div>
                        </div>
                    </n-gi>
                </n-grid>
            </n-card>
            <n-grid x-gap="6" :cols="2" style="margin-top:6px;">
                <n-gi>
                    <n-card title="CPU">
                        <div class="list">
                            <div class="item">
                                <span>型号</span>
                                <span>
                                    <n-ellipsis>{{ state.info?.cpu?.name }}</n-ellipsis>
                                </span>
                            </div>
                            <div class="item">
                                <span>核心数</span>
                                <span>{{ state.info?.cpu?.cores }}</span>
                            </div>
                            <div class="item">
                                <span>使用率</span>
                                <span>
                                    <n-progress type="line" :percentage="state.info?.cpu?.percent" :border-radius="2"
                                        :fill-border-radius="0" />
                                </span>
                            </div>
                        </div>
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card title="系统">
                        <div class="list">
                            <div class="item">
                                <span>OS</span>
                                <span>
                                    {{ state.info?.host?.os }}
                                </span>
                            </div>
                            <div class="item">
                                <span>内核</span>
                                <span>{{ state.info?.host?.kernel }}</span>
                            </div>
                            <div class="item">
                                <span>运行时间</span>
                                <span>{{ state.info?.host?.runtime }}</span>
                            </div>
                        </div>
                    </n-card>
                </n-gi>
            </n-grid>
            <n-grid x-gap="6" :cols="2" style="margin-top:6px;">
                <n-gi>
                    <n-card title="内存">
                        <div class="list">
                            <div class="item">
                                <span>总量</span>
                                <span>
                                    {{ state.info?.ram?.total }}GB
                                </span>
                            </div>
                            <div class="item">
                                <span>已使用</span>
                                <span>{{ state.info?.ram?.used }}GB</span>
                            </div>
                            <div class="item">
                                <span>未使用</span>
                                <span>{{ state.info?.ram?.available }}GB</span>
                            </div>
                            <div class="item">
                                <span>使用率</span>
                                <span>
                                    <n-progress type="line" :percentage="state.info?.ram?.percent" :border-radius="2"
                                        :fill-border-radius="0" />
                                </span>
                            </div>
                        </div>
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card title="硬盘">
                        <div class="list">
                            <div class="item">
                                <span>总量</span>
                                <span>
                                    {{ state.info?.disk?.total }}GB
                                </span>
                            </div>
                            <div class="item">
                                <span>已使用</span>
                                <span>{{ state.info?.disk?.used }}GB</span>
                            </div>
                            <div class="item">
                                <span>未使用</span>
                                <span>{{ state.info?.disk?.available }}GB</span>
                            </div>
                            <div class="item">
                                <span>使用率</span>
                                <span>
                                    <n-progress type="line" :percentage="state.info?.disk?.percent" :border-radius="2"
                                        :fill-border-radius="0" />
                                </span>
                            </div>
                        </div>
                    </n-card>
                </n-gi>
            </n-grid>
        </div>
    </n-spin>
</template>
<style scoped>
.list {
    display: flex;
    flex-direction: column;
}

.item {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item>span {
    width: 50%;
}

.item:first-child {
    margin-top: 0px;
}
</style>