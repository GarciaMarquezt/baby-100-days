<template>
  <div class="stack-gallery">
    <!-- 照片堆叠区域 -->
    <div class="stack-container" ref="stackRef">
      <motion.div
        v-for="(item, index) in stackItems"
        :key="item.id"
        class="stack-item"
        :style="getStackStyle(index)"
        :initial="{ scale: 0, rotate: Math.random() * 20 - 10 }"
        :animate="{
          scale: 1,
          rotate: getStackRotation(index),
          x: getStackPosition(index).x,
          y: getStackPosition(index).y
        }"
        :transition="{
          delay: index * 0.1,
          type: 'spring',
          stiffness: 200,
          damping: 20
        }"
        :while-hover="{
          scale: 1.1,
          rotate: 0,
          z: 50,
          transition: { duration: 0.3 }
        }"
        :while-tap="{ scale: 0.95 }"
        @click="selectItem(item, index)"
        drag
:drag-constraints="{
          left: -200,
          right: 200,
          top: -200,
          bottom: 200
        }"
        :drag-elastic="0.2"
        @drag-end="handleDragEnd"
      >
        <div class="item-card">
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
        </div>
      </motion.div>
    </div>

    <!-- 堆叠控制 -->
    <div class="stack-controls">
      <motion.button
        class="control-btn shuffle-btn"
        @click="shuffleStack"
:while-hover="{ scale: 1.05 }"
        :while-tap="{ scale: 0.95 }"
      >
        🔀 重洗
      </motion.button>

      <motion.button
        class="control-btn spread-btn"
        @click="spreadStack"
:while-hover="{ scale: 1.05 }"
        :while-tap="{ scale: 0.95 }"
      >
        📤 展开
      </motion.button>

      <motion.button
        class="control-btn stack-btn"
        @click="stackUp"
:while-hover="{ scale: 1.05 }"
        :while-tap="{ scale: 0.95 }"
      >
        📥 堆叠
      </motion.button>
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
      :images="stackItems"
      :index="viewerIndex"
      :open="viewerOpen"
      @update:open="viewerOpen = $event"
      @update:index="viewerIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['like'])

const stackRef = ref(null)
const selectedItem = ref(null)
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const isSpread = ref(false)

// 计算属性
const stackItems = computed(() => {
  return props.photos.map((item, index) => ({
    ...item,
    stackIndex: index,
    date: item.date || new Date().toISOString().split('T')[0]
  }))
})

// 获取堆叠样式
const getStackStyle = (index) => {
  return {
    zIndex: stackItems.value.length - index
  }
}

// 获取堆叠位置
const getStackPosition = (index) => {
  if (isSpread.value) {
    // 展开模式：圆形排列
    const angle = (index / stackItems.value.length) * 360
    const radius = 200
    const radian = (angle * Math.PI) / 180

    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    }
  } else {
    // 堆叠模式：稍微错开
    const offset = index * 2
    return {
      x: (Math.random() - 0.5) * offset,
      y: (Math.random() - 0.5) * offset
    }
  }
}

// 获取堆叠旋转角度
const getStackRotation = (index) => {
  if (isSpread.value) {
    return 0
  } else {
    return (Math.random() - 0.5) * 10 * (index + 1)
  }
}

// 重洗堆叠
const shuffleStack = () => {
  // 重新排列顺序
  const shuffled = [...stackItems.value].sort(() => Math.random() - 0.5)
  stackItems.value.forEach((item, index) => {
    item.stackIndex = shuffled.findIndex(s => s.id === item.id)
  })
}

// 展开堆叠
const spreadStack = () => {
  isSpread.value = true
}

// 重新堆叠
const stackUp = () => {
  isSpread.value = false
  // 重新随机位置
  stackItems.value.forEach(item => {
    item.stackIndex = Math.floor(Math.random() * stackItems.value.length)
  })
}

// 选择项目
const selectItem = (item, index) => {
  selectedItem.value = item
  viewerIndex.value = index
  viewerOpen.value = true
}

// 处理拖拽结束
const handleDragEnd = (event, info) => {
  // 可以添加拖拽后的逻辑，比如移除照片等
  const { offset } = info
  if (Math.abs(offset.x) > 150 || Math.abs(offset.y) > 150) {
    // 拖拽距离足够大，可以触发某些操作
    console.log('Dragged far enough', offset)
  }
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

// 初始化
onMounted(() => {
  // 初始堆叠状态
  stackUp()
})
</script>

<style scoped>
.stack-gallery {
  position: relative;
  width: 100%;
  height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.stack-container {
  position: relative;
  width: 600px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stack-item {
  position: absolute;
  cursor: grab;
}

.stack-item:active {
  cursor: grabbing;
}

.item-card {
  width: 250px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  background: white;
  transition: all 0.3s ease;
}

.card-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.stack-item:hover .card-image img {
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stack-item:hover .card-overlay {
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

.stack-controls {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.control-btn {
  background: var(--gold);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.control-btn:hover {
  background: var(--gold-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
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
  .stack-gallery {
    height: 600px;
    padding: 10px;
  }

  .stack-container {
    width: 100%;
    height: 400px;
  }

  .item-card {
    width: 200px;
    height: 280px;
  }

  .card-image {
    height: 200px;
  }

  .stack-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-btn {
    padding: 10px 16px;
    font-size: 12px;
  }

  .detail-content {
    flex-direction: column;
  }

  .detail-content img {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .item-card {
    width: 180px;
    height: 250px;
  }

  .card-image {
    height: 180px;
  }
}
</style>
