<script setup>
import { onMounted, reactive, watch } from 'vue'
import { NUpload } from 'naive-ui'
import { useStore } from 'vuex';
const store = useStore()
const props = defineProps({
    action: String,
    // 上传对象名 默认file
    name: {
        type: String,
        default: "file"
    },
    // 上传的文件数量限制  大于1自动开启图片多选
    max: {
        type: Number,
        default: undefined
    },
    type: {
        type: String,
        default: "admin"
    },
    // 上传的文件大小限制(MB)
    fileSize: {
        type: Number,
        default: 5
    },
    // 是否显示下载按钮
    showDownloadButton: {
        type: Boolean,
        default: false
    },
    // 是否显示删除按钮
    showRemoveButton: {
        type: Boolean,
        default: true
    },
    // 是否显示重试按钮
    showRetryButton: {
        type: Boolean,
        default: true
    },
    // 是否显示预览按钮
    showPreviewButton: {
        type: Boolean,
        default: true
    },
    // 默认的图片
    fileList: {
        type: Array,
        default: []
    }

})
// 定义派发事件
const emit = defineEmits(['update:ids', 'update:urls'])
const state = reactive({
    uploadImgUrl: `${import.meta.env.VITE_API}`,
    headers: {
        Authorization: `Bearer ${store.getters["user/token"]}`
    },
    fileList: [],
    ids: [],
    urls: [],
})
// 可上传的文件
const allowList = ["image/png", "image/jpeg", "image/jpg", "image/gif"]
// 限制文件上传
const beforeUpload = (data) => {
    if (!allowList.includes(data.file?.file?.type)) {
        window.$message.error("非法的图片格式,请重新上传");
        return false;
    }
    if (data.file?.file?.size / 1024 / 1024 > props.fileSize) {
        window.$message.error(`图片大小不能超过 ${props.fileSize} MB`);
        return false;
    }
    return true
}
// 上传结束的回调
const finish = ({ file, event }) => {
    const res = JSON.parse(event.target?.response)
    if (res.code == 1000) {
        window.$message.success(res.message);
        file.url = res.data.url
        state.ids.push(res.data.id)
        state.urls.push(res.data.url)
        emit("update:ids", state.ids)
        emit("update:urls", state.urls)
    } else {
        window.$message.error(res.message);
    }
    return file
}
// 上传错误的回调
const error = ({ file }) => {
    window.$message.error("上传失败,原因未知");
    return file
}
// 删除的回调
const remove = ({ file }) => {
    const fileIndex = state.fileList.map(f => f.url).indexOf(file.url);
    if (fileIndex > -1) {
        state.ids.splice(fileIndex, 1);
        state.urls.splice(fileIndex, 1);
        emit("update:ids", state.ids)
        emit("update:urls", state.urls)
    }
}
watch(() => props.fileList, (value) => {
    value.forEach(item => {
        state.fileList.push({
            id: item.id,
            name: "URL 测试",
            url: item.url,
            status: "finished"
        })
        state.ids.push(item.id)
        state.urls.push(item.url)
    })
}, {
    deep: true
})
</script>
<template>
    <n-upload :action="state.uploadImgUrl + props.action" :name="props.name" v-model:file-list="state.fileList"
        list-type="image-card" :max="props.max" :multiple="props.max > 1" :data="{ type: props.type }"
        :show-download-button="props.showDownloadButton" :show-remove-button="props.showRemoveButton"
        :show-retry-button="props.showRetryButton" :show-preview-button="props.showPreviewButton"
        accept="image/png,image/jpeg,image/jpg,image/gif" :headers="state.headers" @before-upload="beforeUpload"
        @finish="finish" @error="error" @remove="remove">
        点击上传
    </n-upload>
</template>
<style scoped>
</style>