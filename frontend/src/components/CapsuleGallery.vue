<template>
  <div class="capsule-gallery">
    <!-- 时光胶囊导航 -->
    <div class="capsule-nav">
      <motion.button
        v-for="capsule in capsules"
        :key="capsule.id"
        class="capsule-tab"
        :class="{ 'active': selectedCapsule?.id === capsule.id }"
        @click="selectCapsule(capsule)"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: capsule.index * 0.1 }"
:while-hover="{ scale: 1.05 }"
        :while-tap="{ scale: 0.95 }"
      >
        <div class="tab-icon">{{ capsule.icon }}</div>
        <div class="tab-title">{{ capsule.title }}</div>
        <div class="tab-count">{{ capsule.photos.length }}</div>
      </motion.button>
    </div>

    <!-- 胶囊内容区域 -->
    <motion.div
      v-if="selectedCapsule"
      class="capsule-content"
      :key="selectedCapsule.id"
    >
      <div class="content-header">
        <motion.h2
          class="content-title"
        >
          {{ selectedCapsule.icon }} {{ selectedCapsule.title }}
        </motion.h2>
        <motion.p
          class="content-desc"
        >
          {{ selectedCapsule.description }}
        </motion.p>
      </div>

      <!-- 照片网格 -->
      <motion.div
        class="photo-grid"
        initial="hidden"
        animate="visible"
:variants="{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }"
      >
        <motion.div
          v-for="(item, index) in selectedCapsule.photos"
          :key="item.id"
          class="photo-item"
:variants="{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: { opacity: 1, y: 0, scale: 1 }
          }"
:while-hover="{ scale: 1.05, y: -5 }"
          :transition="{ type: 'spring', stiffness: 300 }"
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
              ❤️ {{ item.likes || 0 }}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>

    <!-- 空状态 -->
    <motion.div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">📅</div>
      <h3>选择时光胶囊</h3>
      <p>点击上面的胶囊按钮，探索不同时期的美好回忆</p>
    </motion.div>

    <!-- 图片查看器 -->
    <ImageViewer
      :images="selectedCapsule?.photos || []"
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

const selectedCapsule = ref(null)
const viewerOpen = ref(false)
const viewerIndex = ref(0)

// 计算时光胶囊
const capsules = computed(() => {
  const grouped = {}

  // 按月份分组
  props.photos.forEach((photo, index) => {
    const date = new Date(photo.date || Date.now())
    const month = date.getMonth()
    const season = getSeason(month)

    if (!grouped[season]) {
      grouped[season] = {
        id: season,
        title: getSeasonName(season),
        icon: getSeasonIcon(season),
        description: getSeasonDescription(season),
        photos: [],
        index: Object.keys(grouped).length
      }
    }

    grouped[season].photos.push({
      ...photo,
      date: photo.date || new Date().toISOString().split('T')[0]
    })
  })

  return Object.values(grouped)
})

// 获取季节
const getSeason = (month) => {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

// 获取季节名称
const getSeasonName = (season) => {
  const names = {
    spring: '春日时光',
    summer: '夏日回忆',
    autumn: '秋日印记',
    winter: '冬日温暖'
  }
  return names[season] || '美好时光'
}

// 获取季节图标
const getSeasonIcon = (season) => {
  const icons = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️'
  }
  return icons[season] || '📅'
}

// 获取季节描述
const getSeasonDescription = (season) => {
  const descriptions = {
    spring: '万物复苏，生命绽放的季节',
    summer: '热情洋溢，活力四射的时光',
    autumn: '金黄绚丽，收获丰硕的时节',
    winter: '洁白宁静，温暖内心的冬天'
  }
  return descriptions[season] || '珍贵的回忆时光'
}

// 选择胶囊
const selectCapsule = (capsule) => {
  selectedCapsule.value = capsule
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

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 初始化
onMounted(() => {
  // 默认选择第一个胶囊
  if (capsules.value.length > 0) {
    selectedCapsule.value = capsules.value[0]
  }
})
</script>

<style scoped>
.capsule-gallery {
  position: relative;
  width: 100%;
  min-height: 600px;
  padding: 20px;
}

.capsule-nav {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.capsule-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  min-width: 120px;
}

.capsule-tab:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.capsule-tab.active {
  border-color: var(--gold);
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  color: white;
}

.tab-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.tab-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.tab-count {
  font-size: 12px;
  opacity: 0.8;
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 5px;
}

.capsule-tab.active .tab-count {
  background: rgba(255,255,255,0.2);
}

.capsule-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.content-header {
  text-align: center;
  margin-bottom: 40px;
}

.content-title {
  font-size: 28px;
  margin: 0 0 10px 0;
  color: var(--text-primary);
  font-family: var(--font-family);
}

.content-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.photo-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.item-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover .item-image img {
  transform: scale(1.1);
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

.photo-item:hover .item-overlay {
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .capsule-gallery {
    padding: 10px;
  }

  .capsule-nav {
    gap: 10px;
  }

  .capsule-tab {
    padding: 15px;
    min-width: 100px;
  }

  .tab-icon {
    font-size: 24px;
  }

  .tab-title {
    font-size: 12px;
  }

  .capsule-content {
    padding: 20px;
  }

  .content-title {
    font-size: 24px;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .item-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .capsule-nav {
    flex-direction: column;
    align-items: center;
  }

  .capsule-tab {
    width: 100%;
    max-width: 300px;
    flex-direction: row;
    justify-content: center;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .item-image {
    height: 120px;
  }
}
</style>
