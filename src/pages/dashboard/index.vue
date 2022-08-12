<script setup>
import { onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from "vue-router";
import { NAvatar, NCard, NGrid, NGi, NIcon } from 'naive-ui'
import avatarPath from "/src/assets/images/avatar.jpeg";
import { MinusSquareOutlined, FundProjectionScreenOutlined, BookOutlined } from '@vicons/antd'
const store = useStore()
const router = useRouter()
const state = reactive({
    userInfo: {}
})
const getTimeState = () => {
    let timeNow = new Date();
    let hours = timeNow.getHours();
    let text = ``;
    if (hours >= 0 && hours <= 6) {
        text = `夜深了，${state.userInfo.nickName || null}，请注意休息哦`;
    } else if (hours >= 6 && hours <= 10) {
        text = `早上好，${state.userInfo.nickName || null}，来一杯咖啡，开始您一天的工作吧`;
    } else if (hours > 10 && hours <= 14) {
        text = `中午好，${state.userInfo.nickName || null}，午餐要吃好喝好哦`;
    } else if (hours > 14 && hours <= 18) {
        text = `下午好，${state.userInfo.nickName || null}，饮茶时间到了`;
    } else if (hours > 18 && hours <= 24) {
        text = `晚上好，${state.userInfo.nickName || null}，加班也要注意身体哦`;
    }
    return text;
}
const shortcuts = [{
    label: "操作日志",
    icon: MinusSquareOutlined,
    name: "log",
    color: '#FF9966',
}, {
    label: "系统监控",
    icon: FundProjectionScreenOutlined,
    name: "server",
    color: '#336666',
}, {
    label: "字典管理",
    icon: BookOutlined,
    name: "dict",
    color: '#3366CC',
}]
const go = (name) => {
    router.push({ name: name })
}
onMounted(async () => {
    state.userInfo = store.getters['user/userInfo']
})
</script>
<template>
    <div class="page">
        <div class="welcome card">
            <div>
                <n-avatar round :size="70" bordered :src="state.userInfo.avatar || avatarPath" />
            </div>
            <div class="welcome-title-container">
                <span class="welcome-text">{{ getTimeState() }}</span>
                <div class="welcome-info">
                    <span v-for="item, index in state.userInfo.roleNames" :key="index">
                        {{ index == 0 ? item : ' / ' + item }}
                    </span>
                </div>
                <div class="welcome-info">
                    <span>
                        {{ state.userInfo.deptName }}
                    </span>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="shortcuts">
                <n-card title="快捷导航" :bordered="false">
                    <n-grid cols="2 400:3 600:4 800:5 1000:6">
                        <n-gi class="shortcuts-item" v-for="item, index in shortcuts" :key="index"
                            @click="go(item.name)">
                            <n-icon size="40" :color="item.color">
                                <component :is="item.icon" />
                            </n-icon>
                            <span style="margin-top: 6px;">{{ item.label }}</span>
                        </n-gi>
                    </n-grid>
                </n-card>
            </div>
            <div class="card dashboard-img-container">
                <img class="dashboard-img" src="/src/assets/images/dashboard.svg" alt="">
            </div>
        </div>
    </div>
</template>
<style scoped>
.page {
    display: flex;
    width: 100%;
    flex-direction: column;
}

.welcome {
    display: flex;
    align-items: center;
    width: 100%;
}

.welcome-title-container {
    display: flex;
    flex-direction: column;
    margin-left: 20px;
}

.welcome-text {
    font-size: 20px;
    font-weight: 400;
}

.welcome-info {
    color: rgba(0, 0, 0, .45);
}



.card {
    padding: 20px;
    background-color: #FFFFFF;
}

.dashboard-img {
    width: 100%;
}

.content {
    margin-top: 10px;
    display: flex;
}

.shortcuts {
    width: 50%;
    margin-right: 10px;
}

.dashboard-img-container {
    flex: 1;
}

.shortcuts-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    color: rgb(107, 114, 128);
}

.shortcuts-item:hover {
    box-shadow: 0 0 7px 1px rgba(0, 0, 0, 0.08);
}
</style>