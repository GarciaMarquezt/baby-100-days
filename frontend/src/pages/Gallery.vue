<template>
  <div class="gallery-page">
    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>
    
    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 顶部导航 -->
    <header class="gallery-header">
      <button class="back-button" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="gallery-title">时光印记</h1>

      <!-- 视图切换按钮 -->
      <div class="view-toggle">
        <motion.button
          class="toggle-btn"
          :class="{ 'active': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          while-hover={{ scale: 1.05 }}
          while-tap={{ scale: 0.95 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </motion.button>
        <motion.button
          class="toggle-btn"
          :class="{ 'active': viewMode === 'wheel' }"
          @click="viewMode = 'wheel'"
          while-hover={{ scale: 1.05 }}
          while-tap={{ scale: 0.95 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </motion.button>
      </div>
    </header>

    <!-- 相册网格视图 -->
    <div v-if="list.length > 0 && viewMode === 'grid'" class="gallery-grid-container">
      <VirtualScroller
        :items="list"
        :item-height="140"
        :container-height="gridHeight"
        :buffer-size="3"
        @scroll="handleGridScroll"
        @load-more="handleLoadMore"
        class="gallery-virtual-scroller"
      >
        <template #default="{ item, index }">
          <motion.div
            class="gallery-item"
            :initial="{ opacity: 0, y: 30, scale: 0.9 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :transition="{
              duration: 0.5,
              delay: (index % 12) * 0.05, // 限制延迟以提高性能
              ease: [0.25, 0.46, 0.45, 0.94]
            }"
            :while-hover="{
              scale: 1.03,
              y: -6,
              transition: { duration: 0.2 }
            }"
            :while-tap="{ scale: 0.98 }"
            @click="openViewer(index)"
            @mouseenter="onItemHover(item, true)"
            @mouseleave="onItemHover(item, false)"
          >
            <div class="gallery-item__image-wrapper">
              <motion.img
                v-lazy="item.imageUrl"
                :alt="item.description || '美好瞬间'"
                class="gallery-item__image"
                :initial="{ scale: 1.1, opacity: 0 }"
                :animate="{ scale: 1, opacity: 1 }"
                :transition="{ duration: 0.4 }"
                @load="onImageLoad"
              />
              <motion.div
                v-if="item.category === 'video'"
                class="gallery-item__video-tag"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </motion.svg>
              </motion.div>

              <!-- 爱心特效 -->
              <motion.div
                v-if="item.showHeart"
                class="heart-effect"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
                @animation-complete="item.showHeart = false"
              >
                ❤️
              </motion.div>
            </div>

            <motion.div
              class="gallery-item__footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div class="gallery-item__desc">{{ item.description || '美好瞬间' }}</div>
              <motion.button
                class="gallery-item__like"
                :class="{ 'gallery-item__like--active': item.isLiked }"
                @click.stop="handleLike(item)"
                while-hover={{ scale: 1.1 }}
                while-tap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  :animate="item.isLiked ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}"
                  :transition="{ duration: 0.6 }"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    :fill="item.isLiked ? 'currentColor' : 'none'"
                    :stroke="item.isLiked ? 'currentColor' : 'currentColor'"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </motion.svg>
                <motion.span
                  :animate="item.likesChanged ? { scale: [1, 1.2, 1] } : {}"
                  :transition="{ duration: 0.3 }"
                >
                  {{ item.likes || 0 }}
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </template>
      </VirtualScroller>
    </div>

    <!-- 时光轮盘视图 -->
    <TimeWheelGallery
      v-if="list.length > 0 && viewMode === 'wheel'"
      :photos="wheelPhotos"
      @like="handleWheelLike"
      @view="handleWheelView"
    />

    <!-- 空状态 -->
    <div v-else class="gallery-empty">
      <div class="gallery-empty__icon">📭</div>
      <p class="gallery-empty__text">还没有照片哦，快来上传第一张吧</p>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      :images="list"
      :index="viewerIndex"
      :open="viewerOpen"
      @update:open="viewerOpen = $event"
      @update:index="viewerIndex = $event"
    />

    <!-- 上传按钮（隐藏彩蛋，需解锁后显示） -->
    <button v-if="showUploadFab" class="upload-fab" @click="showUpload = true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 上传弹窗 -->
    <BabyModal v-model:show="showUpload" title="上传照片/视频">
      <ImageUploader 
        :max-size="50 * 1024 * 1024"
        @uploaded="handleUploaded" 
        @error="handleUploadError" 
      />
      <template #actions>
        <BabyButton type="ghost" @click="showUpload = false">取消</BabyButton>
      </template>
    </BabyModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getGalleryList, likeGallery } from '../api/gallery'
import { showToast } from 'vant'
import VueLazyload from 'vue-lazyload'
import { staggerAnimation, cardHoverAnimation, rippleAnimation, bounceInAnimation, touchFeedbackAnimation, createLongPressHandler, scrollToElement, createParallaxEffect } from '../utils/animations'
import { useGesture } from '@vueuse/gesture'
import BabyButton from '../components/Button.vue'
import BabyModal from '../components/Modal.vue'
import ImageViewer from '../components/ImageViewer.vue'
import ImageUploader from '../components/ImageUploader.vue'
import TimeWheelGallery from '../components/TimeWheelGallery.vue'
import VirtualScroller from '../components/VirtualScroller.vue'
import { fadeInElements, imageLoadAnimation, initGoldParticles } from '../utils/animations'

const list = ref([])
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const showUpload = ref(false)
const showUploadFab = ref(false)
const viewMode = ref('grid') // 'grid' 或 'wheel'
const gridHeight = ref(600) // 网格容器高度

let titleClickCount = 0
let titleClickTimer = null
let cleanupLongPress = null
let cleanupParallax = null

// 演示数据
const demoData = [
    { id: 1, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', description: '第一次抬头', category: 'photo', likes: 128, isLiked: false },
    { id: 2, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', description: '百天快乐', category: 'photo', likes: 88, isLiked: false },
    { id: 3, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', description: '可爱的睡颜', category: 'photo', likes: 66, isLiked: false },
    { id: 4, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg', description: '公园晒太阳', category: 'photo', likes: 45, isLiked: false },
]

// 加载照片数据
const loadPhotos = async () => {
  try {
    const res = await getGalleryList()
    if (res && res.length > 0) {
      list.value = res.map(item => ({
        ...item,
        isLiked: localStorage.getItem(`liked_${item.id}`) === 'true',
        likes: item.likes || 0
      }))
    } else {
      list.value = demoData
    }
  } catch (e) {
    console.warn('API error, falling back to demo data:', e)
    list.value = demoData
  }
}

const openViewer = (index) => {
  viewerIndex.value = index
  viewerOpen.value = true
}

const handleLike = async (item) => {
  if (item.isLiked) {
    showToast('您已经点过赞了')
    return
  }

  // 触发波纹效果
  const button = event.target.closest('.gallery-item__like')
  if (button) {
    rippleAnimation(button)
  }

  try {
    const res = await likeGallery(item.id)
    if (res && res.code === 0) {
      item.isLiked = true
      item.likes = res.data
      item.likesChanged = true
      item.showHeart = true
      localStorage.setItem(`liked_${item.id}`, 'true')
      showToast('点赞成功')

      // 重置动画状态
      setTimeout(() => {
        item.likesChanged = false
      }, 300)
    } else {
      showToast('点赞失败，请稍后重试')
    }
  } catch (e) {
    console.warn('Like API failed, using local logic:', e)
    item.isLiked = true
    item.likes = (item.likes || 0) + 1
    item.likesChanged = true
    item.showHeart = true
    localStorage.setItem(`liked_${item.id}`, 'true')

    setTimeout(() => {
      item.likesChanged = false
    }, 300)
  }
}

// 项目悬停处理
const onItemHover = (item, isHover) => {
  if (isHover) {
    // 可以添加悬停时的额外效果
  }
}

// 时光轮盘视图的数据处理
const wheelPhotos = computed(() => {
  return list.value.map((item, index) => ({
    ...item,
    date: index + 1 // 模拟日期数据
  }))
})

// 处理时光轮盘的点赞
const handleWheelLike = (item) => {
  handleLike(item)
}

// 处理时光轮盘的查看
const handleWheelView = (item) => {
  const index = list.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    openViewer(index)
  }
}

// 网格滚动处理
const handleGridScroll = (scrollTop) => {
  // 可以在这里添加滚动相关的优化逻辑
}

// 加载更多数据
const handleLoadMore = (done) => {
  // 模拟异步加载更多数据
  setTimeout(() => {
    // 这里可以添加实际的加载更多逻辑
    done()
  }, 1000)
}

const onImageLoad = (e) => {
  imageLoadAnimation(e.target)
}

const handleUploaded = async (results) => {
  if (!results || results.length === 0) {
    return
  }

  const successList = results.filter(r => r && r.success)
  const failedList = results.filter(r => r && !r.success)

  if (successList.length > 0) {
    if (failedList.length === 0) {
      showToast(`已成功上传 ${successList.length} 个文件`)
      showUpload.value = false
    } else {
      showToast(`成功 ${successList.length} 个，失败 ${failedList.length} 个，可在弹窗中重试失败项目`)
    }

    await loadPhotos()
    setTimeout(() => {
      fadeInElements('.gallery-item', 50)
    }, 100)
  } else if (failedList.length > 0) {
    showToast('上传失败，可在弹窗中重新上传失败的文件')
  }
}

const handleUploadError = (error) => {
  showToast(error || '上传失败')
}

let cleanupParticles = null

onMounted(async () => {
  await loadPhotos()

  // 等待DOM更新后应用动画
  await nextTick()

  // 使用GSAP的交错动画
  const galleryGrid = document.querySelector('.gallery-grid')
  if (galleryGrid) {
    staggerAnimation(galleryGrid, '.gallery-item', 0.08)
  }

  // 初始化金粉粒子动画
  cleanupParticles = initGoldParticles('goldParticles', {
    particleCount: 40,
    colors: ['#D4AF37', '#E8D5A3', '#B8941F']
  })

  const handleResize = () => {
    const canvas = document.getElementById('goldParticles')
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }
  window.addEventListener('resize', handleResize)

  // 标题点击 5 次解锁上传入口
  const titleEl = document.querySelector('.gallery-title')
  if (titleEl) {
    titleEl.addEventListener('click', () => {
      titleClickCount++
      if (titleClickTimer) clearTimeout(titleClickTimer)
      titleClickTimer = setTimeout(() => { titleClickCount = 0 }, 800)
      if (titleClickCount >= 5 && !showUploadFab.value) {
        showUploadFab.value = true
        bounceInAnimation(document.querySelector('.upload-fab'))
        showToast('已解锁相册上传入口')
        titleClickCount = 0
      }
    })

    // 添加长按手势
    cleanupLongPress = createLongPressHandler(titleEl, () => {
      showToast('长按进入管理模式')
      // 这里可以添加管理模式的逻辑
    }, 1000)
  }

  // 添加视差滚动效果
  const pageGlow = document.querySelector('.page-glow')
  if (pageGlow) {
    cleanupParallax = createParallaxEffect(pageGlow, 0.3)
  }

  // 添加手势支持到相册网格
  const galleryGrid = document.querySelector('.gallery-grid')
  if (galleryGrid) {
    // 双指缩放手势
    let initialDistance = 0
    let currentScale = 1

    const handleGesture = (e) => {
      if (e.touches && e.touches.length === 2) {
        e.preventDefault()

        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )

        if (initialDistance === 0) {
          initialDistance = currentDistance
        }

        const scale = currentDistance / initialDistance
        currentScale = Math.min(Math.max(scale, 0.5), 2)

        gsap.set(galleryGrid, { scale: currentScale })
      }
    }

    const resetScale = () => {
      gsap.to(galleryGrid, { scale: 1, duration: 0.3, ease: "power2.out" })
      initialDistance = 0
      currentScale = 1
    }

    galleryGrid.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = 0
      }
    })

    galleryGrid.addEventListener('touchmove', handleGesture, { passive: false })
    galleryGrid.addEventListener('touchend', resetScale)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (titleEl) {
      titleEl.onclick = null
    }
    if (cleanupLongPress) {
      cleanupLongPress()
    }
    if (cleanupParallax) {
      cleanupParallax()
    }
  })
})

onUnmounted(() => {
  if (cleanupParticles) {
    cleanupParticles()
  }
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  padding: var(--spacing-md);
  padding-top: calc(var(--safe-area-top) + var(--spacing-md));
  padding-bottom: calc(var(--safe-area-bottom) + 80px);
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

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 0;
  color: var(--gold-dark);
  font-size: var(--font-size-body);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.back-button svg {
  color: var(--gold);
}

.back-button:hover {
  background: var(--muted);
}

.gallery-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
}

.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
}

.toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 2px solid var(--gold);
  background: var(--card-bg);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.toggle-btn:hover {
  background: var(--gold);
  color: white;
  transform: translateY(-1px);
}

.toggle-btn.active {
  background: var(--gold);
  color: white;
  box-shadow: var(--shadow-sm);
}

.gallery-grid-container {
  width: 100%;
  margin-top: var(--spacing-md);
}

.gallery-virtual-scroller {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-sm);
}

.gallery-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
}

.gallery-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.gallery-item:active {
  transform: scale(0.98);
}

.gallery-item__image-wrapper {
  position: relative;
  padding-top: 100%;
  background: linear-gradient(135deg, #fff0f6, #ffeef6);
  overflow: hidden;
}

.gallery-item__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item__video-tag {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.gallery-item__footer {
  padding: var(--spacing-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xs);
}

.gallery-item__desc {
  font-size: var(--font-size-small);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-item__like {
  display: flex;
  align-items: center;
  gap: 2px;
  background: transparent;
  border: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.gallery-item__like:hover {
  background: var(--muted);
}

.gallery-item__like--active {
  color: var(--accent-solid);
}

.gallery-item__like svg {
  flex-shrink: 0;
}

/* 爱心特效 */
.heart-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  z-index: 10;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(255, 79, 139, 0.5);
}

.gallery-empty {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  color: var(--text-secondary);
}

.gallery-empty__icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.6;
}

.gallery-empty__text {
  font-size: var(--font-size-body);
  margin: 0;
}

.upload-fab {
  position: fixed;
  bottom: calc(var(--safe-area-bottom) + 20px);
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-image: var(--accent);
  border: 2px solid var(--gold);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-accent);
  cursor: pointer;
  z-index: 100;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.upload-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(255, 79, 139, 0.25);
}

.upload-fab:active {
  transform: scale(0.95);
}
</style>
