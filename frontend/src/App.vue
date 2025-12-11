<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { ThemeManager } from './utils/theme'

onMounted(() => {
  // 初始化主题
  ThemeManager.init()
})
</script>

<style>
/* 全局样式已在 style.css 中导入 */
</style>

