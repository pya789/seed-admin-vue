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
        name: null,
        status: null
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
        name: null,
    }
    await submit()
}
</script>
<template>
    <div class="search">
        <n-grid :y-gap="16" :x-gap="20" cols="0 240:1 480:2 720:3 960:4 1200:5">
            <n-grid-item>
                <n-input-group>
                    <span class="search-input-label">角色名称</span>
                    <n-input v-model:value="state.form.name" placeholder="要搜索的角色名称" />
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

.search-btn-body {
    width: 170px;
    display: flex;
    justify-content: space-between;
}
</style>