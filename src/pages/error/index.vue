<script setup>
import { NResult, NButton } from 'naive-ui'
import { useRouter } from 'vue-router';
const router = useRouter()
const goHome = () => {
    router.replace({ name: "index" })
}
</script>
<template>
    <div class="page">
        <n-result status="404" title="404 资源不存在" description="生活总归带点荒谬">
            <template #footer>
                <n-button @click="goHome">回家吧</n-button>
            </template>
        </n-result>
    </div>
</template>
<style scoped>
.page {
    width: 100%;
    border-radius: 4px;
    padding: 100px 0 50px 0;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>