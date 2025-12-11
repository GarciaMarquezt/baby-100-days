<template>
  <div class="invitation-page">
    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>
    
    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 顶部导航 -->
    <header class="invitation-header">
      <button class="back-button" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="invitation-title">电子请帖</h1>
      <div style="width: 60px;"></div>
    </header>

    <!-- 请帖内容 -->
    <div class="invitation-content">
      <!-- 请帖封面装饰 -->
      <div class="invitation-envelope">
        <div class="envelope-seal">
          <div class="seal-circle">
            <div class="seal-character">严</div>
          </div>
        </div>
        
        <!-- 请帖主体 -->
        <BabyCard class="invitation-card">
          <!-- 顶部装饰线 -->
          <div class="card-decoration-top"></div>
          
          <div class="invitation-letter">
            <!-- 标题区域 -->
            <div class="invitation-letter__title-section">
              <div class="title-main">请 柬</div>
              <div class="title-subtitle">INVITATION</div>
              <div class="title-divider"></div>
            </div>

            <!-- 称呼 -->
            <div class="invitation-letter__greeting">
              <p class="greeting-text">尊敬的</p>
              <p class="greeting-name">家人朋友们</p>
            </div>

            <!-- 正文 -->
            <div class="invitation-letter__body">
              <p class="body-text">
                祥龙贺岁，福满人间！🐉
              </p>
              
              <p class="body-text">
                我们怀着无比喜悦的心情，诚邀您于
              </p>
              
              <div class="date-highlight">
                <p class="date-text">{{ partyDate }}</p>
              </div>
              
              <p class="body-text">
                莅临
              </p>
              
              <div class="location-highlight">
                <p class="location-text">{{ partyAddress }}</p>
              </div>
              
              <p class="body-text">
                共同见证两个重要时刻：
              </p>

              <!-- 双喜事件 -->
              <div class="events-section">
                <div class="event-card">
                  <div class="event-icon">👶</div>
                  <div class="event-content">
                    <h4 class="event-title">{{ babyName }}百日之喜</h4>
                    <p class="event-desc">从呱呱坠地到百日圆满，感恩生命中最珍贵的礼物</p>
                  </div>
                </div>

                <div class="event-card">
                  <div class="event-icon">🏡</div>
                  <div class="event-content">
                    <h4 class="event-title">乔迁新居·进火之喜</h4>
                    <p class="event-desc">新居焕彩盈门秀，华堂焕彩纳千祥</p>
                  </div>
                </div>
              </div>

              <!-- 时间地点信息 -->
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">⏰ 时间：</span>
                  <span class="info-value">2026年1月10日 12:08（吉时开席）</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍 地点：</span>
                  <span class="info-value">祁阳鑫利大酒店四楼1号会议厅</span>
                </div>
              </div>
            </div>

            <!-- 落款 -->
            <div class="invitation-letter__signature">
              <p class="signature-text">👨👩👧 严蓬春、田梦</p>
              <p class="signature-text">携爱子{{ babyName }} 敬邀</p>
            </div>
          </div>
          
          <!-- 底部装饰线 -->
          <div class="card-decoration-bottom"></div>
        </BabyCard>
      </div>

      <!-- 操作按钮 -->
      <div class="invitation-actions">
        <BabyButton type="ghost" @click="openMap">导航到会场</BabyButton>
        <BabyButton type="primary" @click="goToRegister">我要出席</BabyButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BabyButton from '../components/Button.vue'
import BabyCard from '../components/Card.vue'
import { initGoldParticles } from '../utils/animations'
import { useConfig } from '../utils/configStore'

const router = useRouter()
const { loadConfig, getValue } = useConfig()

const babyName = computed(() => getValue('baby_name', '屹琛小朋友'))
const partyDate = computed(() => getValue('party_date', '2026-01-10 12:00'))
const partyAddress = computed(() => getValue('party_address', '祁阳鑫利大酒店四楼1号会议厅'))
let cleanupParticles = null

const openMap = () => {
  const mapUrl = `https://uri.amap.com/marker?position=111.836,26.5755&name=${encodeURIComponent(partyAddress.value)}&src=invitation&coordinate=gaode&callnative=1`
  window.location.href = mapUrl
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  loadConfig()
  // 初始化金箔粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 50,
    colors: ['#FFD700', '#FFA500', '#FFE135']
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

.invitation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  position: relative;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 0;
  color: var(--text-primary);
  font-size: var(--font-size-body);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.back-button:hover {
  background: var(--muted);
}

.invitation-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
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

.invitation-content {
  margin-top: var(--spacing-lg);
  position: relative;
  z-index: 2;
}

/* 信封效果 */
.invitation-envelope {
  position: relative;
  margin-bottom: var(--spacing-xl);
}

.envelope-seal {
  position: absolute;
  top: -20px;
  right: 20px;
  z-index: 3;
}

.seal-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(199, 62, 29, 0.3);
  animation: seal-pulse 2s ease-in-out infinite;
}

@keyframes seal-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.seal-character {
  color: #fff;
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family);
}

/* 请帖卡片 */
.invitation-card {
  position: relative;
  background: linear-gradient(180deg, #FFFEF9 0%, #FAF8F3 100%);
  border: 2px solid var(--gold);
  box-shadow: 0 8px 32px rgba(199, 62, 29, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.2);
  overflow: visible;
}

.card-decoration-top,
.card-decoration-bottom {
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  margin: 0 -2px;
  position: relative;
}

.card-decoration-top {
  margin-top: -2px;
  margin-bottom: var(--spacing-md);
}

.card-decoration-bottom {
  margin-top: var(--spacing-md);
  margin-bottom: -2px;
}

.card-decoration-top::before,
.card-decoration-bottom::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: var(--gold);
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 请帖内容 */
.invitation-letter {
  padding: var(--spacing-xl) var(--spacing-lg);
  position: relative;
}

/* 标题区域 */
.invitation-letter__title-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--gold);
  position: relative;
}

.title-main {
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  font-family: var(--font-family);
  letter-spacing: 8px;
  margin-bottom: var(--spacing-xs);
  text-shadow: 2px 2px 4px rgba(199, 62, 29, 0.1);
}

.title-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 4px;
  margin-bottom: var(--spacing-sm);
  font-family: 'Times New Roman', serif;
}

.title-divider {
  width: 60px;
  height: 2px;
  background: var(--gold);
  margin: 0 auto;
}

/* 称呼 */
.invitation-letter__greeting {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.greeting-text {
  font-size: var(--font-size-body);
  color: var(--text-secondary);
  margin: 0;
  font-family: var(--font-family);
}

.greeting-name {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: var(--spacing-xs) 0 0 0;
  font-family: var(--font-family);
}

/* 正文 */
.invitation-letter__body {
  line-height: 2;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-body);
}

.body-text {
  margin: var(--spacing-md) 0;
  text-indent: 2em;
  font-family: var(--font-family);
}

.date-highlight,
.location-highlight {
  text-align: center;
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(199, 62, 29, 0.05));
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-sm);
}

.date-text,
.location-text {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0;
  font-family: var(--font-family);
}

.date-lunar,
.location-detail {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0 0 0;
}

/* 事件卡片 */
.events-section {
  margin: var(--spacing-xl) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.event-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--muted);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--gold);
  align-items: flex-start;
}

.event-icon {
  font-size: 40px;
  flex-shrink: 0;
  line-height: 1;
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-family: var(--font-family);
}

.event-desc {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 信息区域 */
.info-section {
  background: var(--muted);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin: var(--spacing-xl) 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.info-row {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-body);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  flex-shrink: 0;
  font-family: var(--font-family);
}

.info-value {
  color: var(--text-secondary);
  flex: 1;
}

/* 落款 */
.invitation-letter__signature {
  text-align: right;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--divider-color);
}

.signature-text {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  margin: var(--spacing-xs) 0;
  font-family: var(--font-family);
}

.signature-date {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: var(--spacing-md) 0 0 0;
  font-style: italic;
}

/* 操作按钮 */
.invitation-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  justify-content: center;
}

/* 深色模式适配 */
[data-theme='dark'] .invitation-card {
  background: linear-gradient(180deg, #252018 0%, #1F1A14 100%);
  box-shadow: 0 8px 32px rgba(199, 62, 29, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3);
}

[data-theme='dark'] .date-highlight,
[data-theme='dark'] .location-highlight {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(199, 62, 29, 0.15));
  border-left: 3px solid var(--gold);
}

[data-theme='dark'] .title-main {
  text-shadow: 2px 2px 4px rgba(199, 62, 29, 0.3);
}

[data-theme='dark'] .info-section {
  border: 1px solid rgba(212, 175, 55, 0.4);
}

[data-theme='dark'] .page-glow {
  background: radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%);
}

/* 响应式 */
@media (max-width: 360px) {
  .invitation-letter {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .title-main {
    font-size: 36px;
    letter-spacing: 4px;
  }
  
  .event-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
