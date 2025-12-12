<template>
  <div class="timeline-gallery">
    <!-- 时间线容器 -->
    <div class="timeline-container" ref="timelineRef">

      <!-- 时间轴线 -->
      <div class="timeline-line"></div>

      <!-- 时间节点 -->
      <div
        v-for="(item, index) in timelineItems"
        :key="item.id"
        class="timeline-item"
        :class="{ 'left': index % 2 === 0, 'right': index % 2 === 1 }"
        :style="{ top: `${item.position}px` }"
      >
        <!-- 时间点 -->
        <div class="timeline-dot" @click="selectItem(item)">
          <div class="dot-inner"></div>
        </div>

        <!-- 照片卡片 -->
        <motion.div
          class="photo-card"
          :initial="{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: index * 0.1, duration: 0.6 }"
:while-hover="{ scale: 1.05 }"
          @click="openViewer(item, index)"
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
              class="action-btn like-btn"
              :class="{ 'liked': item.isLiked }"
              @click.stop="handleLike(item)"
:while-tap="{ scale: 0.9 }"
            >
              ❤️ {{ item.likes || 0 }}
            </motion.button>
          </div>
        </motion.div>
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
      :images="timelineItems"
      :index="viewerIndex"
      :open="viewerOpen"
      @update:open="viewerOpen = $event"
      @update:index="viewerIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['like'])

const timelineRef = ref(null)
const selectedItem = ref(null)
const viewerOpen = ref(false)
const viewerIndex = ref(0)

// 计算时间线项目
const timelineItems = computed(() => {
  return props.photos.map((item, index) => ({
    ...item,
    position: index * 200 + 100, // 每项间隔200px，起始位置100px
    date: item.date || new Date().toISOString().split('T')[0]
  }))
})

// 选择项目
const selectItem = (item) => {
  selectedItem.value = item
}

// 打开查看器
const openViewer = (item, index) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

// 处理点赞
const handleLike = (item) => {
  emit('like', item)
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
</script>

<style scoped>
.timeline-gallery {
  position: relative;
  width: 100%;
  min-height: 600px;
  padding: 20px;
}

.timeline-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--gold), var(--accent));
  transform: translateX(-50%);
}

.timeline-item {
  position: absolute;
  width: 45%;
  left: 50%;
  transform: translateX(-50%);
}

.timeline-item.left {
  left: 0;
  transform: none;
}

.timeline-item.right {
  left: 50%;
}

.timeline-dot {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--gold);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.timeline-dot:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 20px var(--gold);
}

.dot-inner {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.photo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  cursor: pointer;
  margin: 10px;
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

.photo-card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 20px 15px 10px;
  color: white;
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
}

.action-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--accent-solid);
}

.action-btn.liked {
  background: #ff4757;
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
  .timeline-item {
    width: 80%;
  }

  .timeline-item.left,
  .timeline-item.right {
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 30px;
  }

  .timeline-line {
    left: 20px;
  }

  .timeline-dot {
    left: 20px;
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
