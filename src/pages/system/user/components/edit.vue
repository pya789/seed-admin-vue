<script setup>
import { ref, reactive } from 'vue'
import {
    NIcon, NButton, NForm,
    NFormItem, NInput,
    NModal, NCard,
    NSwitch, NGrid, NGi,
    NTreeSelect, NSelect
} from 'naive-ui'
import { useHttp } from '@/http';
import { generatorDeptTree, generatorRoleTree } from '@/utils/tree'
import { CloseOutline } from '@vicons/ionicons5'
import Uploads from '@/components/Uploads/index.vue'
const http = useHttp()
// 获取表单的节点
const formRef = ref()
// 父组件给的数据和控制开关
const props = defineProps({
    refresh: Function,
})
// 初始化form值
const initForm = () => {
    return {
        username: "",
        nickName: "",
        deptId: "",
        password: "",
        phone: "",
        email: "",
        status: 0,
        avatar: "",
        roleIds: [],
    }
}
const state = reactive({
    show: false,
    form: initForm(),
    rules: {
        username: {
            required: true,
            message: "用户帐号不能为空",
            trigger: "blur"
        },
        nickName: {
            required: true,
            message: "用户昵称不能为空",
            trigger: "blur"
        },
        password: {
            required: true,
            message: "用户密码不能为空",
            trigger: "blur"
        }
    },
    deptList: [],
    roleList: [],
    fileList: [],
    disabled: true,
})
// 接收上传的urls
const urls = (u) => {
    state.form.avatar = u[0] || ""
}
// 获取信息
const getInfo = async (id) => {
    const info = await http.get("user/info", {
        params: { id: id }
    })
    state.form = info.data
    state.fileList = []
    info.data?.avatar != "" ? state.fileList.push({ id: info.data.id, url: info.data.avatar }) : ""
}
// 提交
const sumbit = async (e) => {
    e.preventDefault();
    formRef.value?.validate(async errors => {
        if (!errors) {
            state.disabled = true
            const res = await http.post("user/update", state.form)
            window.$message.success(res.message)
            close()
            await props.refresh()
            state.disabled = false
        }
    })
}
// 打开
const open = async (id) => {
    state.show = true
    state.disabled = true
    const res = await http.get("dept/list")
    state.deptList = generatorDeptTree(res.data)
    const role = await http.get("role/list", {
        params: {
            pageNum: 1,
            pageSize: 999,
        }
    })
    await getInfo(id)
    state.roleList = generatorRoleTree(role.data.list)
    state.disabled = false
}
// 关闭
const close = () => {
    state.form = initForm()
    state.show = false
}
defineExpose({
    open
})
</script>
<template>
    <n-modal v-model:show="state.show" @after-leave="close" :auto-focus="false">
        <n-card title="新增用户" style="max-width: 600px;" preset="card" role="dialog">
            <template #header-extra>
                <n-icon size="24" @click="close">
                    <CloseOutline />
                </n-icon>
            </template>
            <n-form ref="formRef" :disabled="state.disabled" label-placement="left" :label-width="80"
                :model="state.form" :rules="state.rules">
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="用户帐号" path="username">
                            <n-input v-model:value="state.form.username" placeholder="请输入用户帐号" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="用户昵称" path="nickName">
                            <n-input v-model:value="state.form.nickName" placeholder="请输入用户昵称" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="用户密码" path="password">
                            <n-input v-model:value="state.form.password" placeholder="请输入用户密码" type="password"
                                show-password-on="mousedown" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="归属部门" path="deptId">
                            <n-tree-select :options="state.deptList" placeholder="请选择归属部门"
                                v-model:value="state.form.deptId" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="手机号码" path="phone">
                            <n-input v-model:value="state.form.phone" placeholder="请输入手机号码" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="用户邮箱" path="email">
                            <n-input v-model:value="state.form.email" placeholder="请输入用户邮箱" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-form-item label="用户角色" path="roleIds">
                    <n-select v-model:value="state.form.roleIds" :options="state.roleList" multiple
                        max-tag-count="responsive" placeholder="请选择用户角色" />
                </n-form-item>
                <n-form-item label="用户状态" path="status">
                    <n-switch v-model:value="state.form.status" :round="false" :checked-value=1 :unchecked-value=0>
                        <template #checked>
                            <span>禁用</span>
                        </template>
                        <template #unchecked>
                            <span>正常</span>
                        </template>
                    </n-switch>
                </n-form-item>
                <n-form-item label="用户头像" path="avatar">
                    <Uploads :max="1" type="admin_avatar" :fileList="state.fileList" action="common/uploadImages"
                        @update:urls="urls" />
                </n-form-item>
            </n-form>

            <template #footer>
                <div class="footer-btn">
                    <n-button type="info" @click="sumbit">
                        保存
                    </n-button>
                    <n-button style="margin-left:16px;" @click="close">
                        取消
                    </n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<style scoped>
.footer-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.avatar-add {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FFFFFF;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
}

.avatar-add:hover {
    border: 1px solid #57a3f3;
}
</style>