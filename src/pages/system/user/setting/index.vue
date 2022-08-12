<script setup name="userSetting">
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex';
import { NGrid, NGi, NCard, NIcon, NEllipsis, NTabs, NTabPane, NForm, NFormItemRow, NInput, NButton } from 'naive-ui'
import { UserOutlined, MobileOutlined, MailOutlined, ApartmentOutlined, RobotOutlined } from '@vicons/antd'
import { useHttp } from '@/http'
import Uploads from '@/components/Uploads/index.vue'
const baseFormRef = ref()
const resetPasswordFormRef = ref()
const http = useHttp()
const store = useStore()
const state = reactive({
    userInfo: {},
    baseForm: {
        nickName: "",
        phone: "",
        email: "",
    },
    baseRules: {
        nickName: {
            required: true,
            message: "用户名称不能为空",
            trigger: "blur"
        },
    },
    baseLoading: false,
    resetPasswordForm: {
        oldPassword: "",
        newPassword: "",
        ReTypeNewPassword: "",
    },
    resetPasswordRules: {
        oldPassword: {
            required: true,
            message: "旧密码不能为空",
            trigger: "blur"
        },
        newPassword: {
            required: true,
            message: "新密码不能为空",
            trigger: "blur"
        },
        ReTypeNewPassword: {
            required: true,
            message: "请重复输入新密码",
            trigger: "blur"
        },
    },
    resetPasswordLoading: false,
    fileList: [],
    avatar: ""
})
// 接收上传的urls
const urls = async (u) => {
    state.avatar = u[0] || ""
    if (state.avatar != "") {
        const res = await http.post("user/updateAvatar", {
            url: state.avatar
        })
        window.$message.success(res.message);
        state.userInfo.avatar = state.avatar
        store.commit("user/setUserInfo", state.userInfo)
    }
}
const baseSubmit = async (e) => {
    e.preventDefault();
    baseFormRef.value?.validate(async errors => {
        if (!errors) {
            state.baseLoading = true
            const res = await http.post("user/updateBaseInfo", state.baseForm)
            state.userInfo.nickName = state.baseForm.nickName
            state.userInfo.phone = state.baseForm.phone
            state.userInfo.email = state.baseForm.email
            store.commit("user/setUserInfo", state.userInfo)
            window.$message.success(res.message)
            state.baseLoading = false
        }
    })
}
const resetPasswordSubmit = async (e) => {
    e.preventDefault();
    resetPasswordFormRef.value?.validate(async errors => {
        if (!errors) {
            if (state.resetPasswordForm.newPassword === state.resetPasswordForm.ReTypeNewPassword) {
                state.resetPasswordLoading = true
                try {
                    const res = await http.post("user/updatePassword", state.resetPasswordForm)
                    window.$message.success(res.message)
                    state.resetPasswordForm = {
                        oldPassword: "",
                        newPassword: "",
                        ReTypeNewPassword: "",
                    }
                } catch (error) { } finally {
                    state.resetPasswordLoading = false
                }
            } else {
                window.$message.error("重复输入的密码与新密码不相符")
            }
        }
    })
}
onMounted(async () => {
    state.userInfo = store.getters['user/userInfo']
    state.userInfo?.avatar != "" ? state.fileList.push({ id: state.userInfo.id, url: state.userInfo.avatar }) : ""
    state.baseForm.nickName = state.userInfo.nickName
    state.baseForm.phone = state.userInfo.phone
    state.baseForm.email = state.userInfo.email
})
</script>
<template>
    <div class="page">
        <n-grid x-gap="10" :cols="10">
            <n-gi span="3">
                <n-card title="个人信息" :bordered="false">
                    <div class="userInfo-container">
                        <div class="avatar">
                            <Uploads :max="1" type="admin_avatar" :fileList="state.fileList"
                                action="common/uploadImages" @update:urls="urls" />
                        </div>
                        <div class="list">
                            <div class="list-key">
                                <n-icon size="18">
                                    <UserOutlined />
                                </n-icon>
                                <span class="list-key-title">名称</span>
                            </div>
                            <span class="list-value">
                                <n-ellipsis>{{ state.userInfo.nickName || '无' }}</n-ellipsis>
                            </span>
                        </div>
                        <div class="list">
                            <div class="list-key">
                                <n-icon size="18">
                                    <MobileOutlined />
                                </n-icon>
                                <span class="list-key-title">手机号</span>
                            </div>
                            <span class="list-value">
                                <n-ellipsis>{{ state.userInfo.phone || '无' }}</n-ellipsis>
                            </span>
                        </div>
                        <div class="list">
                            <div class="list-key">
                                <n-icon size="18">
                                    <MailOutlined />
                                </n-icon>
                                <span class="list-key-title">邮箱</span>
                            </div>
                            <span class="list-value">
                                <n-ellipsis>{{ state.userInfo.email || '无' }}</n-ellipsis>
                            </span>
                        </div>
                        <div class="list">
                            <div class="list-key">
                                <n-icon size="18">
                                    <ApartmentOutlined />
                                </n-icon>
                                <span class="list-key-title">部门</span>
                            </div>
                            <span class="list-value">
                                <n-ellipsis>{{ state.userInfo.deptName || '无' }}</n-ellipsis>
                            </span>
                        </div>
                        <div class="list">
                            <div class="list-key">
                                <n-icon size="18">
                                    <RobotOutlined />
                                </n-icon>
                                <span class="list-key-title">角色</span>
                            </div>
                            <span class="list-value">
                                <n-ellipsis>
                                    <span v-for="item, index in state.userInfo.roleNames" :key="index">
                                        {{ index == 0 ? item : ' / ' + item }}
                                    </span>
                                </n-ellipsis>
                            </span>
                        </div>
                    </div>
                </n-card>
            </n-gi>
            <n-gi span="7">
                <n-card title="资料修改" :bordered="false">
                    <n-tabs class="tabs" default-value="signin" size="large" animated>
                        <n-tab-pane name="signin" tab="基础信息">
                            <n-form ref="baseFormRef" :model="state.baseForm" :rules="state.baseRules">
                                <n-form-item-row label="用户名称" path="nickName">
                                    <n-input v-model:value="state.baseForm.nickName" placeholder="请输入用户名称" />
                                </n-form-item-row>
                                <n-form-item-row label="手机号码" path="phone">
                                    <n-input v-model:value="state.baseForm.phone" placeholder="请输入用户手机号码" />
                                </n-form-item-row>
                                <n-form-item-row label="邮箱" path="email">
                                    <n-input v-model:value="state.baseForm.email" placeholder="请输入用户邮箱" />
                                </n-form-item-row>
                            </n-form>
                            <n-button type="primary" :loading="state.baseLoading" block secondary strong
                                @click="baseSubmit">
                                保存修改
                            </n-button>
                        </n-tab-pane>
                        <n-tab-pane name="signup" tab="修改密码">
                            <n-form ref="resetPasswordFormRef" :model="state.resetPasswordForm"
                                :rules="state.resetPasswordRules">
                                <n-form-item-row label="旧密码" path="oldPassword">
                                    <n-input type="password" show-password-on="click"
                                        v-model:value="state.resetPasswordForm.oldPassword" placeholder="请输入旧密码" />
                                </n-form-item-row>
                                <n-form-item-row label="新密码" path="newPassword">
                                    <n-input type="password" show-password-on="click"
                                        v-model:value="state.resetPasswordForm.newPassword" placeholder="请输入新密码" />
                                </n-form-item-row>
                                <n-form-item-row label="重复密码" path="ReTypeNewPassword">
                                    <n-input type="password" show-password-on="click"
                                        v-model:value="state.resetPasswordForm.ReTypeNewPassword"
                                        placeholder="请重复输入新密码" />
                                </n-form-item-row>
                            </n-form>
                            <n-button type="primary" :loading="state.resetPasswordLoading" block secondary strong
                                @click="resetPasswordSubmit">
                                修改密码
                            </n-button>
                        </n-tab-pane>
                    </n-tabs>
                </n-card>
            </n-gi>
        </n-grid>
    </div>
</template>
<style scoped>
.page {
    height: 100%;
}

.userInfo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar {
    padding: 20px 0;
}

.list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    margin-top: 12px;
}

.list-key {
    display: flex;
    align-items: center;
}

.list-key-title {
    margin-left: 4px;
}

.list-value {
    width: 50%;
    display: flex;
    justify-content: flex-end;
}

.tabs {
    padding: 0 10px 10px 10px;
    margin-top: -10px;
}
</style>