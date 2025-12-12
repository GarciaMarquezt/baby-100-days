<template>
  <div class="blessing-barrage" :class="{ 'is-fullscreen': isFullscreen }" ref="barrageContainer">
    <!-- 祝福飘屏区域 -->
    <div class="barrage-viewport" :class="{ 'paused': !isPlaying }">
      <div
        v-for="blessing in activeBlessings"
        :key="blessing.id"
        class="blessing-item"
        :class="[
          `blessing-type-${blessing.type}`,
          { 'blessing-enter': blessing.isEntering, 'blessing-leave': blessing.isLeaving }
        ]"
        :style="getBlessingStyle(blessing)"
        @click="handleBlessingClick(blessing)"
      >
        <!-- 祝福图标 -->
        <div class="blessing-icon">
          {{ getBlessingIcon(blessing.type) }}
        </div>

        <!-- 祝福内容 -->
        <div class="blessing-content">
          <div class="blessing-message">
            {{ blessing.content || blessing.text }}
          </div>
          <div class="blessing-sender" v-if="showSender">
            — 来自 {{ blessing.guestName || blessing.name || '祝福者' }}
          </div>
        </div>

        <!-- 爱心计数 -->
        <div class="blessing-hearts" v-if="blessing.likes > 0">
          <span class="heart-icon">❤️</span>
          <span class="heart-count">{{ blessing.likes }}</span>
        </div>

        <!-- 祝福特效 -->
        <div class="blessing-particles" v-if="blessing.showParticles">
          <div class="particle particle-1">✨</div>
          <div class="particle particle-2">🌟</div>
          <div class="particle particle-3">💫</div>
        </div>
      </div>
    </div>

    <!-- 发送祝福输入框 -->
    <div class="blessing-input-area" v-if="showInput && !isFullscreen">
      <div class="input-container">
        <div class="input-header">
          <span class="input-title">送上祝福</span>
          <span class="input-subtitle">您的祝福将飘上天空</span>
        </div>
        <div class="input-wrapper">
          <input
            v-model="newBlessing"
            @keyup.enter="sendBlessing"
            placeholder="写下您的祝福..."
            class="blessing-input"
            maxlength="30"
          />
          <button
            @click="sendBlessing"
            :disabled="!newBlessing.trim()"
            class="send-blessing-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>送祝福</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="barrage-controls" v-if="showControls">
      <div class="control-buttons">
        <button
          class="control-btn"
          :class="{ active: isPlaying }"
          @click="togglePlayPause"
          title="播放/暂停祝福飘屏"
        >
          <svg v-if="isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z" fill="currentColor"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
          </svg>
        </button>

        <button
          class="control-btn"
          @click="toggleInput"
          :class="{ active: showInput }"
          title="送上祝福"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button
          class="control-btn"
          @click="refreshBlessings"
          title="刷新祝福"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="control-settings">
        <div class="setting-item">
          <span class="setting-label">透明度</span>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.1"
            v-model="opacity"
            @input="updateOpacity"
            class="setting-slider"
          />
        </div>

        <div class="setting-item">
          <span class="setting-label">速度</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            v-model="speed"
            @input="updateSpeed"
            class="setting-slider"
          />
        </div>
      </div>

      <div class="blessing-stats">
        <div class="stat-item">
          <span class="stat-icon">💝</span>
          <span class="stat-value">{{ totalMessages }}</span>
          <span class="stat-label">祝福</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎈</span>
          <span class="stat-value">{{ activeBlessings.length }}</span>
          <span class="stat-label">飘屏</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="barrage-empty" v-if="!isLoading && messages.length === 0">
      <div class="empty-visual">
        <div class="empty-hearts">
          <span class="heart heart-1">💖</span>
          <span class="heart heart-2">💕</span>
          <span class="heart heart-3">💗</span>
        </div>
      </div>
      <div class="empty-text">还没有祝福，快来送上第一份祝福吧！</div>
      <button class="empty-send-btn" @click="toggleInput" v-if="!showInput">
        <span class="send-icon">🎁</span>
        送祝福
      </button>
    </div>

    <!-- 加载状态 -->
    <div class="barrage-loading" v-if="isLoading">
      <div class="loading-hearts">
        <div class="loading-heart heart-1">💖</div>
        <div class="loading-heart heart-2">💕</div>
        <div class="loading-heart heart-3">💗</div>
      </div>
      <div class="loading-text">正在加载祝福...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { getInitial } from '../utils/helpers'
import { getMessageList, sendMessage } from '../api/message'
import { showToast, showSuccessToast } from 'vant'

const props = defineProps({
  autoStart: {
    type: Boolean,
    default: true
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showInput: {
    type: Boolean,
    default: false
  },
  showSender: {
    type: Boolean,
    default: false
  },
  maxBlessings: {
    type: Number,
    default: 30
  },
  speed: {
    type: Number,
    default: 2.0
  },
  opacity: {
    type: Number,
    default: 0.7
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['blessing-click', 'like', 'blessing-send'])

const barrageContainer = ref(null)
const messages = ref([])
const activeBlessings = ref([])
const isLoading = ref(false)
const isPlaying = ref(true)
const showInput = ref(props.showInput)
const showSender = ref(props.showSender)
const newBlessing = ref('')
const speed = ref(props.speed)
const opacity = ref(props.opacity)
const totalMessages = ref(0)

let danmuId = 0
let sendInterval = null
let cleanupTimeouts = []

// 祝福类型配置
const blessingTypes = [
  { type: 'love', icon: '💝', color: '#ff6b9d', bgColor: 'rgba(255, 107, 157, 0.15)', weight: 40 },
  { type: 'heart', icon: '❤️', color: '#ff4757', bgColor: 'rgba(255, 71, 87, 0.15)', weight: 30 },
  { type: 'star', icon: '⭐', color: '#ffd700', bgColor: 'rgba(255, 215, 0, 0.15)', weight: 15 },
  { type: 'gift', icon: '🎁', color: '#ff9ff3', bgColor: 'rgba(255, 159, 243, 0.15)', weight: 10 },
  { type: 'crown', icon: '👑', color: '#ffd93d', bgColor: 'rgba(255, 217, 61, 0.15)', weight: 5 }
]

// 随机选择祝福类型
const getRandomBlessingType = () => {
  const random = Math.random() * 100
  let cumulativeWeight = 0

  for (const type of blessingTypes) {
    cumulativeWeight += type.weight
    if (random <= cumulativeWeight) {
      return type
    }
  }

  return blessingTypes[0]
}

// 获取祝福图标
const getBlessingIcon = (type) => {
  const blessingType = blessingTypes.find(t => t.type === type)
  return blessingType ? blessingType.icon : '💝'
}

// 创建祝福样式
const getBlessingStyle = (blessing) => {
  const containerHeight = barrageContainer.value?.clientHeight || 300
  const blessingType = blessingTypes.find(t => t.type === blessing.type) || blessingTypes[0]

  return {
    bottom: `${blessing.bottom}px`,
    left: `${blessing.left}px`,
    color: blessingType.color,
    backgroundColor: blessingType.bgColor,
    opacity: opacity.value,
    animationDuration: `${blessing.duration}s`,
    animationDelay: `${blessing.delay}s`,
    fontSize: `${blessing.fontSize}px`,
    borderColor: blessingType.color
  }
}

// 发送祝福
const sendBlessing = async () => {
  if (!newBlessing.value.trim()) return

  try {
    // console.log('Sending blessing:', newBlessing.value.trim())

    const response = await sendMessage({
      content: newBlessing.value.trim(),
      guestName: '祝福者'
    })

    // console.log('Send blessing response:', response)

    // 检查响应是否存在和有效性
    if (!response) {
      console.error('Send blessing: response is null/undefined')
      showToast('发送失败，服务器无响应')
      return
    }

    if (response.code === 0) {
      showSuccessToast('祝福发送成功！✨')
      const sentBlessing = newBlessing.value.trim()
      newBlessing.value = ''

      // 立即添加新祝福到显示列表（乐观更新）
      addBlessing({
        id: Date.now(),
        guestName: '祝福者',
        content: sentBlessing,
        likes: 0,
        isLiked: false,
        createTime: new Date().toISOString(),
        status: 1
      })

      // 刷新数据以获取最新总数
      await loadMessages()
    } else {
      // 错误响应
      const errorCode = response.code !== undefined ? response.code : 'unknown'
      const errorMsg = response.msg || response.message || '发送失败'
      console.error('Send blessing failed:', { code: errorCode, msg: errorMsg })
      showToast(`发送失败: ${errorMsg}`)
    }
  } catch (error) {
    console.error('发送祝福异常:', error)

    // 更详细的错误信息
    if (error.response) {
      // HTTP错误响应
      console.error('HTTP Error:', error.response.status, error.response.data)
      showToast(`发送失败 (${error.response.status})`)
    } else if (error.request) {
      // 网络错误
      console.error('Network Error:', error.request)
      showToast('网络连接失败，请检查网络')
    } else {
      // 其他错误
      console.error('Other Error:', error.message)
      showToast('发送失败，请稍后重试')
    }
  }
}

// 添加祝福到屏幕
const addBlessing = (message) => {
  // console.log('addBlessing called with message:', message)

  if (activeBlessings.value.length >= props.maxBlessings) {
    // 移除最早的祝福
    activeBlessings.value.shift()
    // console.log('Removed oldest blessing, current count:', activeBlessings.value.length)
  }

  const containerWidth = barrageContainer.value?.clientWidth || 400
  const containerHeight = barrageContainer.value?.clientHeight || 300

  // 只从左侧出现：考虑设备宽度
  // 手机端使用较小范围，桌面端可以使用较大范围
  const maxLeftRange = containerWidth < 768 ? 0.2 : 0.35 // 手机<20%，桌面<35%
  const left = Math.random() * (containerWidth * maxLeftRange) + 15
  const blessingType = getRandomBlessingType()

  const blessing = {
    id: Date.now() + Math.random(),
    ...message,
    type: blessingType.type,
    bottom: '100vh', // 从屏幕底部开始
    left,
    duration: (8 + Math.random() * 6) / speed.value, // 8-14秒上升时间，根据速度调整
    delay: 0,
    fontSize: 14 + Math.random() * 4,
    showParticles: Math.random() > 0.8,
    isEntering: true,
    isLeaving: false
  }

  // console.log('Created blessing object:', blessing)
  activeBlessings.value.push(blessing)
  // console.log('Active blessings count:', activeBlessings.value.length)

  // 设置离开动画
  const leaveTimeout = setTimeout(() => {
    // console.log('Blessing leaving:', blessing.id)
    blessing.isLeaving = true
    setTimeout(() => {
      const index = activeBlessings.value.findIndex(b => b.id === blessing.id)
      if (index > -1) {
        activeBlessings.value.splice(index, 1)
        // console.log('Removed blessing from active list, remaining:', activeBlessings.value.length)
      }
    }, 800)
  }, (blessing.duration - 0.8) * 1000)

  cleanupTimeouts.push(leaveTimeout)
}

// 处理祝福点击
const handleBlessingClick = (blessing) => {
  emit('blessing-click', blessing)
  showToast(`"${blessing.content}" — ${blessing.guestName || '祝福者'}`)
}

// 处理祝福点赞
const handleBlessingLike = (blessing) => {
  blessing.isLiked = !blessing.isLiked
  blessing.likes = (blessing.likes || 0) + (blessing.isLiked ? 1 : -1)
  emit('like', blessing.id)

  if (blessing.isLiked) {
    showSuccessToast('感谢您的祝福 ❤️')
  }
}

// 切换播放/暂停
const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value
}

// 切换输入框
const toggleInput = () => {
  showInput.value = !showInput.value
}

// 刷新祝福
const refreshBlessings = async () => {
  await loadMessages()
  showSuccessToast('祝福已刷新 ✨')
}

// 更新透明度
const updateOpacity = () => {
  // 透明度会通过样式实时更新
}

// 更新速度
const updateSpeed = () => {
  activeBlessings.value.forEach(blessing => {
    blessing.duration = (6 + Math.random() * 4) / speed.value
  })
}

// 加载消息
const loadMessages = async () => {
  try {
    isLoading.value = true
    console.log('Loading messages with params:', {
      page: 1,
      size: props.maxBlessings,
      status: 1
    })

    const response = await getMessageList({
      page: 1,
      size: props.maxBlessings,
      status: 1 // 审核通过的状态
    })

    // console.log('API Response:', response) // 调试时可开启

    // 检查响应是否存在
    if (!response) {
      console.error('API returned null/undefined response')
      showToast('网络请求失败，请检查网络连接')
      return
    }

    // 检查响应结构
    if (typeof response !== 'object') {
      console.error('API returned invalid response type:', typeof response)
      showToast('服务器响应格式错误')
      return
    }

    // 检查响应码
    if (response.code === 0) {
      // 成功响应
      if (response.data && Array.isArray(response.data.records)) {
        messages.value = response.data.records
        totalMessages.value = response.data.total || 0

        // console.log('Loaded messages:', messages.value.length, 'Total:', totalMessages.value)

        await nextTick()
        startAutoSend()
      } else {
        console.error('API response data structure invalid:', response.data)
        showToast('服务器数据格式错误')
      }
    } else {
      // 错误响应
      const errorCode = response.code !== undefined ? response.code : 'unknown'
      const errorMsg = response.msg || response.message || '未知错误'
      console.error('API returned error:', { code: errorCode, msg: errorMsg })
      showToast(`加载失败: ${errorMsg}`)
    }
  } catch (error) {
    console.error('加载祝福失败:', error)

    // 更详细的错误信息
    if (error.response) {
      // HTTP错误响应
      console.error('HTTP Error:', error.response.status, error.response.data)
      showToast(`网络错误 (${error.response.status})`)
    } else if (error.request) {
      // 网络错误
      console.error('Network Error:', error.request)
      showToast('网络连接失败，请检查网络')
    } else {
      // 其他错误
      console.error('Other Error:', error.message)
      showToast('加载失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
  }
}

// 开始自动发送祝福
const startAutoSend = () => {
  if (sendInterval) {
    clearInterval(sendInterval)
  }

  let messageIndex = 0
  const baseInterval = 1200 // 更短的间隔，让3-5条祝福同时出现

  // console.log('Starting auto send with', messages.value.length, 'messages')

  sendInterval = setInterval(() => {
    if (!isPlaying.value) {
      return
    }

    // 同时发送祝福（减少一半）
    const batchSize = Math.floor(Math.random() * 2)

    for (let i = 0; i < batchSize; i++) {
      if (messageIndex >= messages.value.length) {
        messageIndex = 0 // 循环播放
      }

      const message = messages.value[messageIndex]
      if (message) {
        // 给每条祝福添加随机延迟，避免同时出现在完全相同位置
        setTimeout(() => {
          addBlessing(message)
        }, Math.random() * 800) // 0-800ms的随机延迟
      }

      messageIndex++
    }
  }, baseInterval + Math.random() * 600) // 1200-1800ms的间隔
}

// 清理函数
const cleanup = () => {
  if (sendInterval) {
    clearInterval(sendInterval)
  }

  cleanupTimeouts.forEach(timeout => clearTimeout(timeout))
  cleanupTimeouts = []
}

// 监听属性变化
watch(() => props.speed, (newSpeed) => {
  speed.value = newSpeed
  updateSpeed()
})

watch(() => props.opacity, (newOpacity) => {
  opacity.value = newOpacity
})

// 添加初始祝福（页面加载时的占位祝福）
const addInitialBlessings = () => {
  const initialBlessings = [
    { guestName: '祝福', content: '🎉 祝宝宝百日快乐！天天开心每一天！' },
    { guestName: '匿名', content: '💝 愿宝宝健康成长，快乐无忧！' },
    { guestName: '祝福使者', content: '🎊 百日快乐，福满门庭！' },
    { guestName: '祝福使者', content: '⭐ 小宝贝，愿你拥有最美好的未来！' },
    { guestName: '爱心传递', content: '❤️ 愿宝宝茁壮成长，幸福美满！' }
  ]

  // 立即显示2-3条初始祝福
  const initialCount = Math.floor(Math.random() * 2) + 2 // 2-3条
  for (let i = 0; i < initialCount; i++) {
    setTimeout(() => {
      const blessing = initialBlessings[Math.floor(Math.random() * initialBlessings.length)]
      addBlessing(blessing)
    }, i * 300 + Math.random() * 500) // 错开显示时间
  }
}

// 生命周期
onMounted(async () => {
  isPlaying.value = props.autoStart

  // 立即显示初始祝福，提升用户体验
  addInitialBlessings()

  // 异步加载真实数据
  await loadMessages()
})

onUnmounted(() => {
  cleanup()
})

// 暴露方法给父组件
defineExpose({
  addBlessing
})
</script>

<style scoped>
.blessing-barrage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  border-radius: 0;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
}

/* 祝福飘屏区域 */
.barrage-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.barrage-viewport.paused .blessing-item {
  animation-play-state: paused;
}

/* 祝福项目 */
.blessing-item {
  position: absolute;
  user-select: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family-body);
  border-radius: 20px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  border: 1px solid transparent;
  animation: blessing-float linear infinite;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 280px;
  /* 增强文字可读性 */
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 0 4px rgba(0, 0, 0, 0.5),
    1px 1px 0px rgba(255, 255, 255, 0.3);
  font-weight: 700;
  -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.8);
}

.blessing-item:hover {
  transform: scale(1.05) translateY(-2px);
  z-index: 10;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

@keyframes blessing-float {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-200px);
    opacity: 0;
  }
}

/* 祝福类型样式 */
.blessing-type-love {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.95), rgba(255, 71, 87, 0.9));
  color: #ffffff;
  border-color: rgba(255, 107, 157, 0.6);
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.4);
}

.blessing-type-heart {
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.95), rgba(255, 20, 147, 0.9));
  color: #ffffff;
  border-color: rgba(255, 71, 87, 0.6);
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
}

.blessing-type-star {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 193, 7, 0.9));
  color: #000000;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5);
}

.blessing-type-gift {
  background: linear-gradient(135deg, rgba(255, 159, 243, 0.95), rgba(255, 20, 147, 0.9));
  color: #ffffff;
  border-color: rgba(255, 159, 243, 0.6);
  box-shadow: 0 4px 16px rgba(255, 159, 243, 0.4);
}

.blessing-type-crown {
  background: linear-gradient(135deg, rgba(255, 217, 61, 0.95), rgba(255, 193, 7, 0.9));
  color: #000000;
  border-color: rgba(255, 217, 61, 0.6);
  box-shadow: 0 4px 16px rgba(255, 217, 61, 0.4);
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5);
}

/* 祝福图标 */
.blessing-icon {
  font-size: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 祝福内容 */
.blessing-content {
  flex: 1;
  min-width: 0;
}

.blessing-message {
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
  letter-spacing: 0.3px;
}

/* 白色文字的优化阴影 */
.blessing-item:not(.blessing-type-star):not(.blessing-type-crown) .blessing-message {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.6),
    0 0 4px rgba(0, 0, 0, 0.4),
    1px 1px 0px rgba(255, 255, 255, 0.5);
}

/* 黑色文字的优化阴影 */
.blessing-item.blessing-type-star .blessing-message,
.blessing-item.blessing-type-crown .blessing-message {
  text-shadow:
    0 1px 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4),
    1px 1px 0px rgba(0, 0, 0, 0.5);
}

.blessing-sender {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
  font-weight: 500;
}

/* 发送者姓名的文字阴影 */
.blessing-item:not(.blessing-type-star):not(.blessing-type-crown) .blessing-sender {
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 6px rgba(0, 0, 0, 0.6),
    1px 1px 0px rgba(255, 255, 255, 0.6);
}

.blessing-item.blessing-type-star .blessing-sender,
.blessing-item.blessing-type-crown .blessing-sender {
  text-shadow:
    0 1px 3px rgba(255, 255, 255, 0.8),
    0 0 6px rgba(255, 255, 255, 0.6),
    1px 1px 0px rgba(0, 0, 0, 0.6);
}

/* 爱心计数 */
.blessing-hearts {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #ffffff;
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(4px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

/* 祝福特效 */
.blessing-particles {
  position: absolute;
  top: -8px;
  right: -8px;
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 10px;
  animation: particle-float 2s ease-in-out infinite;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.particle-1 {
  top: -2px;
  right: 2px;
  animation-delay: 0s;
}

.particle-2 {
  top: 6px;
  right: -2px;
  animation-delay: 0.7s;
}

.particle-3 {
  top: 2px;
  right: 10px;
  animation-delay: 1.4s;
}

@keyframes particle-float {
  0%, 100% {
    transform: translateY(0px) scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-4px) scale(1.1);
    opacity: 1;
  }
}

/* 发送祝福输入区域 */
.blessing-input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 182, 193, 0.3);
  padding: 16px;
  transform: translateY(100%);
  transition: transform var(--transition-base);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

.blessing-barrage:has(.blessing-input-area) .blessing-input-area {
  transform: translateY(0);
}

.input-container {
  max-width: 400px;
  margin: 0 auto;
}

.input-header {
  text-align: center;
  margin-bottom: 12px;
}

.input-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-solid);
  margin-bottom: 4px;
}

.input-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.blessing-input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all var(--transition-fast);
  font-family: var(--font-family-body);
}

.blessing-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
  background: rgba(255, 255, 255, 1);
}

.send-blessing-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-solid));
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

.send-blessing-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.5);
}

.send-blessing-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

/* 控制面板 */
.barrage-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 14px;
  border: 1px solid rgba(255, 182, 193, 0.3);
  box-shadow: 0 4px 16px rgba(255, 182, 193, 0.2);
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.control-btn:hover {
  background: rgba(255, 182, 193, 0.1);
  color: var(--accent-solid);
  transform: scale(1.05);
}

.control-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

.control-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 140px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.setting-label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.setting-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 182, 193, 0.2);
  outline: none;
  border-radius: 2px;
  -webkit-appearance: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255, 107, 157, 0.4);
}

.blessing-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 182, 193, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 11px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-solid);
}

.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 空状态 */
.barrage-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
}

.empty-visual {
  margin-bottom: 16px;
}

.empty-hearts {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}

.heart {
  font-size: 24px;
  animation: heart-pulse 2s ease-in-out infinite;
}

.heart-1 { animation-delay: 0s; }
.heart-2 { animation-delay: 0.3s; }
.heart-3 { animation-delay: 0.6s; }

@keyframes heart-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.empty-text {
  font-size: 15px;
  margin-bottom: 20px;
}

.empty-send-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--accent), var(--accent-solid));
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

.empty-send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.5);
}

/* 加载状态 */
.barrage-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
}

.loading-hearts {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 14px;
}

.loading-heart {
  font-size: 20px;
  animation: loading-heart-bounce 1.6s ease-in-out infinite;
}

.loading-heart-1 { animation-delay: -0.4s; }
.loading-heart-2 { animation-delay: -0.2s; }
.loading-heart-3 { animation-delay: 0s; }

@keyframes loading-heart-bounce {
  0%, 80%, 100% {
    transform: scale(0.8) translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.1) translateY(-4px);
    opacity: 1;
  }
}

.loading-text {
  font-size: 14px;
}

/* 全屏模式样式调整 */
.blessing-barrage.is-fullscreen {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: visible; /* 允许祝福飘出容器边界 */
}

.blessing-barrage.is-fullscreen .barrage-viewport {
  overflow: visible; /* 确保祝福可以飘出视口 */
}

.blessing-barrage.is-fullscreen .blessing-item {
  font-size: 14px;
  padding: 6px 10px;
  min-width: 120px;
  max-width: 200px;
}

.blessing-barrage.is-fullscreen .blessing-icon {
  font-size: 12px;
}

.blessing-barrage.is-fullscreen .blessing-message {
  font-size: 12px;
}

.blessing-barrage.is-fullscreen .blessing-sender {
  font-size: 9px;
}

.blessing-barrage.is-fullscreen .blessing-hearts {
  font-size: 10px;
  padding: 1px 4px;
}

/* 深色模式适配 */
[data-theme='dark'] .blessing-barrage {
  /* 全屏模式下不需要背景 */
}

[data-theme='dark'] .blessing-barrage:not(.is-fullscreen) {
  background: linear-gradient(135deg, rgba(37, 32, 24, 0.9), rgba(26, 22, 18, 0.9));
  border-color: rgba(212, 175, 55, 0.4);
}

[data-theme='dark'] .blessing-item {
  color: var(--text-primary);
}

[data-theme='dark'] .blessing-input-area {
  background: rgba(37, 32, 24, 0.95);
  border-color: rgba(212, 175, 55, 0.3);
}

[data-theme='dark'] .blessing-input {
  background: rgba(42, 36, 30, 0.9);
  border-color: rgba(212, 175, 55, 0.4);
  color: var(--text-primary);
}

[data-theme='dark'] .barrage-controls {
  background: rgba(37, 32, 24, 0.95);
  border-color: rgba(212, 175, 55, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .blessing-barrage {
    height: 300px;
  }

  .barrage-controls {
    top: 12px;
    right: 12px;
    padding: 10px;
    min-width: auto;
  }

  .control-settings {
    display: none; /* 移动端隐藏详细控制 */
  }

  .control-buttons {
    flex-wrap: wrap;
  }

  .blessing-stats {
    justify-content: center;
  }

  .blessing-item {
    max-width: 240px;
    padding: 6px 10px;
    font-size: 13px;
  }

  .blessing-icon {
    font-size: 14px;
  }

  .blessing-message {
    font-size: 13px;
  }

  .blessing-sender {
    font-size: 10px;
  }

  .blessing-hearts {
    font-size: 11px;
    padding: 1px 4px;
  }

  .blessing-input-area {
    padding: 12px;
  }

  .blessing-input {
    font-size: 13px;
    padding: 8px 12px;
  }

  .send-blessing-btn {
    padding: 8px 14px;
    font-size: 13px;
  }

  .empty-hearts .heart {
    font-size: 20px;
  }

  .empty-text {
    font-size: 14px;
  }
}
</style>
