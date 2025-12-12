<template>
  <div class="waterfall-gallery">
    <!-- 瀑布流网格 -->
    <div class="waterfall-grid" ref="gridRef">
      <motion.div
        v-for="(item, index) in displayedItems"
        :key="item.id"
        class="waterfall-item"
        :style="getItemStyle(item)"
        :initial="{ opacity: 0, y: 50 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: index * 0.05, duration: 0.5 }"
:while-hover="{ scale: 1.02 }"
        @click="openViewer(item, index)"
      >
        <div class="item-image">
          <img v-lazy="item.imageUrl" :alt="item.description" />
          <div class="item-overlay">
            <div class="item-date">{{ formatDate(item.date) }}</div>
            <div class="item-desc">{{ item.description }}</div>
          </div>
        </div>

        <div class="item-actions">
          <motion.button
            class="like-btn"
            :class="{ 'liked': item.isLiked }"
            @click.stop="handleLike(item)"
:while-tap="{ scale: 0.9 }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                :fill="item.isLiked ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ item.likes || 0 }}
          </motion.button>
        </div>
      </motion.div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <button @click="loadMore" class="load-more-btn">
        加载更多
      </button>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      :images="displayedItems"
      :index="viewerIndex"
      :open="viewerOpen"
      @update:open="viewerOpen = $event"
      @update:index="viewerIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  columnCount: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['like', 'load-more'])

const gridRef = ref(null)
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const displayedItems = ref([])
const columnHeights = ref([])
const loading = ref(false)
const hasMore = ref(true)
const itemsPerLoad = 12

// 初始化列高度
const initColumns = () => {
  columnHeights.value = new Array(props.columnCount).fill(0)
}

// 计算项目位置
const getItemStyle = (item) => {
  const columnIndex = item.columnIndex
  const top = columnHeights.value[columnIndex]

  return {
    position: 'absolute',
    left: `${(columnIndex / props.columnCount) * 100}%`,
    top: `${top}px`,
    width: `${100 / props.columnCount}%`,
    transform: `translateX(${columnIndex * 10}px)`
  }
}

// 分配项目到列
const layoutItems = (items) => {
  initColumns()

  items.forEach((item, index) => {
    // 找到最短的列
    const shortestColumn = columnHeights.value.indexOf(Math.min(...columnHeights.value))

    item.columnIndex = shortestColumn
    item.layoutIndex = index

    // 模拟图片高度（实际应该根据图片宽高比计算）
    const imageHeight = 200 + Math.random() * 200 // 200-400px随机高度
    columnHeights.value[shortestColumn] += imageHeight + 20 // 加上间距
  })
}

// 加载更多
const loadMore = () => {
  if (loading.value) return

  loading.value = true

  // 模拟异步加载
  setTimeout(() => {
    const currentLength = displayedItems.value.length
    const newItems = props.photos.slice(currentLength, currentLength + itemsPerLoad)

    if (newItems.length > 0) {
      displayedItems.value.push(...newItems)
      layoutItems(displayedItems.value)
    }

    if (currentLength + newItems.length >= props.photos.length) {
      hasMore.value = false
    }

    loading.value = false
  }, 500)
}

// 初始化
onMounted(async () => {
  await nextTick()

  // 初始加载
  const initialItems = props.photos.slice(0, itemsPerLoad)
  displayedItems.value = [...initialItems]
  layoutItems(displayedItems.value)

  hasMore.value = props.photos.length > itemsPerLoad
})

// 打开查看器
const openViewer = (item, index) => {
  viewerIndex.value = displayedItems.value.findIndex(i => i.id === item.id)
  viewerOpen.value = true
}

// 处理点赞
const handleLike = (item) => {
  emit('like', item)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.waterfall-gallery {
  position: relative;
  width: 100%;
  min-height: 600px;
  padding: 20px;
}

.waterfall-grid {
  position: relative;
  width: 100%;
}

.waterfall-item {
  margin-bottom: 20px;
  cursor: pointer;
}

.item-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.waterfall-item:hover .item-image {
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.item-image img {
  width: 100%;
  display: block;
  transition: transform 0.3s ease;
}

.waterfall-item:hover .item-image img {
  transform: scale(1.05);
}

.item-overlay {
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

.waterfall-item:hover .item-overlay {
  opacity: 1;
}

.item-date {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.item-desc {
  font-size: 14px;
  font-weight: 500;
}

.item-actions {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.like-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.like-btn.liked {
  background: #ff4757;
  color: white;
}

.load-more {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
}

.load-more-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(199, 62, 29, 0.3);
}

.load-more-btn:hover {
  background: var(--accent-solid);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(199, 62, 29, 0.4);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .waterfall-gallery {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .waterfall-gallery {
    padding: 5px;
  }

  .waterfall-item {
    margin-bottom: 10px;
  }

  .item-actions {
    padding: 10px;
  }

  .like-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
