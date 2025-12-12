<template>
  <div class="time-wheel-gallery">
    <!-- 时光轮盘容器 -->
    <div class="time-wheel-container" ref="wheelRef">
      <!-- 中心日期显示 -->
      <div class="center-date-display">
        <div
          class="date-circle"
          :style="{
            transform: `rotate(${currentRotation}deg) scale(${selectedItem ? 1.1 : 1})`
          }"
        >
          <div class="date-text">
            <div class="date-number">{{ selectedDate }}</div>
            <div class="date-label">第{{ selectedDate }}天</div>
          </div>
        </div>
      </div>

      <!-- 时光轮盘项目 -->
      <div
        class="time-wheel"
        :style="{ transform: `rotate(${wheelRotation}deg)` }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="item.id"
          class="wheel-item"
          :style="getItemPosition(index)"
          @click="selectItem(item, index)"
        >
          <div
            class="wheel-item-content"
            :class="{ 'selected': selectedItem?.id === item.id }"
            :style="{
              transform: `scale(${selectedItem?.id === item.id ? 1.2 : 1}) rotate(${selectedItem?.id === item.id ? -wheelRotation : 0}deg)`
            }"
          >
            <img
              v-lazy="item.imageUrl"
              :alt="item.description"
              class="wheel-item-image"
            />
            <div class="wheel-item-overlay">
              <div class="wheel-item-date">{{ item.date }}</div>
              <div class="wheel-item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
          </div>

      <!-- 轮盘控制按钮 -->
      <div class="wheel-controls">
        <button
          class="control-btn prev-btn"
          @click="rotateWheel(-1)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button
          class="control-btn next-btn"
          @click="rotateWheel(1)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 自动播放控制 -->
      <div class="autoplay-controls">
        <button
          class="autoplay-btn"
          @click="toggleAutoplay"
          :class="{ 'playing': isAutoplay }"
        >
          <svg v-if="!isAutoplay" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 详细信息面板 -->
    <div
      v-if="selectedItem"
      class="detail-panel"
    >
      <div class="detail-header">
        <h3
          class="detail-title"
        >
          第{{ selectedItem.date }}天 · {{ selectedItem.description }}
        </h3>
        <button
          class="close-detail-btn"
          @click="closeDetail"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div
        class="detail-content"
      >
        <div class="detail-image">
          <img :src="selectedItem.imageUrl" :alt="selectedItem.description" />
        </div>

        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">拍摄时间:</span>
            <span class="info-value">{{ formatDate(selectedItem.date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">描述:</span>
            <span class="info-value">{{ selectedItem.description }}</span>
          </div>
          <div v-if="selectedItem.likes" class="info-item">
            <span class="info-label">点赞:</span>
            <span class="info-value">{{ selectedItem.likes }}</span>
          </div>
        </div>

        <div class="detail-actions">
          <button
            class="action-btn like-btn"
            :class="{ 'liked': selectedItem.isLiked }"
            @click="handleLike(selectedItem)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              :class="{ 'liked': selectedItem.isLiked }"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                :fill="selectedItem.isLiked ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ selectedItem.likes || 0 }}
          </button>

          <button
            class="action-btn view-btn"
            @click="openViewer(selectedItem)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            查看大图
          </button>
        </div>
          </div>
          </div>

    <!-- 时光线条背景 -->
    <div class="timeline-bg">
      <div
        v-for="n in 30"
        :key="n"
        class="timeline-line"
        :style="{ animationDelay: `${n * 0.1}s` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useGesture } from '@vueuse/gesture'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['like', 'view'])

// 响应式数据
const wheelRef = ref(null)
const selectedItem = ref(null)
const currentRotation = ref(0)
const wheelRotation = ref(0)
const isAutoplay = ref(false)
const autoplayInterval = ref(null)

// 计算属性
const visibleItems = computed(() => {
  // 取最近30天的照片，如果不够则重复
  const recentPhotos = props.photos.slice(0, 30)
  if (recentPhotos.length < 30) {
    const repeated = []
    while (repeated.length < 30) {
      repeated.push(...recentPhotos)
    }
    return repeated.slice(0, 30)
  }
  return recentPhotos
})

const selectedDate = computed(() => {
  return selectedItem.value?.date || 1
})

// 方法
const getItemPosition = (index) => {
  const angle = (index / visibleItems.value.length) * 360
  const radius = 180 // 轮盘半径
  const x = Math.cos((angle - 90) * Math.PI / 180) * radius
  const y = Math.sin((angle - 90) * Math.PI / 180) * radius

  return {
    transform: `translate(${x}px, ${y}px)`,
    left: '50%',
    top: '50%',
    marginLeft: '-40px',
    marginTop: '-40px'
  }
}

const selectItem = (item, index) => {
  selectedItem.value = item

  // 计算轮盘旋转角度，使选中项位于顶部
  const targetAngle = -(index / visibleItems.value.length) * 360
  wheelRotation.value = targetAngle
  currentRotation.value = targetAngle
}

const rotateWheel = (direction) => {
  const step = 360 / visibleItems.value.length
  wheelRotation.value += step * direction
  currentRotation.value += step * direction

  // 更新选中项
  const currentIndex = Math.round((-wheelRotation.value / 360) * visibleItems.value.length) % visibleItems.value.length
  const safeIndex = currentIndex < 0 ? currentIndex + visibleItems.value.length : currentIndex
  selectedItem.value = visibleItems.value[safeIndex] || visibleItems.value[0]
}

const toggleAutoplay = () => {
  isAutoplay.value = !isAutoplay.value

  if (isAutoplay.value) {
    autoplayInterval.value = setInterval(() => {
      rotateWheel(1)
    }, 3000)
  } else {
    if (autoplayInterval.value) {
      clearInterval(autoplayInterval.value)
      autoplayInterval.value = null
    }
  }
}

const closeDetail = () => {
  selectedItem.value = null
}

const handleLike = (item) => {
  emit('like', item)
}

const openViewer = (item) => {
  emit('view', item)
}

const formatDate = (date) => {
  return `第${date}天`
}

// 生命周期
onMounted(() => {
  // 初始化选中第一项
  if (visibleItems.value.length > 0) {
    selectedItem.value = visibleItems.value[0]
  }

  // 添加键盘控制
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      rotateWheel(-1)
    } else if (e.key === 'ArrowRight') {
      rotateWheel(1)
    } else if (e.key === ' ') {
      e.preventDefault()
      toggleAutoplay()
    } else if (e.key === 'Escape') {
      closeDetail()
    }
  }

  window.addEventListener('keydown', handleKeydown)

  // 添加手势支持
  if (wheelRef.value) {
    // 触摸滑动控制轮盘
    let startX = 0
    let isDragging = false

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX
      isDragging = true
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return

      const currentX = e.touches[0].clientX
      const deltaX = currentX - startX

      if (Math.abs(deltaX) > 50) {
        const direction = deltaX > 0 ? -1 : 1
        rotateWheel(direction)
        startX = currentX
      }
    }

    const handleTouchEnd = () => {
      isDragging = false
    }

    wheelRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    wheelRef.value.addEventListener('touchmove', handleTouchMove, { passive: true })
    wheelRef.value.addEventListener('touchend', handleTouchEnd)

    onUnmounted(() => {
      if (wheelRef.value) {
        wheelRef.value.removeEventListener('touchstart', handleTouchStart)
        wheelRef.value.removeEventListener('touchmove', handleTouchMove)
        wheelRef.value.removeEventListener('touchend', handleTouchEnd)
      }
    })
  }

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (autoplayInterval.value) {
      clearInterval(autoplayInterval.value)
    }
  })
})
</script>

<style scoped>
.time-wheel-gallery {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.time-wheel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-date-display {
  position: absolute;
  z-index: 10;
}

.date-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--gold));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-accent);
  border: 3px solid var(--gold);
}

.date-text {
  text-align: center;
  color: white;
  font-family: var(--font-family);
}

.date-number {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}

.date-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.time-wheel {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 50%;
}

.wheel-item {
  position: absolute;
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.wheel-item-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--gold);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.wheel-item-content.selected {
  border-color: var(--accent-solid);
  box-shadow: var(--shadow-accent);
}

.wheel-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.wheel-item-content:hover .wheel-item-image {
  transform: scale(1.1);
}

.wheel-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 8px;
  color: white;
  font-size: 10px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wheel-item-content:hover .wheel-item-overlay {
  opacity: 1;
}

.wheel-item-date {
  font-weight: bold;
  font-size: 11px;
}

.wheel-item-desc {
  font-size: 9px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wheel-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid var(--gold);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.control-btn:hover {
  background: var(--gold);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.autoplay-controls {
  position: absolute;
  top: 20px;
  right: 20px;
}

.autoplay-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid var(--accent-solid);
  color: var(--accent-solid);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.autoplay-btn:hover {
  background: var(--accent-solid);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.detail-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  z-index: 20;
  max-height: 400px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.detail-title {
  font-size: var(--font-size-h2);
  font-family: var(--font-family);
  color: var(--text-primary);
  margin: 0;
}

.close-detail-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
}

.close-detail-btn:hover {
  background: var(--muted);
  color: var(--text-primary);
}

.detail-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--spacing-md);
}

.detail-image img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item {
  display: flex;
  gap: var(--spacing-sm);
}

.info-label {
  font-weight: bold;
  color: var(--text-secondary);
  min-width: 60px;
}

.info-value {
  color: var(--text-primary);
}

.detail-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  background: transparent;
  color: var(--gold);
  font-size: var(--font-size-body);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--gold);
  color: white;
  transform: translateY(-2px);
}

.action-btn.liked {
  border-color: var(--accent-solid);
  color: var(--accent-solid);
}

.action-btn.liked:hover {
  background: var(--accent-solid);
}

.timeline-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.timeline-line {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, var(--gold-light), transparent);
  opacity: 0.3;
  animation: timelinePulse 3s infinite;
}

.timeline-line:nth-child(1) { left: 5%; }
.timeline-line:nth-child(2) { left: 10%; }
.timeline-line:nth-child(3) { left: 15%; }
.timeline-line:nth-child(4) { left: 20%; }
.timeline-line:nth-child(5) { left: 25%; }
.timeline-line:nth-child(6) { left: 30%; }
.timeline-line:nth-child(7) { left: 35%; }
.timeline-line:nth-child(8) { left: 40%; }
.timeline-line:nth-child(9) { left: 45%; }
.timeline-line:nth-child(10) { left: 50%; }
.timeline-line:nth-child(11) { left: 55%; }
.timeline-line:nth-child(12) { left: 60%; }
.timeline-line:nth-child(13) { left: 65%; }
.timeline-line:nth-child(14) { left: 70%; }
.timeline-line:nth-child(15) { left: 75%; }
.timeline-line:nth-child(16) { left: 80%; }
.timeline-line:nth-child(17) { left: 85%; }
.timeline-line:nth-child(18) { left: 90%; }
.timeline-line:nth-child(19) { left: 95%; }

@keyframes timelinePulse {
  0%, 100% {
    opacity: 0.1;
    transform: scaleY(0.8);
  }
  50% {
    opacity: 0.4;
    transform: scaleY(1.2);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .time-wheel-gallery {
    height: 500px;
  }

  .time-wheel {
    width: 320px;
    height: 320px;
  }

  .wheel-item {
    width: 60px;
    height: 60px;
    margin-left: -30px;
    margin-top: -30px;
  }

  .date-circle {
    width: 100px;
    height: 100px;
  }

  .date-number {
    font-size: 24px;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
