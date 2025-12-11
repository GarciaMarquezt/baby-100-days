<template>
  <div class="simple-admin">
    <div class="simple-header">
      <div style="font-weight: 700">管理中心（移动端）</div>
    </div>
    <div class="simple-card" style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px">
      <router-link to="/demo/gallery">
        <button class="simple-btn simple-btn-ghost">管理相册</button>
      </router-link>
      <router-link to="/demo/gallery">
        <button class="simple-btn simple-btn-ghost">审核留言</button>
      </router-link>
      <button class="simple-btn simple-btn-primary" @click="onExportClick">导出名单 (CSV)</button>
    </div>
  </div>
</template>

<script setup>
function onExportClick() {
  alert('示例导出：请对接后端导出接口')
}
</script>

<style scoped>
.simple-admin {
  padding: 12px;
  min-height: 100vh;
  background: var(--bg);
}

.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: env(safe-area-inset-top);
}

.simple-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-soft);
}

.simple-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  padding: 0 16px;
  height: 44px;
  border: 1px solid var(--gold);
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
}

.simple-btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 8px 18px rgba(201, 62, 46, 0.14);
}

.simple-btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>

