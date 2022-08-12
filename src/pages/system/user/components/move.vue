<script setup>
import { ref, reactive } from 'vue'
import {
    NIcon, NButton, NForm,
    NFormItem,
    NModal, NCard,
    NTreeSelect
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
        ids: [],
        deptId: "",
    }
}
const state = reactive({
    show: false,
    form: initForm(),
    rules: {
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
            const res = await http.post("user/move", state.form)
            window.$message.success(res.message)
            close()
            await props.refresh()
            state.disabled = false
        }
    })
}
// 打开
const open = async (ids) => {
    state.show = true
    state.disabled = true
    const res = await http.get("dept/list")
    state.deptList = generatorDeptTree(res.data)
    state.form.ids = ids
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
        <n-card title="选择部门" style="max-width: 600px;" preset="card" role="dialog">
            <template #header-extra>
                <n-icon size="24" @click="close">
                    <CloseOutline />
                </n-icon>
            </template>
            <n-form ref="formRef" :disabled="state.disabled" label-placement="left" :label-width="80"
                :model="state.form" :rules="state.rules">
                <n-form-item label="归属部门" path="deptId">
                    <n-tree-select :options="state.deptList" placeholder="请选择归属部门" v-model:value="state.form.deptId" />
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