<script setup name="log">
import { h } from "vue";
import {
    NInput
} from 'naive-ui';
import { timeFormat } from '@/utils/time';
import Curd from '@/components/Curd/index.vue'
// 表格
const table = {
    dataAction: {
        url: "log/list",
    },
    perms: {
        del: ["sys:dict:del"],
    },
    columns: [
        {
            type: "selection",
            key: "id",
            align: "center",
        },
        {
            title: "用户名称",
            key: "username",
            align: "center",
        },
        {
            title: "IP地址",
            key: "ip",
            align: "center",
        },
        {
            title: "请求方法",
            key: "method",
            align: "center",
        },
        {
            title: "请求地址",
            key: "action",
            ellipsis: {
                tooltip: true,
            },
            align: "center",
        },
        {
            title: "响应状态",
            key: "statusCode",
            ellipsis: {
                tooltip: true,
            },
            align: "center",
        },
        {
            title: "请求参数",
            key: "params",
            ellipsis: {
                tooltip: true,
            },
            align: "center",
        },
        {
            title: "响应参数",
            key: "results",
            ellipsis: {
                tooltip: true,
            },
            align: "center",
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
    ]
}

const search = [{
    key: "method",
    value: "",
    label: "请求方法",
    render: h(NInput, {
        placeholder: "要搜索的请求方法"
    })
}, {
    key: "action",
    value: "",
    label: "请求地址",
    render: h(NInput, {
        placeholder: "要搜索的请求地址"
    })
}, {
    key: "ip",
    value: "",
    label: "客户端IP",
    render: h(NInput, {
        placeholder: "要搜索的客户端IP"
    })
}]
const del = {
    submitAction: {
        url: "log/del"
    }
}
</script>
<template>
    <div class="page">
        <Curd :table="table" :search="search" :del="del" />
    </div>
</template>
<style scoped>
</style>
