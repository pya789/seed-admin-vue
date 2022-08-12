<script setup>
import { h } from "vue";
import { useRouter } from "vue-router";
import {
    NIcon, NButton,
    NTag,
    NInput,
    NSelect,
    NSwitch
} from 'naive-ui';
import {
    FileSearchOutlined
} from '@vicons/antd'
import { timeFormat } from '@/utils/time';
import { getLabel } from '@/utils/dict';
import Curd from '@/components/curd/index.vue'
const router = useRouter()
// 表格
const table = {
    dataAction: {
        url: "dict/list",
    },
    dicts: ["sys_common_status"],
    perms: {
        add: ["sys:dict:add"],
        info: ["sys:dict:info"],
        edit: ["sys:dict:update"],
        del: ["sys:dict:del"],
    },
    columns: [
        {
            type: "selection",
            key: "id",
            align: "center",
        },
        {
            title: "字典名称",
            key: "name",
            align: "center",
        },
        {
            title: "字典类型",
            key: "type",
            ellipsis: {
                tooltip: true,
            },
            align: "center",
        },
        {
            title: "状态",
            key: "status",
            align: "center",
            render(row) {
                return h(
                    NTag,
                    { bordered: false, type: "info" },
                    {
                        default: () => getLabel("sys_common_status", row.status)
                    }
                );
            },
        },
        {
            title: "创建时间",
            key: "createdTime",
            ellipsis: {
                tooltip: true,
            },
            render(row) {
                return h("span", null, {
                    default: () => timeFormat(row.createdTime),
                });
            },
        },
    ],
    columnsJoinButton: (row) => {
        return [
            h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    type: "tertiary",
                    size: "small",
                    onClick: () => {
                        router.push({
                            name: "dictDetails",
                            params: {
                                id: row.id
                            }
                        });
                    },
                },
                {
                    icon: () => h(NIcon, null, { default: () => h(FileSearchOutlined) }),
                    default: () => "详情",
                }
            ),
        ]
    }
}

const search = [{
    key: "name",
    value: "",
    label: "字典类型",
    render: h(NInput, {
        placeholder: "要搜索的字典类型"
    })
}, {
    key: "status",
    value: null,
    label: "字典状态",
    render: h(NSelect, {
        placeholder: "请选择字典状态",
        options: [
            {
                label: "正常",
                value: 0,
            },
            {
                label: "禁用",
                value: 1,
            },
        ]
    })
}]
const add = {
    submitAction: {
        url: "dict/add"
    },
    title: "新增字典",
    form: [{
        key: "name",
        value: "",
        label: "字典名称",
        render: h(NInput, {
            placeholder: "请输入字典名称"
        })
    }, {
        key: "type",
        value: "",
        label: "字典类型",
        render: h(NInput, {
            placeholder: "请输入字典类型"
        })
    }, {
        key: "status",
        value: 0,
        label: "字典状态",
        render: h(NSwitch, {
            round: false,
            checkedValue: 1,
            uncheckedValue: 0
        }, {
            checked: () => h("span", null, { default: () => "禁用" }),
            unchecked: () => h("span", null, { default: () => "正常" })
        })
    }],
    rules: {
        name: {
            required: true,
            message: "字典名称不能为空",
            trigger: "blur",
        },
        type: {
            required: true,
            message: "字典类型不能为空",
            trigger: "blur",
        },
    },
}
const edit = {
    infoAction: {
        url: "dict/info"
    },
    submitAction: {
        url: "dict/update"
    },
    title: "编辑字典",
    form: [{
        key: "name",
        value: "",
        label: "字典名称",
        render: h(NInput, {
            placeholder: "请输入字典名称"
        })
    }, {
        key: "type",
        value: "",
        label: "字典类型",
        render: h(NInput, {
            placeholder: "请输入字典类型"
        })
    }, {
        key: "status",
        value: 0,
        label: "字典状态",
        render: h(NSwitch, {
            round: false,
            checkedValue: 1,
            uncheckedValue: 0
        }, {
            checked: () => h("span", null, { default: () => "禁用" }),
            unchecked: () => h("span", null, { default: () => "正常" })
        })
    }],
    rules: {
        name: {
            required: true,
            message: "字典名称不能为空",
            trigger: "blur",
        },
        type: {
            required: true,
            message: "字典类型不能为空",
            trigger: "blur",
        },
    },
}
const del = {
    submitAction: {
        url: "dict/del"
    }
}
</script>
<template>
    <div class="page">
        <Curd :table="table" :search="search" :add="add" :edit="edit" :del="del" />
    </div>
</template>
<style scoped>
</style>
