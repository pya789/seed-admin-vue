<script setup>
import { reactive } from 'vue';
import {
    NSelect, NButton,
    NInputGroup, NGrid,
    NGridItem, NInput,
    NIcon
} from 'naive-ui'
import { SearchOutlined, ReloadOutlined } from '@vicons/antd'
const props = defineProps({
    refresh: Function,
    value: Object
})
const emit = defineEmits(["update:value"])
const state = reactive({
    form: {
        username: null,
        nickName: null,
        phone: null,
        status: null,
    },
    statusOptions: [{
        label: "正常",
        value: 0
    }, {
        label: "禁用",
        value: 1
    }],
})
const submit = async () => {
    emit("update:value", state.form)
    await props.refresh()
}
const reset = async () => {
    state.form = {
        username: null,
        nickName: null,
        phone: null,
        status: null,
    }
    await submit()
}
</script>
<template>
    <div class="search">
        <n-grid :y-gap="16" :x-gap="20" cols="0 240:1 480:2 720:3 960:4 1200:5">
            <n-grid-item>
                <n-input-group>
                    <span class="search-input-label">用户昵称</span>
                    <n-input v-model:value="state.form.nickName" placeholder="要搜索的用户昵称" />
                </n-input-group>
            </n-grid-item>
            <n-grid-item>
                <n-input-group>
                    <span class="search-input-label">用户帐号</span>
                    <n-input v-model:value="state.form.username" placeholder="要搜索的用户帐号" />
                </n-input-group>
            </n-grid-item>
            <n-grid-item>
                <n-input-group>
                    <span class="search-input-label">手机号码</span>
                    <n-input v-model:value="state.form.phone" placeholder="要搜索的手机号码" />
                </n-input-group>
            </n-grid-item>
            <n-grid-item>
                <n-input-group>
                    <span class="search-input-label">用户状态</span>
                    <n-select v-model:value="state.form.status" placeholder="选择用户状态" :options="state.statusOptions"
                        clearable />
                </n-input-group>
            </n-grid-item>
            <n-grid-item>
                <div class="search-btn-body">
                    <n-button type="info" @click="submit">
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
</template>
<style scoped>
.search {
    background-color: #fff;
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

.search-btn-body {
    width: 170px;
    display: flex;
    justify-content: space-between;
}
</style>