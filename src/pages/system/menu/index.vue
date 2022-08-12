<script setup lang="jsx">
import { h, onMounted, reactive, ref } from 'vue'
import {
    NIcon, NButton,
    NDataTable, NTooltip,
    NTag
} from 'naive-ui'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@vicons/antd'
import { useHttp } from '@/http';
import { generatorMenuListTree } from '@/utils/tree'
import { getDict, getLabel } from "@/utils/dict";
import { checkPerms } from "@/utils/perms";
import Search from './components/search.vue'
import Add from './components/add.vue'
import Edit from './components/edit.vue'
const addRef = ref()
const editRef = ref()
const http = useHttp()
const columnsHandle = () => {
    const actionButton = (row) => {
        return [
            checkPerms(["sys:menu:add"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "primary",
                size: "small",
                onClick: () => openAdd(row.id)
            }, {
                icon: () => h(NIcon, null, { default: () => h(PlusOutlined) }),
                default: () => "新增"
            }) : null,
            checkPerms(["sys:menu:update"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "info",
                size: "small",
                onClick: () => editOpen(row.id)
            }, {
                icon: () => h(NIcon, null, { default: () => h(EditOutlined) }),
                default: () => "编辑"
            }) : null,
            checkPerms(["sys:menu:del"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "error",
                size: "small",
                onClick: () => {
                    const ids = [row.id]
                    // 遍历下子项的ID一并删了
                    if (row.children?.length > 0) {
                        row.children.forEach(item => {
                            ids.push(item.id)
                        })
                    }
                    window.$dialog.info({
                        title: '提示',
                        content: `您确定要删除菜单'${row.title}'吗?`,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            delMenu(ids)
                        },
                        onNegativeClick: () => { },
                    });
                }
            }, {
                icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) }),
                default: () => "删除"
            }) : null]
    }
    const actionWidth = 90 * actionButton().filter(item => item != null).length
    const columns = [{
        title: "菜单名称",
        key: "label",
    },
    {
        title: "图标",
        key: "icon",
        align: "center",
        render(row) {
            return h("div", { style: "display:flex;align-items: center;justify-content: center;" }, [
                h(row.icon)
            ])
        }
    },
    {
        title: "类型",
        key: "type",
        align: "center",
        render(row) {
            return h(NTag, { bordered: false, type: "info" }, {
                default: () => getLabel("sys_menu_type", row.type)
            })
        }
    },
    {
        title: "是否隐藏",
        key: "visible",
        align: "center",
        render(row) {
            return h(NTag, { bordered: false, type: "info" }, {
                default: () => getLabel("sys_menu_visible", row.visible)
            })
        }
    },
    {
        title: "是否缓存",
        key: "keepAlive",
        align: "center",
        render(row) {
            return h(NTag, { bordered: false, type: "info" }, {
                default: () => getLabel("sys_page_keepAlive", row.keepAlive)
            })
        }
    },
    {
        title: "路由",
        key: "path",
    },
    {
        title: "文件路径",
        key: "component",
    },
    {
        title: "权限",
        key: "perms",
    },
    {
        title: "排序",
        key: "sort",
        align: "center",
    },
    {
        title: "状态",
        key: "status",
        align: "center",
        render(row) {
            return h(NTag, { bordered: false, type: "info" }, {
                default: () => getLabel("sys_common_status", row.status)
            })
        }
    }, {
        title: "操作",
        key: "action",
        width: actionWidth,
        fixed: "right",
        render(row) {
            return h("div", { style: "width:100%;display:flex;justify-content:space-around;" },
                [...actionButton(row)])
        },
    }]
    return columns
}
const state = reactive({
    list: [],
    columns: columnsHandle(),
    rowKey: (row) => row.id,
    loading: false,
})
const searchState = reactive({
    form: {},
})
// 打开新增
const openAdd = (id) => {
    addRef.value.open(id)
}
// 打开编辑
const editOpen = (id) => {
    editRef.value.open(id)
}
// 删除
const delMenu = async (ids) => {
    const res = await http.post("menu/del", {
        ids: ids
    })
    window.$message.success(res.message)
    await refresh()
}
const getList = async () => {
    state.loading = true
    const res = await http.get("menu/list", {
        params: searchState.form
    })
    state.loading = false
    state.list = generatorMenuListTree(res.data)
}
// 刷新数据
const refresh = async () => {
    await getDict("sys_menu_type")
    await getDict("sys_menu_visible")
    await getDict("sys_page_keepAlive")
    await getDict("sys_common_status")
    await getList()
}

onMounted(async () => {
    await refresh()
})
</script>
<template>
    <div class="page">
        <Search :refresh="refresh" v-model:value="searchState.form" />
        <div class="table-container">
            <div class="table-btn-container">
                <div>
                    <n-button class="btn-left" type="info" @click="openAdd(0)" v-perms="['sys:menu:add']">
                        <template #icon>
                            <n-icon>
                                <PlusOutlined />
                            </n-icon>
                        </template>
                        新增
                    </n-button>
                </div>
                <n-tooltip>
                    <template #trigger>
                        <n-icon class="refresh" size="22" @click="refresh">
                            <ReloadOutlined />
                        </n-icon>
                    </template>
                    <span>重载数据</span>
                </n-tooltip>
            </div>
            <n-data-table class="table" :scroll-x="1600" :columns="state.columns" :data="state.list"
                :row-key="state.rowKey" :indent="8" :loading="state.loading" />
        </div>
        <Add ref="addRef" :refresh="refresh" />
        <Edit ref="editRef" :refresh="refresh" />
    </div>
</template>
<style scoped>
.page {
    height: 100%;
}

.table-btn-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.btn-left {
    margin-left: 10px;
}

.btn-left:first-child {
    margin-left: 0px;
}

.table-container {
    background-color: #fff;
    padding: 16px;
}
</style>