<script  setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHttp } from '@/http'
import { UserOutlined, LockOutlined, SecurityScanOutlined } from '@vicons/antd';
import { useStore } from 'vuex';
import { NForm, NFormItem, NInput, NIcon, NButton, NSpace, NSwitch } from 'naive-ui'
const router = useRouter()
const route = useRoute()
const http = useHttp()
const store = useStore()
const title = import.meta.env.VITE_TITLE
const formRef = ref()
const loading = ref(false)
const rules = {
    username: { required: true, message: '请输入帐号', trigger: 'blur' },
    password: { required: true, message: '请输入密码', trigger: 'blur' },
    captcha: { required: true, message: '请输入验证码', trigger: 'blur' },
};
const state = reactive({
    form: {
        username: "",
        password: "",
        captcha: "",
    },
    captcha: {
        id: "",
        image: "data:image/png;base64,"
    }
})
// 验证码
const captcha = async () => {
    const res = await http.get("user/captcha", {
        params: {
            captchaId: state.captcha.id || null
        }
    })
    state.captcha.id = res?.data.id
    state.captcha.image = `data:image/png;base64,${res?.data.image}`
}
// 登录
const login = async (e) => {
    e.preventDefault()
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            window.$message.loading("登陆中...")
            loading.value = true
            state.form.captchaId = state.captcha.id
            try {
                const res = await http.post("user/login", state.form)
                window.$message.destroyAll();
                window.$message.success(res?.message);
                // 设置中央状态
                store.commit("user/setToken", res.data.token)
                const toPath = decodeURIComponent(route.query?.redirect || '/');
                if (route.name == 'login') {
                    router.replace("/");
                } else router.replace(toPath);
            } catch (err) {
                if (err?.code == 1002) {
                    state.captcha.id = ""
                    await captcha()
                }
            } finally {
                loading.value = false
            }
        }
    })

}
onMounted(async () => {
    await captcha()
})
</script> 
<template>
    <div class="pages">
        <div class="content">
            <div class="account">
                <div class="account-logo">
                    <img src="@/assets/logo.png" width="80" height="80" />
                </div>
                <span class="account-title">{{ title }}</span>
            </div>
            <div class="login-form">
                <n-form ref="formRef" :model="state.form" :rules="rules" label-placement="left" size="large">
                    <n-form-item path="username">
                        <n-input type="text" v-model:value="state.form.username" placeholder="请输入帐号" :maxlength="18">
                            <template #prefix>
                                <n-icon size="22" color="#808695">
                                    <UserOutlined />
                                </n-icon>
                            </template>
                        </n-input>
                    </n-form-item>
                    <n-form-item path="password">
                        <n-input type="password" v-model:value="state.form.password" show-password-on="mousedown"
                            placeholder="请输入密码" :maxlength="18">
                            <template #prefix>
                                <n-icon size="22" color="#808695">
                                    <LockOutlined />
                                </n-icon>
                            </template>
                        </n-input>
                    </n-form-item>
                    <n-form-item path="captcha">
                        <n-input type="text" v-model:value="state.form.captcha" placeholder="请输入验证码" :maxlength="12">
                            <template #prefix>
                                <n-icon size="22" color="#808695">
                                    <SecurityScanOutlined />
                                </n-icon>
                            </template>
                        </n-input>
                        <div class="captcha" @click="captcha">
                            <img height="40" :src="state.captcha.image" />
                        </div>
                    </n-form-item>
                    <n-form-item>
                        <n-button class="login-button" type="info" :loading="loading" @click="login">登录</n-button>
                    </n-form-item>
                </n-form>
            </div>
        </div>
    </div>
</template>
<style scoped>
.pages {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url(../../assets/login/login.jpeg);
    background-size: cover;
}

.content {
    width: 380px;
    background-color: #ffffff;
    padding: 20px;
}

.account {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.account-logo {
    width: 80px;
    height: 80px;
}

.account-title {
    margin-top: 20px;
    font-size: 14px;
    color: #808695;
}

.login-form {
    margin-top: 20px;
}

.captcha {
    height: 38px;
    margin-left: 10px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
}

.captcha:hover {
    border: 1px solid var(--primary-color-hover);
}

.captcha:active {
    border: 1px solid var(--border-color);
}

.login-button {
    width: 100%;
}
</style>