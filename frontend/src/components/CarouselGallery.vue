<template>
  <div class="carousel-gallery">
    <!-- 3D旋转木马容器 -->
    <div class="carousel-container" ref="carouselRef">
      <motion.div
        class="carousel-wrapper"
        :animate="{ rotateY: rotation }"
        :transition="{ type: 'spring', stiffness: 100, damping: 20 }"
      >
        <div
          v-for="(item, index) in carouselItems"
          :key="item.id"
          class="carousel-item"
          :style="getItemTransform(index)"
          @click="selectItem(item, index)"
        >
          <motion.div
            class="item-card"
            :class="{ 'active': selectedIndex === index }"
            :while-hover="{ scale: 1.1, z: 50 }"
            :animate="{
              rotateY: getItemRotation(index),
              z: selectedIndex === index ? 100 : 0
            }"
            :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
          >
            <div class="card-image">
              <img v-lazy="item.imageUrl" :alt="item.description" />
              <div class="card-overlay">
                <div class="card-date">{{ formatDate(item.date) }}</div>
                <div class="card-desc">{{ item.description }}</div>
              </div>
            </div>

            <div class="card-actions">
              <motion.button
                class="like-btn"
                :class="{ 'liked': item.isLiked }"
                @click.stop="handleLike(item)"
:while-tap="{ scale: 0.9 }"
              >
                ❤️ {{ item.likes || 0 }}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <!-- 导航指示器 -->
      <div class="carousel-indicators">
        <button
          v-for="(item, index) in carouselItems"
          :key="item.id"
          class="indicator"
          :class="{ 'active': selectedIndex === index }"
          @click="goToItem(index)"
        ></button>
      </div>

      <!-- 控制按钮 -->
      <div class="carousel-controls">
        <motion.button
          class="control-btn prev-btn"
          @click="prevItem"
:while-hover="{ scale: 1.1 }"
          :while-tap="{ scale: 0.9 }"
        >
          ‹
        </motion.button>

        <motion.button
          class="control-btn next-btn"
          @click="nextItem"
:while-hover="{ scale: 1.1 }"
          :while-tap="{ scale: 0.9 }"
        >
          ›
        </motion.button>
      </div>

      <!-- 自动播放控制 -->
      <div class="autoplay-control">
        <motion.button
          class="autoplay-btn"
          @click="toggleAutoplay"
          :animate="{ scale: isAutoplay ? [1, 1.1, 1] : 1 }"
          :transition="{ duration: 0.5, repeat: isAutoplay ? Infinity : 0 }"
        >
          {{ isAutoplay ? '⏸' : '▶' }}
        </motion.button>
      </div>
    </div>

    <!-- 详细信息面板 -->
    <motion.div
      v-if="selectedItem"
      class="detail-panel"
    >
      <div class="detail-content">
        <img :src="selectedItem.imageUrl" :alt="selectedItem.description" />
        <div class="detail-info">
          <h3>{{ selectedItem.description }}</h3>
          <p>{{ formatDate(selectedItem.date) }}</p>
        </div>
        <button @click="closeDetail">✕</button>
      </div>
    </motion.div>

    <!-- 图片查看器 -->
    <ImageViewer
      :images="carouselItems"
      :index="viewerIndex"
      :open="viewerOpen"
      @update:open="viewerOpen = $event"
      @update:index="viewerIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  radius: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['like'])

const carouselRef = ref(null)
const selectedIndex = ref(0)
const selectedItem = ref(null)
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const isAutoplay = ref(false)
const autoplayInterval = ref(null)

// 计算属性
const rotation = computed(() => {
  return -(selectedIndex.value / carouselItems.value.length) * 360
})

const carouselItems = computed(() => {
  return props.photos.map((item, index) => ({
    ...item,
    date: item.date || new Date().toISOString().split('T')[0]
  }))
})

// 获取项目变换
const getItemTransform = (index) => {
  const angle = (index / carouselItems.value.length) * 360
  const radian = (angle * Math.PI) / 180

  const x = Math.sin(radian) * props.radius
  const z = Math.cos(radian) * props.radius

  return {
    transform: `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg)`
  }
}

// 获取项目旋转角度
const getItemRotation = (index) => {
  const diff = index - selectedIndex.value
  const itemCount = carouselItems.value.length
  const normalizedDiff = ((diff % itemCount) + itemCount) % itemCount

  if (normalizedDiff <= itemCount / 2) {
    return normalizedDiff * 360 / itemCount
  } else {
    return -(itemCount - normalizedDiff) * 360 / itemCount
  }
}

// 选择项目
const selectItem = (item, index) => {
  selectedIndex.value = index
  selectedItem.value = item
}

// 前往指定项目
const goToItem = (index) => {
  selectedIndex.value = index
  selectedItem.value = carouselItems.value[index]
}

// 上一项
const prevItem = () => {
  const newIndex = selectedIndex.value > 0 ? selectedIndex.value - 1 : carouselItems.value.length - 1
  goToItem(newIndex)
}

// 下一项
const nextItem = () => {
  const newIndex = selectedIndex.value < carouselItems.value.length - 1 ? selectedIndex.value + 1 : 0
  goToItem(newIndex)
}

// 切换自动播放
const toggleAutoplay = () => {
  isAutoplay.value = !isAutoplay.value

  if (isAutoplay.value) {
    autoplayInterval.value = setInterval(() => {
      nextItem()
    }, 3000)
  } else {
    if (autoplayInterval.value) {
      clearInterval(autoplayInterval.value)
      autoplayInterval.value = null
    }
  }
}

// 处理点赞
const handleLike = (item) => {
  emit('like', item)
}

// 打开查看器
const openViewer = (item, index) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

// 关闭详情
const closeDetail = () => {
  selectedItem.value = null
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知日期'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  if (carouselItems.value.length > 0) {
    selectedItem.value = carouselItems.value[0]
  }

  // 键盘控制
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevItem()
    } else if (e.key === 'ArrowRight') {
      nextItem()
    } else if (e.key === ' ') {
      e.preventDefault()
      toggleAutoplay()
    }
  }

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (autoplayInterval.value) {
      clearInterval(autoplayInterval.value)
    }
  })
})
</script>

<style scoped>
.carousel-gallery {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
}

.carousel-item {
  position: absolute;
  width: 200px;
  height: 280px;
  left: 50%;
  top: 50%;
  margin-left: -100px;
  margin-top: -140px;
  cursor: pointer;
}

.item-card {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  background: white;
}

.item-card.active {
  box-shadow: 0 12px 48px rgba(212, 175, 55, 0.3);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 15px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-card:hover .card-overlay {
  opacity: 1;
}

.card-date {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.card-desc {
  font-size: 14px;
  font-weight: 500;
}

.card-actions {
  padding: 15px;
  display: flex;
  justify-content: center;
}

.like-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.like-btn:hover {
  background: var(--accent-solid);
}

.like-btn.liked {
  background: #ff4757;
}

.carousel-indicators {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--gold);
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--gold);
  color: var(--gold);
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.control-btn:hover {
  background: var(--gold);
  color: white;
  transform: scale(1.1);
}

.autoplay-control {
  position: absolute;
  bottom: -60px;
  right: 20px;
}

.autoplay-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--gold);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(199, 62, 29, 0.3);
}

.autoplay-btn:hover {
  background: var(--accent-solid);
  transform: scale(1.1);
}

.detail-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  z-index: 1000;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.detail-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.detail-content img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-info h3 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.detail-info p {
  margin: 0;
  color: var(--text-secondary);
}

.detail-panel button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-gallery {
    height: 500px;
  }

  .carousel-controls {
    padding: 0 10px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .carousel-indicators {
    bottom: -50px;
  }

  .autoplay-control {
    bottom: -50px;
    right: 10px;
  }

  .autoplay-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .detail-content {
    flex-direction: column;
  }

  .detail-content img {
    width: 100%;
    height: 200px;
  }
}
</style>
