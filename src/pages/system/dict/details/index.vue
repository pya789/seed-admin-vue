<script setup>
import { h } from "vue";
import { useRoute } from "vue-router";
import {
    NTag,
    NInput,
    NSelect,
    NSwitch
} from 'naive-ui';
import { timeFormat } from '@/utils/time';
import { getLabel } from '@/utils/dict';
import Curd from '@/components/curd/index.vue'
const route = useRoute()
// 表格
const table = {
    dataAction: {
        url: "dict/dataList",
        params: {
            pid: route.params.id
        }
    },
    dicts: ["sys_common_status"],
    perms: {
        add: ["sys:dict:details:add"],
        info: ["sys:dict:details:info"],
        edit: ["sys:dict:details:update"],
        del: ["sys:dict:details:del"],
    },
    columns: [
        {
            type: "selection",
            key: "id",
            align: "center",
        },
        {
            title: "字典标签",
            key: "label",
            align: "center",
        },
        {
            title: "字典值",
            key: "value",
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
        }
    ]
}

const search = [{
    key: "label",
    value: "",
    label: "字典标签",
    render: h(NInput, {
        placeholder: "要搜索的字典标签"
    })
}, {
    key: "status",
    value: "",
    label: "数据状态",
    render: h(NSelect, {
        placeholder: "请选择数据状态",
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
        url: "dict/dataAdd",
        params: {
            pid: Number(route.params.id)
        }
    },
    title: "新增字典数据",
    form: [{
        key: "label",
        value: "",
        label: "字典标签",
        render: h(NInput, {
            placeholder: "请输入字典标签"
        })
    }, {
        key: "value",
        value: "",
        label: "字典值",
        render: h(NInput, {
            placeholder: "请输入字典值"
        })
    }, {
        key: "status",
        value: 0,
        label: "状态",
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
        label: {
            required: true,
            message: "字典标签不能为空",
            trigger: "blur",
        },
        value: {
            required: true,
            message: "字典值不能为空",
            trigger: "blur",
        },
    },
}
const edit = {
    infoAction: {
        url: "dict/dataInfo"
    },
    submitAction: {
        url: "dict/dataUpdate"
    },
    title: "编辑字典数据",
    form: [{
        key: "label",
        value: "",
        label: "字典标签",
        render: h(NInput, {
            placeholder: "请输入字典标签"
        })
    }, {
        key: "value",
        value: "",
        label: "字典值",
        render: h(NInput, {
            placeholder: "请输入字典值"
        })
    }, {
        key: "status",
        value: 0,
        label: "状态",
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
        label: {
            required: true,
            message: "字典标签不能为空",
            trigger: "blur",
        },
        value: {
            required: true,
            message: "字典值不能为空",
            trigger: "blur",
        },
    },
}
const del = {
    submitAction: {
        url: "dict/dataDel"
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
