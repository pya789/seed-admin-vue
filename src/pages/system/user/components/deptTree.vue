<script setup>
import { reactive, onMounted, ref } from 'vue'
import { NInput, NTree, NDropdown } from 'naive-ui'
import { generatorDeptTree } from '@/utils/tree'
import { useHttp } from '@/http';
import { renderIcon } from '@/utils/tree'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@vicons/antd'
import { checkPerms } from "@/utils/perms";
import DeptAdd from './components/deptAdd.vue'
import DeptEdit from './components/deptEdit.vue'
const deptAddRef = ref()
const deptEditRef = ref()
const http = useHttp()
const emit = defineEmits(["update:selectedKeys", "update:openAdd"])
const dropdownList = [{
    label: "新增",
    key: "0",
    icon: renderIcon(PlusOutlined),
    disabled: !checkPerms(["sys:dept:add"])
},
{
    label: "编辑",
    key: "1",
    icon: renderIcon(EditOutlined),
    disabled: !checkPerms(["sys:dept:update"])
},
{
    label: "删除",
    key: "2",
    icon: renderIcon(DeleteOutlined),
    disabled: !checkPerms(["sys:dept:del"])
},
{
    label: "新增用户",
    key: "3",
    icon: renderIcon(UserAddOutlined),
    disabled: !checkPerms(["sys:user:add"])
}]

const state = reactive({
    list: [],
    pattern: "",
})
const rightClickState = reactive({
    show: false,
    x: 0,
    y: 0,
    id: null,
    sid: [],
    list: []
})
// 右键选中
const handleSelect = async (e) => {
    const id = rightClickState.id
    switch (e) {
        case "0":
            deptAddRef.value.open(id)
            break;
        case "1":
            deptEditRef.value.open(id)
            break;
        case "2":
            const ids = [id, ...rightClickState.sid]
            await delDept(id, ids)
            break;
        case "3":
            emit("update:openAdd", id)
            break;
    }
    rightClickState.show = false
}
const nodeProps = (info) => {
    return {
        style: "padding:6px 0;align-items: center;font-size:14px;",
        onContextmenu(e) {
            // 清空子ID
            rightClickState.sid = []
            if (info.option?.children && info.option?.children.length > 0) {
                const keys = getKeys(info.option?.children)
                rightClickState.sid = keys
            }
            // 屏蔽默认事件
            e.preventDefault();
            rightClickState.list = dropdownList
            rightClickState.show = true;
            rightClickState.x = e.clientX;
            rightClickState.y = e.clientY;
            rightClickState.id = info.option.key
            rightClickState.label = info.option.label
        }
    }
}
// 删除部门
const delDept = async (pid, ids) => {
    window.$dialog.info({
        title: '警告',
        content: `该操作会删除'${rightClickState.label}'及其子部门下辖用户,请您选择是否保留用户?`,
        positiveText: '直接删除',
        negativeText: '保留用户',
        onPositiveClick: async () => {
            await del(true)
        },
        onNegativeClick: async () => {
            await del(false)
        },
    });
    const del = async (is) => {
        if (pid == 1) {
            window.$message.error("顶级部门不可删除。想咩呢？")
            return
        }
        await http.post("dept/del", {
            pid: pid,
            ids: ids,
            userDel: is
        })
        if (is) {
            window.$message.success("删除部门成功,用户已移动到上级部门")
        } else {
            window.$message.success("删除部门成功")
        }
        await getList()
        return
    }
}
// 
const drop = async (data) => {
    const form = {
        id: data.dragNode.key,
        name: data.dragNode.label,
        parentId: data.node.key
    }
    console.log(form);
    const res = await http.post("dept/update", form)
    window.$message.success(res.message)
    await getList()

}
// 选中的Keys
const selectedKeys = (e, option) => {
    const keys = getKeys(option)
    emit("update:selectedKeys", keys)
}
// 获取父子节点的id
const getKeys = (option, arr = []) => {
    option.forEach(item => {
        if (item.children && item.children.length > 0) {
            getKeys(item.children, arr)
        }
        arr.push(item.key)
    })
    return arr
}
const getList = async () => {
    const res = await http.get("dept/list")
    state.list = generatorDeptTree(res.data)
}
onMounted(async () => {
    await getList()
})
</script>
<template>
    <div class="dept-tree-container" @contextmenu="containerContextmenu">
        <n-input v-model:value="state.pattern" placeholder="搜索" />
        <n-tree class="tree" virtual-scroll draggable :cancelable="false" @update:selected-keys="selectedKeys"
            :node-props="nodeProps" :pattern="state.pattern" :data="state.list" @drop="drop" block-line
            default-expand-all />
        <n-dropdown trigger="manual" placement="bottom-start" :show="rightClickState.show"
            :options="rightClickState.list" :x="rightClickState.x" :y="rightClickState.y" @select="handleSelect"
            @clickoutside="rightClickState.show = false" />
        <DeptAdd ref="deptAddRef" :refresh="getList" />
        <DeptEdit ref="deptEditRef" :refresh="getList" />
    </div>
</template>
<style scoped>
.dept-tree-container {
    height: calc(100% - 60px);
    padding: 16px;
    display: flex;
    flex-direction: column;
}


.tree {
    margin-top: 10px;
}
</style>