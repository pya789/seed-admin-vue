<script setup>
import {
  NConfigProvider, zhCN, dateZhCN
} from "naive-ui";
import { loadWindowFunc } from "@/common/loadWindowFunc"
import { themeOverrides } from "@/common/themeOverrides"
// Api挂载到window 可自行添加
loadWindowFunc()
</script>
<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <router-view></router-view>
  </n-config-provider>
</template>

<style>
@import "@/assets/css/index.css";
</style>
