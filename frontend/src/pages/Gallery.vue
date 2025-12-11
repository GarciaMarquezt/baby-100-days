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
      <div style="width: 60px;"></div>
    </header>

    <!-- 相册网格 -->
    <div v-if="list.length > 0" class="gallery-grid">
      <div 
        v-for="(item, index) in list" 
        :key="item.id" 
        class="gallery-item"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="openViewer(index)"
      >
        <div class="gallery-item__image-wrapper">
          <img 
            :src="item.imageUrl" 
            :alt="item.description || '美好瞬间'"
            loading="lazy"
            class="gallery-item__image"
            @load="onImageLoad"
          />
          <div v-if="item.category === 'video'" class="gallery-item__video-tag">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div class="gallery-item__footer">
          <div class="gallery-item__desc">{{ item.description || '美好瞬间' }}</div>
          <button 
            class="gallery-item__like"
            :class="{ 'gallery-item__like--active': item.isLiked }"
            @click.stop="handleLike(item)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                :fill="item.isLiked ? 'currentColor' : 'none'"
                :stroke="item.isLiked ? 'currentColor' : 'currentColor'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ item.likes || 0 }}</span>
          </button>
        </div>
      </div>
    </div>
    
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
import { ref, onMounted, onUnmounted } from 'vue'
import { getGalleryList, likeGallery } from '../api/gallery'
import { showToast } from 'vant'
import BabyButton from '../components/Button.vue'
import BabyModal from '../components/Modal.vue'
import ImageViewer from '../components/ImageViewer.vue'
import ImageUploader from '../components/ImageUploader.vue'
import { fadeInElements, imageLoadAnimation, initGoldParticles } from '../utils/animations'

const list = ref([])
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const showUpload = ref(false)
const showUploadFab = ref(false)

let titleClickCount = 0
let titleClickTimer = null

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
  
  try {
    const res = await likeGallery(item.id)
    if (res && res.code === 0) {
      item.isLiked = true
      item.likes = res.data
      localStorage.setItem(`liked_${item.id}`, 'true')
      showToast('点赞成功')
    } else {
      showToast('点赞失败，请稍后重试')
    }
  } catch (e) {
    console.warn('Like API failed, using local logic:', e)
    item.isLiked = true
    item.likes = (item.likes || 0) + 1
    localStorage.setItem(`liked_${item.id}`, 'true')
  }
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
  // 添加淡入动画
  setTimeout(() => {
    fadeInElements('.gallery-item', 50)
  }, 100)
  
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
        showToast('已解锁相册上传入口')
        titleClickCount = 0
      }
    })
  }
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (titleEl) {
      titleEl.onclick = null
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

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
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
