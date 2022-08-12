<script setup>
import { ref, reactive } from 'vue'
import {
    NIcon, NButton, NForm,
    NFormItem, NInput,
    NModal, NCard,
    NGrid, NGi,
    NTree, NSwitch
} from 'naive-ui'
import { useHttp } from '@/http';
import { generatorMenuSelectTree, generatorDeptTree } from '@/utils/tree'
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
        label: "",
        remark: "",
        relevance: 0,
        menuIds: [],
        deptIds: [],
    }
}
const state = reactive({
    show: false,
    form: initForm(),
    rules: {
        name: {
            required: true,
            message: "角色名称不能为空",
            trigger: "blur"
        },
        label: {
            required: true,
            message: "角色标识不能为空",
            trigger: "blur"
        }
    },
    disabled: true,
    menuList: [],
    menuPattern: "",
    deptList: [],
    deptPattern: "",
    indeterminateKeys: [],
    deptIndeterminateKeys: [],
    checkedKeys: [],
    deptCheckedKeys: [],
    deptRelevance: true,
})
// 提交
const sumbit = async (e) => {
    e.preventDefault();
    formRef.value?.validate(async errors => {
        if (!errors) {
            // 装入父级的id
            state.form.menuIds = []
            state.form.deptIds = []
            state.form.menuIds.push(...state.indeterminateKeys, ...state.checkedKeys)
            state.form.deptIds.push(...state.deptIndeterminateKeys, ...state.deptCheckedKeys)
            state.deptRelevance ? state.form.relevance = 0 : state.form.relevance = 1
            state.disabled = true
            const res = await http.post("role/update", state.form)
            window.$message.success(res.message)
            close()
            await props.refresh()
            state.disabled = false
        }
    })
}
// 获取信息
const getInfo = async (id) => {
    const info = await http.get("role/info", {
        params: { id: id }
    })
    state.form = info.data
    setKeys(info.data.menuIds)
    if (!info.data.relevance) {
        state.deptRelevance = true
        setDeptKeys(info.data.deptIds)
    } else {
        state.deptRelevance = false
        state.deptCheckedKeys = info.data.deptIds
    }

}
// 获得keys
const setKeys = (menuIds) => {
    // 憋了半天的算法获取选中ID组...算法大佬可以优化下
    const [arr, objArr] = generatorCheckedKeys(state.menuList, menuIds)
    // 这里还要处理下加上已全选的父级ID
    objArr.forEach(item => {
        if (item.cap == item.len) {
            arr.push(item.name)
        }
    })
    state.checkedKeys = arr
    // 利用排除法反取父级被部分选中的ID组
    state.indeterminateKeys = generatorIndeterminateKeys(menuIds)
}
// 获得keys
const setDeptKeys = (deptIds) => {
    // 憋了半天的算法获取选中ID组...算法大佬可以优化下
    const [arr, objArr] = generatorCheckedKeys(state.deptList, deptIds)
    // 这里还要处理下加上已全选的父级ID
    objArr.forEach(item => {
        if (item.cap == item.len) {
            arr.push(item.name)
        }
    })
    state.deptCheckedKeys = arr
    // 利用排除法反取父级被部分选中的ID组
    state.deptIndeterminateKeys = generatorDeptIndeterminateKeys(deptIds)
}
// 解析选中项
const generatorCheckedKeys = (List, Ids, arr = [], objArr = [], key = null) => {
    List.forEach(item => {
        if (item.children && item.children.length > 0) {
            objArr.push({
                name: item.key,
                cap: item.children.length,
                len: 0
            })
            generatorCheckedKeys(item.children, Ids, arr, objArr, item.key)
        } else {
            if (Ids.includes(item.key)) {
                arr.push(item.key)
            }
        }
        if (Ids.includes(item.key)) {
            objArr.forEach(obj => {
                if (obj.name == key) {
                    obj.len++
                }
            })
        }
    })
    return [arr, objArr]
}
// 解析菜单部分选中项
const generatorIndeterminateKeys = (menuIds) => {
    const arr = []
    menuIds.forEach(item => {
        if (!state.checkedKeys.includes(item)) {
            arr.push(item)
        }
    })
    return arr
}
// 解析部门部分选中项
const generatorDeptIndeterminateKeys = (deptIds) => {
    const arr = []
    deptIds.forEach(item => {
        if (!state.deptCheckedKeys.includes(item)) {
            arr.push(item)
        }
    })
    return arr
}
// 打开
const open = async (id) => {
    state.show = true
    state.disabled = true
    const res = await http.get("menu/list")
    const dept = await http.get("dept/list")
    state.menuList = generatorMenuSelectTree(res.data)
    state.deptList = generatorDeptTree(dept.data)
    await getInfo(id)
    state.disabled = false
}
// 关闭
const close = () => {
    state.checkedKeys = []
    state.indeterminateKeys = []
    state.deptCheckedKeys = []
    state.deptIndeterminateKeys = []
    state.form = initForm()
    state.show = false
}
defineExpose({
    open
})
</script>
<template>
    <n-modal v-model:show="state.show" @after-leave="close" :auto-focus="false">
        <n-card title="新增角色" style="max-width: 600px;" preset="card" role="dialog">
            <template #header-extra>
                <n-icon size="24" @click="close">
                    <CloseOutline />
                </n-icon>
            </template>
            <n-form ref="formRef" :disabled="state.disabled" label-placement="left" :label-width="80"
                :model="state.form" :rules="state.rules">
                <n-grid x-gap="12" :cols="2">
                    <n-gi>
                        <n-form-item label="角色名称" path="name">
                            <n-input v-model:value="state.form.name" placeholder="请输入角色名称" />
                        </n-form-item>
                    </n-gi>
                    <n-gi>
                        <n-form-item label="角色标识" path="label">
                            <n-input v-model:value="state.form.label" placeholder="请输入角色标识" />
                        </n-form-item>
                    </n-gi>
                </n-grid>
                <n-form-item label="备注" path="remark">
                    <n-input type="textarea" v-model:value="state.form.remark" placeholder="请输入备注" />
                </n-form-item>
                <n-form-item label="菜单权限">
                    <div class="auth">
                        <n-input v-model:value="state.menuPattern" placeholder="搜索" />
                        <n-tree class="tree" :data="state.menuList" block-line :pattern="state.menuPattern" checkable
                            expand-on-click :cascade="true" v-model:indeterminate-keys="state.indeterminateKeys"
                            v-model:checked-keys="state.checkedKeys" />
                    </div>
                </n-form-item>
                <n-form-item label="数据权限">
                    <div class="auth">
                        <div class="function">
                            <n-input style="width: 75%;" v-model:value="state.deptPattern" placeholder="搜索" />
                            <n-switch v-model:value="state.deptRelevance" :round="false">
                                <template #checked>
                                    父子联动
                                </template>
                                <template #unchecked>
                                    父子联动
                                </template>
                            </n-switch>
                        </div>
                        <n-tree class="tree" :data="state.deptList" block-line :pattern="state.deptPattern" checkable
                            expand-on-click :cascade="state.deptRelevance"
                            v-model:indeterminate-keys="state.deptIndeterminateKeys"
                            v-model:checked-keys="state.deptCheckedKeys" />
                    </div>
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

.function {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.auth {
    width: 100%;
}

.tree {
    margin-top: 10px;
    border: 1px solid rgb(224, 224, 230);
    border-radius: 3px;
    padding: 4px 2px;
}

.checkbox {
    display: flex;
    align-items: center;
}
</style>