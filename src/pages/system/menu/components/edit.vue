<script setup>
import { ref, reactive } from 'vue'
import {
    NSelect, NIcon,
    NButton, NForm,
    NFormItem, NInput,
    NModal, NCard, NRadioGroup,
    NRadioButton, NTreeSelect,
    NInputNumber, NSwitch,
    NGrid, NGi
} from 'naive-ui'
import { useHttp } from '@/http';
import { findFiles } from '@/utils/file'
import { generatorMenuSelectTree } from '@/utils/tree'
import { CloseOutline } from '@vicons/ionicons5'
import Icon from './components/icon.vue'
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
        type: 0,
        parentId: 0,
        name: "",
        routerName: "",
        routerPath: "",
        pagePath: null,
        perms: "",
        icon: null,
        sort: null,
        visible: 0,
        keepAlive: 0,
        status: 0,
    }
}
// 类型列表
const typeList = [{
    value: 0,
    label: "目录"
}, {
    value: 1,
    label: "菜单"
}, {
    value: 2,
    label: "按钮"
}]
const state = reactive({
    show: false,
    form: initForm(),
    rules: {
        name: {
            required: true,
            message: "菜单名称不能为空",
            trigger: "blur"
        },
        path: {
            required: true,
            message: "路由地址不能为空",
            trigger: "blur"
        },
    },
    parentList: [
        {
            label: "顶级菜单",
            key: 0,
            children: []
        },
    ],
    pageList: [],
    disabled: true,
})
// 提交
const sumbit = async (e) => {
    e.preventDefault();
    formRef.value?.validate(async errors => {
        if (!errors) {
            state.disabled = true
            switch (state.form.type) {
                case 0:
                    delete state.form.pagePath
                    delete state.form.perms
                    delete state.form.keepAlive
                    break;
                case 1:
                    break;
                case 2:
                    delete state.form.path
                    delete state.form.pagePath
                    delete state.form.icon
                    delete state.form.keepAlive
                    delete state.form.status
                    break;
            }
            const res = await http.post("menu/update", state.form)
            window.$message.success(res.message)
            close()
            await props.refresh()
            state.disabled = false
        }
    })
}
// 获取菜单信息
const getInfo = async (id) => {
    const info = await http.get("menu/info", {
        params: { id: id }
    })
    state.form = info.data
}
// 打开
const open = async (id) => {
    state.show = true
    state.disabled = true
    state.pageList = findFiles()
    const res = await http.get("menu/list")
    state.parentList[0].children = generatorMenuSelectTree(res.data)
    await getInfo(id)
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
        <n-card title="编辑菜单" style="max-width: 600px;" preset="card" role="dialog">
            <template #header-extra>
                <n-icon size="24" @click="close">
                    <CloseOutline />
                </n-icon>
            </template>
            <n-form ref="formRef" :disabled="state.disabled" label-placement="left" :label-width="80"
                :model="state.form" :rules="state.rules">
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="菜单类型" path="type">
                            <n-radio-group v-model:value="state.form.type">
                                <n-radio-button v-for="item in typeList" :key="item.value" :value="item.value"
                                    :label="item.label">
                                </n-radio-button>
                            </n-radio-group>
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="上级菜单" path="parentId">
                            <n-tree-select :options="state.parentList" filterable placeholder="请选择上级菜单"
                                v-model:value="state.form.parentId" :default-value="state.form.parentId">
                            </n-tree-select>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="菜单名称" path="name">
                            <n-input v-model:value="state.form.name" placeholder="请输入菜单名称" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="排序" path="sort">
                            <n-input-number v-model:value="state.form.sort" placeholder="请输入排序号" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-form-item label="路由名称" path="routerName" v-if="state.form.type == 0 || state.form.type == 1">
                    <n-input v-model:value="state.form.routerName" placeholder="路由名称 例如：menu" />
                </n-form-item>
                <n-form-item label="路由地址" path="routerPath" v-if="state.form.type == 0 || state.form.type == 1">
                    <n-input v-model:value="state.form.routerPath" placeholder="路由地址 例如：/system/menu" />
                </n-form-item>
                <n-form-item label="页面地址" path="pagePath" v-if="state.form.type == 1">
                    <n-select v-model:value="state.form.pagePath" filterable placeholder="选择页面文件"
                        :options="state.pageList" clearable />
                </n-form-item>
                <n-form-item label="权限字符" path="perms" v-if="state.form.type == 1 || state.form.type == 2">
                    <n-input v-model:value="state.form.perms" placeholder="请输入权限字符" />
                </n-form-item>
                <n-form-item label="图标" path="icon" v-if="state.form.type == 0 || state.form.type == 1">
                    <Icon v-model:value="state.form.icon" />
                </n-form-item>
                <n-grid x-gap="12" :cols="2">
                    <n-gi v-if="state.form.type == 1">
                        <n-form-item label="缓存" path="keepAlive">
                            <n-switch v-model:value="state.form.keepAlive" :round="false" :checked-value=1
                                :unchecked-value=0>
                                <template #checked>
                                    <span>开启</span>
                                </template>
                                <template #unchecked>
                                    <span>关闭</span>
                                </template>
                            </n-switch>
                        </n-form-item>
                    </n-gi>
                    <n-gi v-if="state.form.type == 0 || state.form.type == 1">
                        <n-form-item label="显示状态" path="visible">
                            <n-switch v-model:value="state.form.visible" :round="false" :checked-value=1
                                :unchecked-value=0>
                                <template #checked>
                                    <span>隐藏</span>
                                </template>
                                <template #unchecked>
                                    <span>显示</span>
                                </template>
                            </n-switch>
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-form-item label="菜单状态" path="status" v-if="state.form.type == 0 || state.form.type == 1">
                    <n-switch v-model:value="state.form.status" :round="false" :checked-value=1 :unchecked-value=0>
                        <template #checked>
                            <span>禁用</span>
                        </template>
                        <template #unchecked>
                            <span>正常</span>
                        </template>
                    </n-switch>
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
</style>