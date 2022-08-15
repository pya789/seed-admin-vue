<script setup name="user" lang="jsx">
import { h, onMounted, reactive, ref, watch } from 'vue'
import {
    NIcon, NButton,
    NDataTable, NTooltip,
    NTag, NSelect, NImage
} from 'naive-ui';
import {
    PlusOutlined, EditOutlined,
    DeleteOutlined, ReloadOutlined,
    LeftOutlined, RightOutlined,
    InteractionOutlined
} from '@vicons/antd'
import { useHttp } from '@/http';
import { timeFormat } from '@/utils/time';
import { getDict, getLabel } from "@/utils/dict";
import { generatorRoleTree } from '@/utils/tree'
import { checkPerms } from "@/utils/auth";
import avatarPath from "/src/assets/images/avatar.jpeg";
import Search from './components/search.vue'
import Add from './components/add.vue'
import Edit from './components/edit.vue'
import Move from './components/move.vue'
import DeptTree from './components/deptTree.vue'
const addRef = ref()
const editRef = ref()
const moveRef = ref()
const http = useHttp()
const columnsHandle = () => {
    const actionButton = (row) => {
        return [
            checkPerms(["sys:user:move"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "warning",
                size: "small",
                onClick: () => {
                    const ids = [row.id]
                    openMove(ids)
                }
            }, {
                icon: () => h(NIcon, null, { default: () => h(InteractionOutlined) }),
                default: () => "转移"
            }) : null,
            checkPerms(["sys:user:update"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "info",
                size: "small",
                onClick: () => editRef.value.open(row.id)
            }, {
                icon: () => h(NIcon, null, { default: () => h(EditOutlined) }),
                default: () => "编辑"
            }) : null,
            checkPerms(["sys:user:del"]) ? h(NButton, {
                strong: true,
                tertiary: true,
                type: "error",
                size: "small",
                onClick: () => {
                    window.$dialog.info({
                        title: '提示',
                        content: `您确定要删除用户'${row.username}'吗?`,
                        positiveText: '确定',
                        negativeText: '取消',
                        onPositiveClick: () => {
                            const ids = [row.id]
                            del(ids)
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
        type: "selection",
        key: "id",
        align: "center",
    },
    {
        title: "头像",
        key: "avatar",
        align: "center",
        render(row) {
            return h("div", { style: "display: flex;justify-content:center;" }, [
                h(NImage, { width: 28, height: 28, src: row.avatar || avatarPath }, { default: () => { } })
            ])
        }
    },
    {
        title: "用户昵称",
        key: "nickName",
        align: "center",
    },
    {
        title: "用户帐号",
        key: "username",
        align: "center",
    },
    {
        title: "部门名称",
        key: "deptName",
        align: "center"
    },
    {
        title: "角色",
        key: "roleIds",
        width: "220",
        render(row) {
            let roleIds = []
            if (row.roleIds != "") {
                roleIds = row.roleIds.split(",").map(i => parseInt(i)).sort()
            }
            let id = row.id
            return h(
                <NSelect defaultValue={roleIds} options={roleState.list}
                    multiple={true} size="small" maxTagCount="responsive"
                    placeholder="选择角色" onUpdateValue={async (ids) => {
                        roleState.id = row.id
                        roleState.roleIds = ids
                        if (roleState.show == false) {
                            await editRole(id, ids)
                        } else {
                            roleIds = ids
                        }
                    }} onUpdateShow={async (is) => {
                        if (is) {
                            roleState.show = true
                        } else {
                            roleState.show = false
                            await editRole(id, roleIds)
                        }
                    }} />
            )
        }
    },
    {
        title: "手机号码",
        key: "phone",
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
    },
    {
        title: "创建时间",
        key: "createdTime",
        ellipsis: {
            tooltip: true
        },
        render(row) {
            return h("span", null, {
                default: () => timeFormat(row.createdTime)
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
    foldShow: false,
    delDisabled: true,
    moveDisabled: true,
    checkedRowIds: [],
    list: [],
    columns: columnsHandle(),
    rowKey: (row) => row.id,
    loading: false,
    deptId: [],
    tableHeight: 0
})
const roleState = reactive({
    id: null,
    roleIds: [],
    list: [],
    show: false
})

const paginationState = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 40, 80],
})
const searchState = reactive({
    form: {},
})
const fold = () => {
    state.foldShow = !state.foldShow;
}
// 部门树选中
const selectedKeys = async (e) => {
    state.deptId = e
    await refresh()
}

// 打开新增
const openAdd = (id) => {
    addRef.value.open(id)
}
// 打开移动
const openMove = (ids) => {
    moveRef.value.open(ids)
}
// 删除选中
const checkedDel = async () => {
    window.$dialog.info({
        title: '提示',
        content: `此操作将删除选中的用户您确定吗?`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            del(state.checkedRowIds)
        },
        onNegativeClick: () => { },
    });
}
// 修改角色
const editRole = async (id, ids) => {
    const res = await http.post("user/updateUserRole", {
        id: id,
        roleIds: ids
    })
    window.$message.success(res.message)
    await refresh()
}
// 删除
const del = async (ids) => {
    const res = await http.post("user/del", {
        ids: ids
    })
    window.$message.success(res.message)
    await refresh()
}
// 分页更新
const updatePage = async (e) => {
    paginationState.page = e
    await getList()
}
// 分页大小更新
const updatePageSize = async (e) => {
    paginationState.pageSize = e
    await getList()
}
const refresh = async () => {
    paginationState.page = 1
    paginationState.itemCount = 0
    await getDict("sys_common_status")
    await getList()
    state.checkedRowIds = []
}
const getList = async () => {
    state.loading = true
    const res = await http.post("user/list", {
        deptId: state.deptId,
        pageNum: paginationState.page,
        pageSize: paginationState.pageSize,
        ...searchState.form,
    })
    const role = await http.get("role/list", {
        params: {
            pageNum: 1,
            pageSize: 999,
        }
    })
    roleState.list = generatorRoleTree(role.data.list)
    state.loading = false
    state.list = res.data.list
    paginationState.itemCount = res.data.count
}
// 监听宽度
const watchWidth = () => {
    const Width = document.body.clientWidth;
    if (Width <= 950) {
        state.foldShow = true;
    } else {
        state.foldShow = false;
    }
};

// 按钮是否可操作
watch(
    () => state.checkedRowIds,
    (value) => {
        if (value.length == 0) {
            state.moveDisabled = true
            state.delDisabled = true
        } else {
            state.moveDisabled = false
            state.delDisabled = false
        }
    }
);

onMounted(async () => {
    watchWidth()
    window.addEventListener('resize', watchWidth);
    await refresh()
})
</script>
<template>
    <div class="page">
        <div class="container">
            <div class="dept-container" v-perms="['sys:dept:list']" :class="state.foldShow ? 'fold-hide' : ''">
                <div class="title">
                    <span>部门管理</span>
                </div>
                <DeptTree @update:selected-keys="selectedKeys" @update:openAdd="openAdd" />
            </div>
            <div class="user-container">
                <div class="search-container">
                    <div class="title user-title">
                        <div class="fold" @click="fold">
                            <n-tooltip>
                                <template #trigger>
                                    <n-icon size="22">
                                        <LeftOutlined v-if="state.foldShow == false" />
                                        <RightOutlined v-if="state.foldShow == true" />
                                    </n-icon>
                                </template>
                                <span v-if="state.foldShow == false">折叠</span>
                                <span v-if="state.foldShow == true">展开</span>
                            </n-tooltip>
                        </div>
                        <span>用户列表</span>
                    </div>
                    <Search :refresh="refresh" v-model:value="searchState.form" />
                    <!-- 间隔条处理隐藏显示tree露出的问题 -->
                    <div class="space"></div>
                </div>
                <div class="table-container">
                    <div class="table-btn-container">
                        <div>
                            <n-button class="btn-left" type="info" @click="openAdd()" v-perms="['sys:user:add']">
                                <template #icon>
                                    <n-icon>
                                        <PlusOutlined />
                                    </n-icon>
                                </template>
                                新增
                            </n-button>
                            <n-button class="btn-left" type="error" :disabled="state.delDisabled" @click="checkedDel"
                                v-perms="['sys:user:del']">
                                <template #icon>
                                    <n-icon>
                                        <DeleteOutlined />
                                    </n-icon>
                                </template>
                                删除
                            </n-button>
                            <n-button class="btn-left" type="warning" :disabled="state.moveDisabled"
                                @click="openMove(state.checkedRowIds)" v-perms="['sys:user:move']">
                                <template #icon>
                                    <n-icon>
                                        <InteractionOutlined />
                                    </n-icon>
                                </template>
                                转移
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
                    <n-data-table :scroll-x="1500" :columns="state.columns" :data="state.list" :row-key="state.rowKey"
                        :loading="state.loading" :pagination="paginationState" remote @update:page="updatePage"
                        @update:page-size="updatePageSize" v-model:checked-row-keys="state.checkedRowIds" />
                </div>
                <Add ref="addRef" :refresh="refresh" />
                <Edit ref="editRef" :refresh="refresh" />
                <Move ref="moveRef" :refresh="refresh" />
            </div>
        </div>
    </div>
</template>
<style scoped>
.page {
    display: flex;
}

.container {
    width: 100%;
    display: flex;
}

.space {
    padding-bottom: 10px;
    background: #f5f7f9;
}

.dept-container {
    background-color: #FFFFFF;
    min-width: 25%;
    margin-right: 10px;
    transition: min-width 0.3s;
    display: flex;
    flex-direction: column;
}

.user-container {
    min-width: calc(75% - 10px);
    z-index: 1;
}

.fold-hide {
    min-width: 0%;
    margin-right: 0px;
}

.title {
    background-color: #fff;
    padding: 10px 10px 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
}

.user-title {
    justify-content: flex-start;
}

.fold {
    padding: 0 10px 0 0;
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
