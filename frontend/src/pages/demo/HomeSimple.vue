<template>
  <div class="simple-home">
    <div class="simple-header">
      <div>
        <div class="simple-title">{{ invitation.babyName }} · 百日</div>
        <div class="simple-small">{{ invitation.date }} · {{ invitation.location }}</div>
      </div>
      <div>
        <button class="simple-btn simple-btn-ghost" @click="onToggleThemeClick">切换</button>
      </div>
    </div>

    <div class="simple-card" style="margin-top: 12px; text-align: center">
      <div class="simple-invitation-baby">👶</div>
      <div style="margin-top: 12px; font-weight: 700; font-size: 20px">
        {{ invitation.babyName }} 百日 · 乔迁同庆
      </div>
      <div class="simple-small" style="margin-top: 6px">{{ invitation.date }}</div>
      <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center">
        <router-link to="/demo/invitation">
          <button class="simple-btn simple-btn-primary" @click="onEnterInviteClick">进入请帖</button>
        </router-link>
        <router-link to="/demo/gallery">
          <button class="simple-btn simple-btn-ghost">相册</button>
        </router-link>
      </div>
    </div>

    <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px">
      <router-link to="/demo/guest" class="simple-card" style="text-align: center">登记来宾</router-link>
      <router-link to="/demo/gallery" class="simple-card" style="text-align: center">相册</router-link>
      <router-link to="/demo/admin" class="simple-card" style="text-align: center">管理</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const invitation = reactive({
  babyName: '屹琛小朋友',
  date: '2026-01-10 12:08',
  location: '祁阳鑫利大酒店四楼1号会议厅'
})

function onToggleThemeClick() {
  const current = document.documentElement.getAttribute('data-theme')
  if (current === 'dark') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('baby_theme', 'light')
  } else {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('baby_theme', 'dark')
  }
}

function onEnterInviteClick() {
  // no-op; kept for compliance
}
</script>

<style scoped>
.simple-home {
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

.simple-title {
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  font-size: 18px;
  color: var(--text-primary);
}

.simple-small {
  font-size: 13px;
  color: var(--text-secondary);
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

.simple-invitation-baby {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: radial-gradient(circle at 30% 20%, rgba(255, 240, 240, 0.6), transparent);
  box-shadow: 0 12px 36px rgba(201, 62, 46, 0.08);
}
</style>

