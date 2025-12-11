<template>
  <div class="home-page">
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
        <img
          class="cover-photo__image"
          src="https://upload.1101020.xyz/uploads/images/1.jpg"
          alt="宝宝照片"
        />
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
        <BabyButton type="ghost" @click="$router.push('/gallery')">相册与祝福</BabyButton>
        <BabyButton type="primary" @click="$router.push('/register')">赴宴登记</BabyButton>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import BabyButton from '../components/Button.vue'
import BabyCard from '../components/Card.vue'
import { ThemeManager } from '../utils/theme'
import { initGoldParticles } from '../utils/animations'
import { useConfig } from '../utils/configStore'

const router = useRouter()
const { loadConfig, getValue } = useConfig()

// 动态配置
const babyName = computed(() => getValue('baby_name', '屹琛小朋友'))
const partyDate = computed(() => getValue('party_date', '2026-01-10 12:00'))
const partyAddress = computed(() => getValue('party_address', '祁阳鑫利大酒店四楼1号会议厅'))

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

onMounted(() => {
  ThemeManager.init()
  isDark.value = ThemeManager.getTheme() === 'dark'

  // 加载动态配置（宝宝姓名、时间、地点等）
  loadConfig()
  
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
  z-index: 1;
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
