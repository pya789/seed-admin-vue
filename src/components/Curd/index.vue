
<script setup name="dict">
import { ref, reactive, watch, onMounted, h } from "vue";
import {
    NIcon, NButton, NDataTable, NTooltip, NInputGroup, NGrid,
    NGridItem, NModal, NCard, NForm, NFormItem,
} from 'naive-ui';
import {
    PlusOutlined, SearchOutlined,
    DeleteOutlined, ReloadOutlined,
    EditOutlined
} from '@vicons/antd'

import {
    CloseOutline
} from '@vicons/ionicons5'
import { useHttp } from "@/http";
import { getDict } from "@/utils/dict";
import { checkRoles, checkPerms } from "@/utils/auth";
const props = defineProps({
    table: {
        type: Object,
        default: {
            dataAction: {
                url: "",
                params: {}
            },
            dicts: [],
            perms: {},
            roles: {},
            columns: Array,
            columnsJoinButton: Function
        }
    },
    search: {
        type: Array,
        default: []
    },
    add: {
        type: Object,
        default: {
            form: [],
            submitAction: {
                url: "",
                params: {}
            }
        }
    },
    edit: {
        type: Object,
        default: {
            form: [],
            infoAction: {
                url: "",
                params: {}
            },
            submitAction: {
                url: "",
                params: {}
            }
        }
    },
    del: {
        type: Object,
        default: {
            submitAction: {
                url: "",
                params: {}
            }
        }
    }
})
const http = useHttp();
// 获取表单的节点
const addRef = ref();
const editRef = ref()
const authState = reactive({
    add: true,
    info: true,
    edit: true,
    del: true
})
const checkAuth = () => {
    // add权限验证
    if (props.table?.roles?.add) {
        if (!checkRoles(props.table?.roles?.add)) {
            authState.add = false
        }
    }
    if (props.table?.perms?.add) {
        if (!checkPerms(props.table?.perms?.add)) {
            authState.add = false
        }
    }
    if (props.add?.submitAction?.url == "") {
        authState.add = false
    }
    // info权限验证
    if (props.table?.roles?.info) {
        if (!checkRoles(props.table?.roles?.info)) {
            authState.info = false
        }
    }
    if (props.table?.perms?.info) {
        if (!checkPerms(props.table?.perms?.info)) {
            authState.info = false
        }
    }
    // edit权限验证
    if (props.table?.roles?.edit) {
        if (!checkRoles(props.table?.roles?.edit)) {
            authState.edit = false
        }
    }
    if (props.table?.perms?.edit) {
        if (!checkPerms(props.table?.perms?.edit)) {
            authState.edit = false
        }
    }
    if (props.edit?.submitAction?.url == "") {
        authState.edit = false
    }
    // del权限验证
    if (props.table?.roles?.del) {
        if (!checkRoles(props.table?.roles?.del)) {
            authState.del = false
        }
    }
    if (props.table?.perms?.del) {
        if (!checkPerms(props.table?.perms?.del)) {
            authState.del = false
        }
    }
    if (props.del?.submitAction?.url == "") {
        authState.del = false
    }
}
const columnsHandle = () => {
    checkAuth()
    const columns = props.table.columns
    const columnsJoinButton = (row) => props.table?.columnsJoinButton ? props.table?.columnsJoinButton(row) : []
    const actionButton = (row) => {
        return [
            ...columnsJoinButton(row),
            authState.edit ? h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    type: "info",
                    size: "small",
                    onClick: () => editOpen(row.id),
                },
                {
                    icon: () => h(NIcon, null, { default: () => h(EditOutlined) }),
                    default: () => "编辑",
                }
            ) : null,
            authState.del ? h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    type: "error",
                    size: "small",
                    onClick: () => {
                        window.$dialog.info({
                            title: "提示",
                            content: `您确定要删除此项吗?`,
                            positiveText: "确定",
                            negativeText: "取消",
                            onPositiveClick: () => {
                                const ids = [row.id];
                                del(ids);
                            },
                            onNegativeClick: () => { },
                        });
                    },
                },
                {
                    icon: () => h(NIcon, null, { default: () => h(DeleteOutlined) }),
                    default: () => "删除",
                }
            ) : null,
        ]
    }
    // 计算action宽度
    const actionWidth = 90 * (actionButton().filter(item => item != null).length)
    columns.push(
        {
            title: "操作",
            key: "action",
            width: actionWidth,
            render(row) {
                return h(
                    "div",
                    { style: "width:100%;display:flex;justify-content:space-around;" },
                    [...actionButton(row)]
                );
            },
        }
    )
    return columns
}
const tableState = reactive({
    delDisabled: true,
    columns: columnsHandle(),
    checkedRowIds: [],
    list: [],
    rowKey: (row) => row.id,
    loading: false,
});

// 删除选中
const checkedDel = async () => {
    window.$dialog.info({
        title: "提示",
        content: `此操作将删除选中项您确定吗?`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: () => {
            del(tableState.checkedRowIds);
        },
        onNegativeClick: () => { },
    });
};
// 删除
const del = async (ids) => {
    const res = await http.post(props.del.submitAction.url, {
        ids: ids,
        ...props.del.submitAction.params
    });
    window.$message.success(res.message);
    await refresh();
};
const initAddForm = () => {
    const res = {}
    props.add.form.forEach(item => {
        res[item.key] = item.value
    })
    return res
}
const addState = reactive({
    show: false,
    form: initAddForm(),
    disabled: true,
});
// 表单提交
const addSumbit = async (e) => {
    e.preventDefault();
    addRef.value?.validate(async (errors) => {
        if (!errors) {
            addState.disabled = true;
            const res = await http.post(props.add.submitAction.url, {
                ...addState.form,
                ...props.add.submitAction.params
            });
            window.$message.success(res.message);
            addClose();
            await refresh();
            addState.disabled = false;
        }
    });
};
// 打开
const addOpen = async () => {
    addState.show = true;
    addState.disabled = true;
    addState.disabled = false;
};
// 关闭
const addClose = () => {
    addState.form = initAddForm();
    addState.show = false;
};
const initEditForm = () => {
    const res = {}
    props.edit.form.forEach(item => {
        res[item.key] = item.value
    })
    return res
}
const editState = reactive({
    show: false,
    form: initEditForm(),
    disabled: true,
});
// 表单提交
const editSumbit = async (e) => {
    e.preventDefault();
    editRef.value?.validate(async (errors) => {
        if (!errors) {
            editState.disabled = true;
            const res = await http.post(props.edit.submitAction.url, {
                ...editState.form,
                ...props.edit.submitAction.params
            });
            window.$message.success(res.message);
            editClose();
            await refresh();
            editState.disabled = false;
        }
    });
};
// 打开
const editOpen = async (id) => {
    if (authState.info) {
        editState.show = true;
        editState.disabled = true;
        const info = await http.get(props.edit.infoAction.url, {
            params: {
                id: id,
                ...props.edit.infoAction.params
            }
        })
        editState.form = info.data
        editState.disabled = false;
    } else {
        window.$message.error("您没有获取INFO的权限")
    }

};
// 关闭
const editClose = () => {
    editState.form = initEditForm();
    editState.show = false;
};
const searchState = reactive({
    form: {}
});
// 重置
const reset = async () => {
    props.search.forEach(item => {
        searchState.form[item.key] = item.value;
    })
    await refresh();
};
const paginationState = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 40, 80],
});
// 分页更新
const updatePage = async (e) => {
    paginationState.page = e;
    await getList();
};
// 分页大小更新
const updatePageSize = async (e) => {
    paginationState.pageSize = e;
    await getList();
};
// 获取表格数据
const getList = async () => {
    tableState.loading = true;
    const res = await http.get(props.table.dataAction.url, {
        params: {
            pageNum: paginationState.page,
            pageSize: paginationState.pageSize,
            ...searchState.form,
            ...props.table.dataAction.params
        },
    });
    tableState.loading = false;
    tableState.list = res.data.list;
    paginationState.itemCount = res.data.count;
};
// 刷新表格
const refresh = async () => {
    paginationState.page = 1;
    paginationState.itemCount = 0;
    tableState.checkedRowIds = [];
    if (props.table.dicts && props.table.dicts?.length > 0) {
        props.table.dicts.forEach(async (item) => {
            await getDict(item)
        })
    }
    await getList();

};
// 按钮是否可操作
watch(
    () => tableState.checkedRowIds,
    (value) => {
        if (value.length == 0) {
            tableState.delDisabled = true;
        } else {
            tableState.delDisabled = false;
        }
    }
);


onMounted(async () => {
    await refresh()
})
</script>
<template>
    <div class="page">
        <div class="search" v-if="props.search.length > 0">
            <n-grid :y-gap="16" :x-gap="20" cols="0 240:1 480:2 720:3 960:4 1200:5">
                <n-grid-item v-for="item in props.search">
                    <n-input-group>
                        <span class="search-input-label">{{ item.label }}</span>
                        <component :is="item.render" v-model:value="searchState.form[item.key]" />
                    </n-input-group>
                </n-grid-item>
                <n-grid-item>
                    <div class="search-btn-container">
                        <n-button type="info" @click="refresh">
                            <template #icon>
                                <n-icon>
                                    <SearchOutlined />
                                </n-icon>
                            </template>
                            查询
                        </n-button>
                        <n-button tertiary @click="reset">
                            <template #icon>
                                <n-icon>
                                    <ReloadOutlined />
                                </n-icon>
                            </template>
                            重置
                        </n-button>
                    </div>
                </n-grid-item>
            </n-grid>
        </div>
        <!-- 表格 -->
        <div class="table-container">
            <div class="table-btn-container">
                <div>
                    <n-button class="btn-left" type="info" @click="addOpen" v-if="authState.add">
                        <template #icon>
                            <n-icon>
                                <PlusOutlined />
                            </n-icon>
                        </template>
                        新增
                    </n-button>
                    <n-button class="btn-left" type="error" :disabled="tableState.delDisabled" @click="checkedDel"
                        v-if="authState.del">
                        <template #icon>
                            <n-icon>
                                <DeleteOutlined />
                            </n-icon>
                        </template>
                        删除
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
            <n-data-table :columns="tableState.columns" :data="tableState.list" :row-key="tableState.rowKey"
                :loading="tableState.loading" :pagination="paginationState" remote @update:page="updatePage"
                @update:page-size="updatePageSize" v-model:checked-row-keys="tableState.checkedRowIds" />
        </div>
        <!-- 新增 -->
        <div class="add">
            <n-modal v-model:show="addState.show" @after-leave="addClose" :auto-focus="false">
                <n-card :title="props.add.title" style="max-width: 600px;" preset="card" role="dialog">
                    <template #header-extra>
                        <n-icon size="24" @click="addClose">
                            <CloseOutline />
                        </n-icon>
                    </template>
                    <n-form ref="addRef" :disabled="addState.disabled" label-placement="left" :label-width="80"
                        :model="addState.form" :rules="props.add.rules">
                        <n-form-item :label="item.label" :path="item.key" v-for="item in props.add.form">
                            <component :is="item.render" v-model:value="addState.form[item.key]" />
                        </n-form-item>
                    </n-form>
                    <template #footer>
                        <div class="footer-btn">
                            <n-button type="info" @click="addSumbit">
                                保存
                            </n-button>
                            <n-button style="margin-left:16px;" @click="addClose">
                                取消
                            </n-button>
                        </div>
                    </template>
                </n-card>
            </n-modal>
        </div>
        <!-- 编辑 -->
        <div class="edit">
            <n-modal v-model:show="editState.show" @after-leave="editClose" :auto-focus="false">
                <n-card :title="props.edit.title" style="max-width: 600px;" preset="card" role="dialog">
                    <template #header-extra>
                        <n-icon size="24" @click="editClose">
                            <CloseOutline />
                        </n-icon>
                    </template>
                    <n-form ref="editRef" :disabled="editState.disabled" label-placement="left" :label-width="80"
                        :model="editState.form" :rules="props.edit.rules">
                        <n-form-item :label="item.label" :path="item.key" v-for="item in props.edit.form">
                            <component :is="item.render" v-model:value="editState.form[item.key]" />
                        </n-form-item>
                    </n-form>
                    <template #footer>
                        <div class="footer-btn">
                            <n-button type="info" @click="editSumbit">
                                保存
                            </n-button>
                            <n-button style="margin-left:16px;" @click="editClose">
                                取消
                            </n-button>
                        </div>
                    </template>
                </n-card>
            </n-modal>
        </div>
    </div>
</template>
<style scoped>
.page {
    height: 100%;
}

.search {
    background-color: #fff;
    margin-bottom: 10px;
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
}

.search-input-label {
    min-width: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 10px;

}

.search-btn-container {
    width: 170px;
    display: flex;
    justify-content: space-between;
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

.footer-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}
</style>
