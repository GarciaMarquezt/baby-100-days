<template>
  <div class="simple-invitation">
    <GoldParticles />
    <div class="simple-card" style="overflow: hidden; position: relative; padding: 18px; text-align: center">
      <div class="simple-invitation-baby">👶</div>
      <h2 class="simple-title" style="margin: 12px 0; font-family: serif">屹琛小朋友 · 百日·乔迁</h2>
      <p class="simple-small">双喜同庆 · 真诚敬邀</p>
      <div style="margin-top: 16px">
        <button class="simple-btn simple-btn-primary" @click="onOpenContentClick">开启请帖</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="show" style="margin-top: 12px">
        <div class="simple-card">
          <div style="text-align: center">
            <h3 class="simple-title">亲爱的家人朋友们：</h3>
            <p class="simple-small">祥龙贺岁，福满人间！🐉</p>
          </div>
          <div style="margin-top: 12px; line-height: 1.8; white-space: pre-line; font-size: 15px">
            {{ content }}
          </div>
          <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center">
            <a :href="mapUrl" target="_blank">
              <button class="simple-btn simple-btn-ghost">导航到会场</button>
            </a>
            <router-link to="/demo/guest">
              <button class="simple-btn simple-btn-primary" @click="onRsvpClick">我要出席</button>
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GoldParticles from '../../components/simple/GoldParticles.vue'

const show = ref(false)

const content = `亲爱的家人朋友们：
祥龙贺岁，福满人间！🐉

我们怀着无比喜悦的心情，诚邀您于2026年1月10日（农历十一月廿二），
莅临祁阳鑫利大酒店四楼1号会议厅，共同见证重要时刻：

👶 屹琛小朋友百日之喜
从呱呱坠地到百日圆满，感恩生命中最珍贵的礼物

🏡 乔迁新居·进火之喜
新居焕彩盈门秀，华堂焕彩纳千祥

✨ 双喜同庆 · 共飨盛宴
⏰ 时间：2026年1月10日 12:08（吉时开席）
📍 地点：祁阳鑫利大酒店四楼1号会议厅

👨👩👧 严蓬春 、田梦 携爱子屹琛小朋友 敬邀`

const mapUrl = `https://www.google.com/maps/search/?api=1&query=祁阳鑫利大酒店`

function onOpenContentClick() {
  if (show.value) return
  show.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onRsvpClick() {
  // placeholder
}
</script>

<style scoped>
.simple-invitation {
  padding: 12px;
  min-height: 100vh;
  background: var(--bg);
}

.simple-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-soft);
}

.simple-title {
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.simple-small {
  font-size: 13px;
  color: var(--text-secondary);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

