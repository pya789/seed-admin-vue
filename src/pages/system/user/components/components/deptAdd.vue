<script setup>
import { ref, reactive } from 'vue'
import {
    NIcon, NButton, NForm,
    NFormItem, NInput,
    NInputNumber, NTreeSelect,
    NModal, NCard,
} from 'naive-ui'
import { useHttp } from '@/http';
import { generatorDeptTree } from '@/utils/tree'
import { CloseOutline } from '@vicons/ionicons5'
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
        name: "",
        parentId: "",
        sort: 0,
    }
}
const state = reactive({
    show: false,
    form: initForm(),
    rules: {
        name: {
            required: true,
            message: "部门名称不能为空",
            trigger: "blur"
        },
    },
    deptList: [],
    disabled: true,
})

// 提交
const sumbit = async (e) => {
    e.preventDefault();
    formRef.value?.validate(async errors => {
        if (!errors) {
            state.disabled = true
            const res = await http.post("dept/add", state.form)
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
    state.form.parentId = id
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
        <n-card title="新增部门" style="max-width: 600px;" preset="card" role="dialog">
            <template #header-extra>
                <n-icon size="24" @click="close">
                    <CloseOutline />
                </n-icon>
            </template>
            <n-form ref="formRef" :disabled="state.disabled" label-placement="left" :label-width="80"
                :model="state.form" :rules="state.rules">
                <n-form-item label="部门名称" path="name">
                    <n-input v-model:value="state.form.name" placeholder="请输入部门名称" />
                </n-form-item>
                <n-form-item label="归属部门" path="parentId">
                    <n-tree-select :options="state.deptList" placeholder="请选择归属部门" v-model:value="state.form.parentId"
                        disabled />
                </n-form-item>
                <n-form-item label="排序" path="sort">
                    <n-input-number v-model:value="state.form.sort" placeholder="请输入排序" />
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