<template>
  <div class="invitation-page">
    <!-- 动态背景效果 -->
    <div class="bg-gradient"></div>
    <div class="bg-pattern"></div>
    <canvas id="goldParticles" class="gold-particles"></canvas>

    <!-- 顶部导航 -->
    <header class="invitation-header">
      <button class="back-button" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="invitation-title">电子请柬</h1>
      <div style="width: 60px;"></div>
    </header>

    <!-- 主内容区域 -->
    <div class="invitation-content">
      <!-- 封面卡片 -->
      <div class="cover-card" :class="{ 'cover-opened': isOpened }" @click="openInvitation">
        <div class="cover-front">
          <div class="cover-decoration">
            <div class="decoration-circle"></div>
            <div class="decoration-lines">
              <div class="line line-1"></div>
              <div class="line line-2"></div>
              <div class="line line-3"></div>
            </div>
          </div>
          <div class="cover-content">
            <div class="cover-icon">🎊</div>
            <h2 class="cover-title">双喜临门</h2>
            <p class="cover-subtitle">{{ babyName }} · 百日 · 乔迁</p>
            <div class="cover-hint">
              <span>点击开启请柬</span>
              <svg class="hint-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 请柬主体内容 -->
      <transition name="invitation-reveal">
        <div v-if="isOpened" class="invitation-main">
          <!-- 祝福语区域 -->
          <div class="blessing-section">
            <div class="blessing-header">
              <div class="blessing-icon">🧧</div>
              <h3 class="blessing-title">诚挚邀请</h3>
            </div>
            <p class="blessing-text">
              祥龙贺岁，福满人间！<br>
              金猴纳福，瑞气盈门！
            </p>
          </div>

          <!-- 邀请详情 -->
          <div class="invitation-details">
            <div class="detail-card">
              <div class="detail-header">
                <div class="detail-icon">📅</div>
                <h4 class="detail-title">宴会时间</h4>
              </div>
              <div class="detail-content">
                <p class="detail-primary">{{ partyDate }}</p>
                <p class="detail-secondary">农历十一月廿二 · 吉时开席</p>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-header">
                <div class="detail-icon">📍</div>
                <h4 class="detail-title">举办地点</h4>
              </div>
              <div class="detail-content">
                <p class="detail-primary">{{ partyAddress }}</p>
                <p class="detail-secondary">祁阳鑫利大酒店四楼1号会议厅</p>
              </div>
            </div>
          </div>

          <!-- 双喜事件 -->
          <div class="events-section">
            <h3 class="section-title">双喜同庆</h3>
            <div class="events-grid">
              <div class="event-item">
                <div class="event-visual">
                  <div class="event-emoji">👶</div>
                  <div class="event-pattern"></div>
                </div>
                <div class="event-info">
                  <h4 class="event-name">{{ babyName }}百日之喜</h4>
                  <p class="event-description">从呱呱坠地到百日圆满，感恩生命中最珍贵的礼物</p>
                </div>
              </div>

              <div class="event-item">
                <div class="event-visual">
                  <div class="event-emoji">🏡</div>
                  <div class="event-pattern"></div>
                </div>
                <div class="event-info">
                  <h4 class="event-name">乔迁新居 · 进火之喜</h4>
                  <p class="event-description">新居焕彩盈门秀，华堂焕彩纳千祥</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 邀请人信息 -->
          <div class="host-section">
            <div class="host-decoration">
              <div class="decoration-left"></div>
              <div class="decoration-right"></div>
            </div>
            <div class="host-content">
              <p class="host-text">👨‍👩‍👧 严蓬春 · 田梦</p>
              <p class="host-text">携爱子 {{ babyName }}</p>
              <p class="host-invitation">敬邀</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="invitation-actions">
            <BabyButton type="ghost" @click="openMap" class="action-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.79 2 4 3.79 4 6c0 3.31 3.87 7.75 3.22 8.49a.5.5 0 01-.44.25.5.5 0 01-.44-.25C4.13 13.75 8 9.31 8 6c0-2.21-1.79-4-4-4z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              导航到会场
            </BabyButton>
            <BabyButton type="primary" @click="goToRegister" class="action-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2l1.09 3.26h3.26l-2.64 1.91 1.09 3.26L8 8.52l-2.8 2.01 1.09-3.26-2.64-1.91h3.26z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              我要出席
            </BabyButton>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import BabyButton from '../components/Button.vue'
import { initGoldParticles, bounceInAnimation, slideInAnimation, sparkleAnimation } from '../utils/animations'
import { useConfig } from '../utils/configStore'

const router = useRouter()
const { loadConfig, getValue } = useConfig()

// 响应式数据
const isOpened = ref(false)
const babyName = computed(() => getValue('baby_name', '屹琛小朋友'))
const partyDate = computed(() => getValue('party_date', '2026年1月10日 12:08'))
const partyAddress = computed(() => getValue('party_address', '祁阳鑫利大酒店四楼1号会议厅'))
let cleanupParticles = null

// 方法
const openInvitation = async () => {
  if (isOpened.value) return

  isOpened.value = true
  await nextTick()

  // GSAP 增强的信封打开动画
  const coverCard = document.querySelector('.cover-card')
  const invitationMain = document.querySelector('.invitation-main')
  const coverDecoration = document.querySelector('.cover-decoration')
  const coverContent = document.querySelector('.cover-content')

  if (coverCard && invitationMain) {
    // 创建时间线动画
    const tl = gsap.timeline()

    // 1. 装饰元素闪烁动画
    tl.to(coverDecoration, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    })

    // 2. 信封翻转动画
    tl.to(coverCard, {
      rotationY: 180,
      scale: 1.05,
      duration: 0.8,
      ease: "back.out(1.2)"
    }, "-=0.2")

    // 3. 内容淡出
    tl.to([coverDecoration, coverContent], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in"
    }, "-=0.4")

    // 4. 邀请函内容依次出现
    tl.fromTo(invitationMain, {
      opacity: 0,
      y: 50,
      scale: 0.9
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.2")

    // 5. 祝福语区域动画
    const blessingSection = document.querySelector('.blessing-section')
    if (blessingSection) {
      tl.fromTo(blessingSection, {
        opacity: 0,
        x: -30
      }, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
    }

    // 6. 详情卡片依次出现
    const detailCards = document.querySelectorAll('.detail-card')
    tl.fromTo(detailCards, {
      opacity: 0,
      y: 30,
      scale: 0.95
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.3")

    // 7. 事件项目动画
    const eventItems = document.querySelectorAll('.event-item')
    tl.fromTo(eventItems, {
      opacity: 0,
      scale: 0.8,
      rotation: -10
    }, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "back.out(1.7)"
    }, "-=0.4")

    // 8. 主人信息动画
    const hostSection = document.querySelector('.host-section')
    if (hostSection) {
      tl.fromTo(hostSection, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3")
    }

    // 9. 操作按钮依次弹入
    const actionButtons = document.querySelectorAll('.action-btn')
    tl.fromTo(actionButtons, {
      opacity: 0,
      scale: 0.5,
      y: 20
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.4")

    // 添加闪烁特效
    const sparkleElements = document.querySelectorAll('.event-emoji, .detail-icon')
    sparkleElements.forEach((element, index) => {
      gsap.to(element, {
        scale: 1.1,
        duration: 0.3,
        delay: 1.5 + index * 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
    })

    // 滚动到内容区域
    setTimeout(() => {
      invitationMain.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 800)
  }
}

const openMap = () => {
  const mapUrl = `https://uri.amap.com/marker?position=111.836,26.5755&name=${encodeURIComponent(partyAddress.value)}&src=invitation&coordinate=gaode&callnative=1`
  window.location.href = mapUrl
}

const goToRegister = () => {
  router.push('/register')
}

// 生命周期
onMounted(async () => {
  loadConfig()
  await nextTick()

  // 页面进入动画时间线
  const pageTl = gsap.timeline()

  // 1. 顶部导航滑入
  const header = document.querySelector('.invitation-header')
  if (header) {
    gsap.set(header, { y: -50, opacity: 0 })
    pageTl.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    })
  }

  // 2. 封面卡片从下方弹入
  const coverCard = document.querySelector('.cover-card')
  if (coverCard) {
    gsap.set(coverCard, { y: 100, opacity: 0, scale: 0.8 })
    pageTl.to(coverCard, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, "-=0.3")
  }

  // 3. 装饰元素依次出现
  const decorationCircles = document.querySelectorAll('.decoration-circle, .decoration-lines .line')
  gsap.set(decorationCircles, { scale: 0, opacity: 0 })
  pageTl.to(decorationCircles, {
    scale: 1,
    opacity: 1,
    duration: 0.4,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, "-=0.4")

  // 4. 封面内容文字动画
  const coverContent = document.querySelector('.cover-content')
  if (coverContent) {
    const title = coverContent.querySelector('.cover-title')
    const subtitle = coverContent.querySelector('.cover-subtitle')
    const hint = coverContent.querySelector('.cover-hint')

    gsap.set([title, subtitle, hint], { opacity: 0, y: 20 })

    pageTl.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")

    pageTl.to(subtitle, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.2")

    pageTl.to(hint, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.2")
  }

  // 5. 添加封面卡片的持续动画
  if (coverCard) {
    gsap.to(coverCard, {
      y: -5,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    })
  }

  // 初始化金箔粒子动画 - 更柔和的配置
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 30,
    colors: ['#FFD700', '#FFA500', '#FFE135', '#FFF8DC'],
    size: { min: 2, max: 4 },
    speed: { min: 0.5, max: 1.5 }
  })

  // 窗口大小改变时重新调整 canvas
  const handleResize = () => {
    const canvas = document.getElementById('goldParticles')
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
})
</script>

<style scoped>
.invitation-page {
  min-height: 100vh;
  padding: var(--spacing-md);
  padding-top: calc(var(--safe-area-top) + var(--spacing-md));
  padding-bottom: calc(var(--safe-area-bottom) + var(--spacing-md));
  position: relative;
  overflow-x: hidden;
  z-index: 1;
}

/* 背景效果 */
.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(199, 62, 29, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.bg-pattern {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(199, 62, 29, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

.gold-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 头部导航 */
.invitation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  position: relative;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  box-shadow: var(--shadow-sm);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.invitation-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 主内容区域 */
.invitation-content {
  position: relative;
  z-index: 2;
}

/* 封面卡片 */
.cover-card {
  margin-bottom: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-base);
}

.cover-front {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
}

.cover-front::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(199, 62, 29, 0.05) 100%);
  border-radius: inherit;
  z-index: -1;
}

.cover-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  animation: float 3s ease-in-out infinite;
}

.decoration-lines {
  position: absolute;
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  right: var(--spacing-lg);
}

.line {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  margin-bottom: var(--spacing-sm);
}

.line-1 { width: 100%; animation: slide-right 4s ease-in-out infinite; }
.line-2 { width: 80%; animation: slide-right 4s ease-in-out infinite 1s; }
.line-3 { width: 60%; animation: slide-right 4s ease-in-out infinite 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-right {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

.cover-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.cover-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.cover-title {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0 0 var(--spacing-md) 0;
  font-family: var(--font-family);
  letter-spacing: 2px;
}

.cover-subtitle {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  font-family: var(--font-family);
}

.cover-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  animation: pulse 2s ease-in-out infinite;
}

.hint-arrow {
  animation: bounce-arrow 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes bounce-arrow {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(3px); }
  60% { transform: translateY(1px); }
}

/* 封面打开状态 */
.cover-opened .cover-front {
  transform: scale(0.95);
  opacity: 0.7;
}

/* 请柬主体内容 */
.invitation-main {
  animation: slide-up 0.8s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 祝福语区域 */
.blessing-section {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
  text-align: center;
}

.blessing-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.blessing-icon {
  font-size: 32px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(90deg); }
  50% { transform: scale(1) rotate(180deg); }
  75% { transform: scale(1.1) rotate(270deg); }
}

.blessing-title {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0;
  font-family: var(--font-family);
}

.blessing-text {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.8;
  font-family: var(--font-family);
}

/* 邀请详情 */
.invitation-details {
  display: grid;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.detail-card {
  background: linear-gradient(135deg, #FFF 0%, #F8F6F0 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.15);
  transition: transform var(--transition-base);
}

.detail-card:hover {
  transform: translateY(-2px);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.detail-icon {
  font-size: 24px;
  background: var(--accent);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.detail-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
}

.detail-content {
  padding-left: 60px;
}

.detail-primary {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0 0 var(--spacing-xs) 0;
  font-family: var(--font-family);
}

.detail-secondary {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  font-family: var(--font-family);
}

/* 双喜事件 */
.events-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 var(--spacing-xl) 0;
  font-family: var(--font-family);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 1px;
}

.events-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.event-item {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
  transition: all var(--transition-base);
}

.event-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.event-visual {
  position: relative;
  flex-shrink: 0;
}

.event-emoji {
  font-size: 48px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(199, 62, 29, 0.05));
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: gentle-float 3s ease-in-out infinite;
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.event-pattern {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.1) 2px, transparent 2px);
  border-radius: 50%;
  animation: rotate-pattern 10s linear infinite;
}

@keyframes rotate-pattern {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.event-info {
  flex: 1;
}

.event-name {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0 0 var(--spacing-md) 0;
  font-family: var(--font-family);
}

.event-description {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-family: var(--font-family);
}

/* 邀请人信息 */
.host-section {
  background: linear-gradient(135deg, #FFF 0%, #FAF8F3 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.host-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-left,
.decoration-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.decoration-left {
  left: var(--spacing-lg);
  animation: slide-left 3s ease-in-out infinite;
}

.decoration-right {
  right: var(--spacing-lg);
  animation: slide-right-decoration 3s ease-in-out infinite;
}

@keyframes slide-left {
  0% { transform: translateY(-50%) translateX(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-50%) translateX(-20px); opacity: 0; }
}

@keyframes slide-right-decoration {
  0% { transform: translateY(-50%) translateX(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-50%) translateX(20px); opacity: 0; }
}

.host-content {
  position: relative;
  z-index: 1;
}

.host-text {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  margin: var(--spacing-sm) 0;
  font-family: var(--font-family);
}

.host-invitation {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: var(--spacing-md) 0 0 0;
  font-family: var(--font-family);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 5px rgba(199, 62, 29, 0.3); }
  to { text-shadow: 0 0 15px rgba(199, 62, 29, 0.6); }
}

/* 操作按钮 */
.invitation-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gold);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 过渡动画 */
.invitation-reveal-enter-active {
  transition: all 0.8s ease-out;
}

.invitation-reveal-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.invitation-reveal-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 深色模式适配 */
[data-theme='dark'] .cover-front,
[data-theme='dark'] .blessing-section,
[data-theme='dark'] .detail-card,
[data-theme='dark'] .event-item,
[data-theme='dark'] .host-section {
  background: linear-gradient(135deg, #252018 0%, #1F1A14 100%);
  border-color: rgba(212, 175, 55, 0.3);
}

[data-theme='dark'] .bg-gradient {
  background: radial-gradient(ellipse at top, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(199, 62, 29, 0.12) 0%, transparent 50%);
}

[data-theme='dark'] .back-button {
  background: rgba(37, 32, 24, 0.8);
  border-color: rgba(212, 175, 55, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .cover-front {
    padding: var(--spacing-xl);
  }

  .cover-icon {
    font-size: 48px;
  }

  .cover-title {
    font-size: 24px;
  }

  .detail-card {
    padding: var(--spacing-md);
  }

  .detail-content {
    padding-left: 0;
    padding-top: var(--spacing-md);
  }

  .event-item {
    flex-direction: column;
    text-align: center;
  }

  .event-emoji {
    align-self: center;
  }

  .invitation-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}
</style>
