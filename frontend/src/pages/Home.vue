<template>
  <div class="home-page">
    <!-- 全屏祝福飘屏背景 -->
    <MessageBarrage
      ref="messageBarrage"
      :auto-start="true"
      :show-controls="false"
      :show-input="false"
      :max-blessings="30"
      :show-sender="false"
      :speed="1.0"
      :opacity="0.6"
      :is-fullscreen="true"
      class="fullscreen-barrage"
      @blessing-click="handleBarrageClick"
      @like="handleBarrageLike"
    />

    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>

    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 顶部导航栏 -->
    <header class="home-header">
      <div class="home-header__logo">
        <div class="logo-badge">{{ babyName.charAt(0) }}</div>
        <div class="logo-text">
          <div class="logo-text__name">{{ babyName }} · 百日宴</div>
          <div class="logo-text__date">{{ partyDate }}</div>
        </div>
      </div>
      <div class="theme-toggle" @click="toggleTheme">
        <span class="theme-toggle__text">{{ isDark ? '浅色' : '深色' }}</span>
      </div>
    </header>

    <!-- 封面内容 -->
    <div class="home-cover">
      <div class="cover-photo">
        <template v-if="homeCoverUrl">
          <img
            class="cover-photo__image"
            :src="homeCoverUrl"
            alt="宝宝照片"
            @error="handleCoverImageError"
            @load="handleCoverImageLoad"
          />
        </template>
        <template v-else>
          <div class="cover-photo__placeholder">
            
          </div>
        </template>
      </div>
      
      <h1 class="cover-title">{{ babyName }} · 百日</h1>
      <p class="cover-subtitle">{{ partyDate }} · {{ partyAddress }}</p>
      
      <div class="cover-actions">
        <BabyButton type="primary" @click="goToInvitation">
          查看电子请帖
        </BabyButton>
        <div class="cover-actions__hint">
          <span class="hint-arrow">⬆</span>
          <span class="hint-text">轻触这里查看电子请帖</span>
        </div>
      </div>
    </div>


    <!-- 邀请函内容 -->
    <div class="invite-content">
      <!-- 位置信息 -->
      <BabyCard>
        <div class="location-info" @click="showMapSheet = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 8px;">
            <path d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 18.333c-4.167 0-7.5-3.333-7.5-7.5 0-5.833 7.5-10.833 7.5-10.833s7.5 5 7.5 10.833c0 4.167-3.333 7.5-7.5 7.5z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <div>
            <div class="location-info__text">{{ partyAddress }}</div>
            <div class="location-info__hint">（点击开启导航）</div>
          </div>
        </div>
      </BabyCard>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <BabyButton type="ghost" @click="$router.push('/gallery')">相册</BabyButton>
        <BabyButton type="primary" @click="$router.push('/register')">赴宴登记</BabyButton>
      </div>

      <!-- 简化的送祝福输入区域 -->
      <div class="simple-blessing-input">
        <div class="input-with-button">
          <input
            v-model="newBlessing"
            @keyup.enter="sendBlessing"
            placeholder="写下您的祝福..."
            class="simple-blessing-field"
            maxlength="20"
          />
          <div class="char-counter">
            {{ newBlessing.length }}/20
          </div>
          <BabyButton
            type="primary"
            :disabled="!newBlessing.trim()"
            @click="sendBlessing"
            class="simple-send-btn"
            size="small"
          >
            送祝福
          </BabyButton>
        </div>
      </div>
    </div>

    <!-- 地图选择 -->
    <van-action-sheet
      v-model:show="showMapSheet"
      :actions="mapActions"
      cancel-text="取消"
      description="请选择地图进行导航"
      close-on-click-action
      @select="onSelectMap"
    />

    <!-- 管理员登录（隐藏功能） -->
    <van-dialog 
      v-model:show="showAdminLogin" 
      title="管理员验证" 
      show-cancel-button 
      @confirm="checkAdminPassword"
    >
      <div style="padding: 20px;">
        <input 
          type="password" 
          v-model="adminPassword" 
          placeholder="请输入管理密码" 
          style="width: 100%; padding: 10px; border: 1px solid var(--muted); border-radius: var(--radius-sm); text-align: center;"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { gsap } from 'gsap'
import BabyButton from '../components/Button.vue'
import BabyCard from '../components/Card.vue'
import MessageBarrage from '../components/MessageBarrage.vue'
import { ThemeManager } from '../utils/theme'
import { initGoldParticles, slideInAnimation, bounceInAnimation } from '../utils/animations'
import { useConfig } from '../utils/configStore'
import { sendMessage } from '../api/message'

const router = useRouter()
const { loadConfig, getValue } = useConfig()
const messageBarrage = ref(null)
const newBlessing = ref('')

// 动态配置
const babyName = computed(() => getValue('baby_name', '屹琛小朋友'))
const partyDate = computed(() => getValue('party_date', '2026-01-10 12:00'))
const partyAddress = computed(() => getValue('party_address', '祁阳鑫利大酒店四楼1号会议厅'))
const homeCoverUrl = computed(() => getValue('home_cover_thumb', '') || getValue('home_cover_image', ''))

// 主题切换
const isDark = ref(false)
const toggleTheme = () => {
  const newTheme = ThemeManager.toggleTheme()
  isDark.value = newTheme === 'dark'
}

// 跳转到电子请帖
const goToInvitation = () => {
  router.push('/invitation')
}

// 处理弹幕点击
const handleBarrageClick = (danmu) => {
  showToast(`${danmu.guestName || danmu.name}: ${danmu.content || danmu.text}`)
}

// 处理弹幕点赞
const handleBarrageLike = (danmu) => {
  danmu.isLiked = !danmu.isLiked
}

// 处理封面图片加载错误
const handleCoverImageError = (event) => {
  console.error('Cover image failed to load:', event.target.src, event)
  showToast('封面图片加载失败')
}

// 处理封面图片加载成功
const handleCoverImageLoad = (event) => {
  console.log('Cover image loaded successfully:', event.target.src)
}

// 发送祝福
const sendBlessing = async () => {
  const content = newBlessing.value.trim()

  if (!content) {
    showToast('请先输入祝福内容')
    return
  }

  if (content.length > 20) {
    showToast('祝福内容不能超过20个字符')
    return
  }

  try {
    const response = await sendMessage({
      content: content,
      guestName: '祝福者'
    })

    if (response.code === 0) {
      showSuccessToast('祝福发送成功！✨')
      const sentBlessing = newBlessing.value.trim()
      newBlessing.value = ''

      // 立即在飘屏中显示新祝福
      if (messageBarrage.value) {
        messageBarrage.value.addBlessing({
          id: Date.now(),
          guestName: '祝福者',
          content: content,
          likes: 0,
          isLiked: false,
          createTime: new Date().toISOString(),
          status: 1
        })
      }
    } else {
      showToast(response.msg || '发送失败，请稍后重试')
    }
  } catch (error) {
    console.error('发送祝福失败:', error)
    showToast('发送失败，请检查网络连接')
  }
}

// 地图导航
const showMapSheet = ref(false)
const BASE_LNG = 111.836
const BASE_LAT = 26.5755
const LOC_NAME = '祁阳鑫利大酒店'
const LOC_ADDR = '四楼1号会议厅'

const gcj02ToBd09 = (lng, lat) => {
  const x_PI = 3.14159265358979324 * 3000.0 / 180.0
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
  return { 
    lng: z * Math.cos(theta) + 0.0065, 
    lat: z * Math.sin(theta) + 0.006 
  }
}

const mapActions = [
  { name: '高德地图 (推荐)', color: '#0091ff', type: 'gaode' },
  { name: '百度地图', color: '#d32f2f', type: 'baidu' },
  { name: '腾讯地图', color: '#00c853', type: 'tencent' },
]

const onSelectMap = (action) => {
  let url = ''
  if (action.type === 'baidu') {
    const bd = gcj02ToBd09(BASE_LNG, BASE_LAT)
    url = `http://api.map.baidu.com/marker?location=${bd.lat},${bd.lng}&title=${encodeURIComponent(LOC_NAME)}&content=${encodeURIComponent(LOC_ADDR)}&output=html&src=webapp.baidu.openAPIdemo`
  } else if (action.type === 'gaode') {
    url = `https://uri.amap.com/marker?position=${BASE_LNG},${BASE_LAT}&name=${encodeURIComponent(LOC_NAME)}&src=invitation&coordinate=gaode&callnative=1`
  } else if (action.type === 'tencent') {
    url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${BASE_LAT},${BASE_LNG};title:${encodeURIComponent(LOC_NAME)};addr:${encodeURIComponent(LOC_ADDR)}`
  }
  window.location.href = url
}

// 管理员彩蛋
const showAdminLogin = ref(false)
const adminPassword = ref('')
let clickCount = 0
let clickTimer = null

const checkAdminPassword = () => {
  if (adminPassword.value === '123456') {
    localStorage.setItem('token', 'fake-admin-token')
    showSuccessToast('管理员模式已开启')
    router.push('/admin/dashboard')
  } else {
    showToast('密码错误')
    adminPassword.value = ''
  }
}

// 初始化
let cleanupParticles = null

onMounted(async () => {
  ThemeManager.init()
  isDark.value = ThemeManager.getTheme() === 'dark'

  // 加载动态配置（宝宝姓名、时间、地点等）
  loadConfig()

  await nextTick()

  // GSAP 页面进入动画
  const pageTl = gsap.timeline()

  // 1. 顶部导航滑入
  const header = document.querySelector('.home-header')
  if (header) {
    gsap.set(header, { y: -50, opacity: 0 })
    pageTl.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    })
  }

  // 2. 封面照片从右侧滑入
  const coverPhoto = document.querySelector('.cover-photo')
  if (coverPhoto) {
    gsap.set(coverPhoto, { x: 100, opacity: 0, scale: 0.8 })
    pageTl.to(coverPhoto, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, "-=0.3")
  }

  // 3. 标题和副标题依次出现
  const coverTitle = document.querySelector('.cover-title')
  const coverSubtitle = document.querySelector('.cover-subtitle')
  const coverActions = document.querySelector('.cover-actions')

  gsap.set([coverTitle, coverSubtitle, coverActions], { opacity: 0, y: 30 })

  pageTl.to(coverTitle, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.4")

  pageTl.to(coverSubtitle, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3")

  // 4. 操作按钮弹入
  pageTl.to(coverActions, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "back.out(1.7)"
  }, "-=0.3")

  // 5. 邀请函内容区域依次滑入
  const inviteContent = document.querySelector('.invite-content')
  if (inviteContent) {
    const locationInfo = inviteContent.querySelector('.location-info')
    const actionButtons = inviteContent.querySelector('.action-buttons')

    gsap.set([locationInfo, actionButtons], { opacity: 0, x: -50 })

    pageTl.to(locationInfo, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.2")

    pageTl.to(actionButtons, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
  }

  // 6. 添加封面照片的持续动画
  if (coverPhoto) {
    gsap.to(coverPhoto, {
      y: -8,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    })
  }

  // 初始化金粉粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 60,
    colors: ['#D4AF37', '#E8D5A3', '#B8941F']
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
  
  // 标题点击触发管理员入口（点击5次）
  const titleEl = document.querySelector('.cover-title')
  if (titleEl) {
    titleEl.addEventListener('click', () => {
      clickCount++
      if (clickTimer) clearTimeout(clickTimer)
      clickTimer = setTimeout(() => { clickCount = 0 }, 1000)
      if (clickCount >= 5) {
        showAdminLogin.value = true
        clickCount = 0
      }
    })
  }
})

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  padding-top: calc(var(--safe-area-top) + var(--spacing-md));
  padding-bottom: calc(var(--safe-area-bottom) + var(--spacing-md));
  position: relative;
  z-index: 2;
}

.page-glow {
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

.gold-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* 顶部导航栏 */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.home-header__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-badge {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-image: var(--accent);
  border: 2px solid var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: var(--font-weight-bold);
  font-size: 18px;
  font-family: var(--font-family);
  box-shadow: var(--shadow-gold);
}

.logo-text__name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
  color: var(--text-primary);
  font-family: var(--font-family);
}

.logo-text__date {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.theme-toggle {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
}

.theme-toggle:hover {
  background: var(--muted);
}

/* 封面区域 */
.home-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.cover-photo {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFEFF5, #FFDDEE);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.cover-photo__image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.cover-photo__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFEFF5, #FFDDEE);
  color: var(--text-secondary);
  font-size: 18px;
}

.cover-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
  font-family: var(--font-family);
  text-shadow: 0 2px 8px rgba(199, 62, 29, 0.1);
}

.cover-subtitle {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xl);
}

.cover-actions {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-actions__hint {
  margin-top: var(--spacing-sm);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-small);
  color: var(--accent-solid);
  animation: hint-bounce 1.4s ease-in-out infinite;
}

.hint-arrow {
  font-size: 14px;
}

@keyframes hint-bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* 全屏祝福飘屏 */
.fullscreen-barrage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* 让祝福飘屏在背景层级，但内容可以点击 */
.fullscreen-barrage .blessing-barrage {
  position: absolute;
  width: 100%;
  height: 100%;
}

.fullscreen-barrage .barrage-viewport {
  pointer-events: auto;
}

/* 简化的送祝福输入区域 */
.simple-blessing-input {
  margin-top: var(--spacing-md);
}

.input-with-button {
  position: relative;
  display: flex;
  align-items: stretch;
  border: 2px solid var(--divider-color);
  border-radius: var(--radius-lg);
  background: var(--background);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  overflow: hidden; /* 确保圆角正确显示 */
}

.input-with-button:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.simple-blessing-field {
  flex: 1;
  min-width: 0; /* 允许压缩 */
  padding: var(--spacing-sm) var(--spacing-md);
  border: none; /* 移除单独边框 */
  border-radius: 0; /* 移除圆角 */
  background: transparent; /* 透明背景 */
  color: var(--text-primary);
  font-size: var(--font-size-body);
  font-family: var(--font-family-body);
  outline: none;
  transition: none; /* 移除过渡，由父容器处理 */
}

.simple-blessing-field:focus {
  outline: none;
  box-shadow: none; /* 移除单独阴影 */
}

.simple-blessing-field::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.simple-send-btn {
  flex-shrink: 0; /* 不被压缩 */
  white-space: nowrap;
  margin-left: 8px; /* 与计数器保持间距 */
  font-weight: 500;
}

.char-counter {
  flex-shrink: 0; /* 不被压缩 */
  margin-left: 8px; /* 与按钮保持间距 */
  font-size: 12px;
  color: var(--text-secondary);
  background: transparent; /* 完全透明 */
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center; /* 垂直居中 */
  height: 100%; /* 占满容器高度 */
}

/* 移动端适配 - 紧凑布局 */
@media (max-width: 768px) {
  .char-counter {
    font-size: 11px; /* 稍微小一点的字体 */
    padding: 1px 4px; /* 更小的内边距 */
    margin-left: 6px; /* 缩小间距 */
  }

  .simple-send-btn {
    padding: var(--spacing-sm) var(--spacing-sm); /* 缩小内边距 */
    font-size: var(--font-size-small); /* 缩小字体 */
    margin-left: 6px; /* 缩小间距 */
  }
}

/* 平板适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .simple-send-btn {
    min-width: 90px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* 邀请函内容 */
.invite-content {
  margin-top: var(--spacing-lg);
}


.location-info {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  color: var(--text-primary);
}

.location-info svg {
  color: var(--gold);
  flex-shrink: 0;
}

.location-info__text {
  font-size: var(--font-size-body);
  margin-bottom: var(--spacing-xs);
}

.location-info__hint {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 360px) {
  .cover-photo {
    width: 180px;
    height: 180px;
  }
}
</style>
