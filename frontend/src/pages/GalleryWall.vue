<template>
  <div class="gallery-wall-page">
    <!-- 柔光圆形背景 -->
    <div class="page-glow"></div>
    
    <!-- 金粉粒子背景 -->
    <canvas id="goldParticles" class="gold-particles"></canvas>
    
    <!-- 顶部导航 -->
    <header class="gallery-wall-header">
      <button class="back-button" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="gallery-wall-title" @click="handleTitleClick">相册</h1>
      <div style="width: 60px;"></div>
    </header>


    <!-- 相册内容 -->
    <div class="gallery-content">
      <!-- 相册网格 -->
      <div v-if="galleryList.length > 0" class="gallery-grid">
        <div 
          v-for="(item, index) in galleryList" 
          :key="item.id" 
          class="gallery-item"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="openViewer(index)"
        >
          <div class="gallery-item__image-wrapper">
          <div v-if="item._fallback" class="gallery-item__placeholder">
            美好瞬间
          </div>
          <img 
            :src="item.thumbUrl || item.imageUrl" 
            :alt="item.description || '美好瞬间'"
            loading="lazy"
            class="gallery-item__image"
            @error="handleImageError($event, item)"
            @load="onImageLoad"
            crossorigin="anonymous"
          />
          <button
            v-if="showUploadFab"
            class="gallery-item__pin"
            :class="{ 'gallery-item__pin--active': item.isPinned }"
            @click.stop="togglePin(item)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77 7.22 16.7l.91-5.32-3.86-3.76 5.34-.78L12 2z"
                :fill="item.isPinned ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.6"
              />
            </svg>
          </button>
          </div>
          <div class="gallery-item__footer">
            <div class="gallery-item__desc">{{ item.description || '美好瞬间' }}</div>
            <button
              v-if="showUploadFab"
              class="gallery-item__cover"
              @click.stop="setAsHomeCover(item)"
            >
              设为封面
            </button>
            <button
              v-if="showUploadFab"
              class="gallery-item__delete"
              @click.stop="handleDelete(item)"
            >
              删除
            </button>
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

      <!-- 加载更多 -->
      <div v-if="galleryList.length > 0 && hasMore" class="gallery-load-more">
        <button
          class="gallery-load-more__btn"
          @click="loadPhotos(false)"
          :disabled="loadingMore"
        >
          {{ loadingMore ? '加载中...' : '查看更多图片' }}
        </button>
      </div>

      <!-- 图片查看器 -->
      <ImageViewer
        :images="galleryList"
        :index="viewerIndex"
        :open="viewerOpen"
        @update:open="viewerOpen = $event"
        @update:index="viewerIndex = $event"
      />

      <!-- 上传按钮（隐藏彩蛋，需解锁后显示） -->
      <button 
        v-if="showUploadFab"
        class="upload-fab" 
        @click="showUpload = true"
      >
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

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getGalleryPage, likeGallery, pinGallery, setHomeCover, deleteGallery } from '../api/gallery'
import { showToast, showDialog } from 'vant'
import BabyButton from '../components/Button.vue'
import BabyModal from '../components/Modal.vue'
import ImageViewer from '../components/ImageViewer.vue'
import ImageUploader from '../components/ImageUploader.vue'
import { fadeInElements, initGoldParticles } from '../utils/animations'

const router = useRouter()
const galleryList = ref([])
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const showUpload = ref(false)
const showUploadFab = ref(false)
const currentPage = ref(1)
const pageSize = 9
const hasMore = ref(true)
const loadingMore = ref(false)

let titleClickCount = 0
let titleClickTimer = null
let adminLoginTriggered = false

// 演示数据
const demoData = [
    { id: 1, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', description: '第一次抬头', category: 'photo', likes: 128, isLiked: false },
    { id: 2, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', description: '百天快乐', category: 'photo', likes: 88, isLiked: false },
    { id: 3, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', description: '可爱的睡颜', category: 'photo', likes: 66, isLiked: false },
    { id: 4, imageUrl: 'https://fastly.jsdelivr.net/npm/@vant/assets/tree.jpeg', description: '公园晒太阳', category: 'photo', likes: 45, isLiked: false },
]

const applyPinSort = () => {
  if (!galleryList.value || galleryList.value.length === 0) return

  galleryList.value = galleryList.value
    .map(item => ({
      ...item,
      isPinned: item.sort && item.sort > 0
    }))
}

const togglePin = async (item) => {
  if (!item || !item.id) return
  const target = !item.isPinned
  try {
    await pinGallery(item.id, target)

    // 本地更新排序状态，避免每次都重新请求列表
    if (target) {
      // 置顶：本地找一个最大的 sort + 1
      const maxSort = galleryList.value.reduce(
        (max, cur) => Math.max(max, cur.sort || 0),
        0
      )
      item.sort = maxSort + 1
      item.isPinned = true
    } else {
      // 取消置顶
      item.sort = 0
      item.isPinned = false
    }

    applyPinSort()
    triggerGalleryAnimation()
    showToast(target ? '已置顶到相册前排' : '已取消置顶')
  } catch (e) {
    // 错误提示已在 request 拦截器中处理
  }
}

const setAsHomeCover = async (item) => {
  if (!item || !item.id) return
  try {
    await setHomeCover(item.id)
    showToast('已设置为首页宝宝照片')
  } catch (e) {
    // 错误提示已在 request 拦截器中处理
  }
}

// 加载照片数据（分页，支持追加）
const loadPhotos = async (reset = false) => {
  if (loadingMore.value) return
  if (!hasMore.value && !reset) return

  if (reset) {
    currentPage.value = 1
    hasMore.value = true
    galleryList.value = []
  }

  loadingMore.value = true
  try {
    const res = await getGalleryPage(currentPage.value, pageSize)
    const records = res?.data?.records || []

    if (currentPage.value === 1) {
      galleryList.value = records
    } else {
      galleryList.value = galleryList.value.concat(records)
    }

    applyPinSort()
    // 新数据插入后触发淡入动画，让“查看更多”加载的图片可见
    triggerGalleryAnimation()

    const totalPages = res?.data?.pages || 1
    if (currentPage.value >= totalPages || records.length < pageSize) {
      hasMore.value = false
    } else {
      currentPage.value += 1
    }
  } catch (e) {
    console.warn('API error, falling back to demo data:', e)
    if (galleryList.value.length === 0) {
      galleryList.value = demoData
      hasMore.value = false
      triggerGalleryAnimation()
    }
  } finally {
    loadingMore.value = false
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
    // request.js 的响应拦截器已经处理了响应，返回的是 data 字段
    // 所以 res 直接就是点赞数（整数），不需要再检查 code
    const likes = await likeGallery(item.id)
    if (likes !== undefined && likes !== null) {
      item.isLiked = true
      item.likes = likes
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
    showToast('点赞成功')
  }
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

    await loadPhotos(true)
    triggerGalleryAnimation()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (failedList.length > 0) {
    showToast('上传失败，可在弹窗中重新上传失败的文件')
  }
}

const handleUploadError = (error) => {
  showToast(error || '上传失败')
}

const handleDelete = (item) => {
  if (!item || !item.id) return

  showDialog({
    title: '确认删除？',
    message: '删除后将无法恢复，请确认已备份重要照片',
    showCancelButton: true
  })
    .then(async () => {
      try {
        const res = await deleteGallery(item.id)
        if (res) {
          galleryList.value = galleryList.value.filter(i => i.id !== item.id)
          showToast('已删除')
        } else {
          showToast('删除失败，请稍后重试')
        }
      } catch (e) {
        // 错误提示已在 request 拦截器中处理
      }
    })
    .catch(() => {})
}

// 处理图片加载错误，使用后端代理作为备用方案
const handleImageError = (event, item) => {
  const img = event.target
  const originalSrc = img.src
  
  // 如果已经切换到备用方案，不再重试
  if (originalSrc.includes('/api/gallery/proxy')) {
    console.error('Image load failed even with proxy:', originalSrc)
    // 使用占位样式代替浏览器默认的问号图标
    if (item) {
      item._fallback = true
    }
    img.style.display = 'none'
    return
  }
  
  // 尝试从原始URL中提取相对路径
  // 例如：https://1101020.xyz/uploads/images/xxx.jpg -> images/xxx.jpg
  let relativePath = ''
  try {
    const url = new URL(originalSrc)
    const pathname = url.pathname
    
    // 提取 /uploads/ 之后的部分
    const uploadsIndex = pathname.indexOf('/uploads/')
    if (uploadsIndex !== -1) {
      relativePath = pathname.substring(uploadsIndex + '/uploads/'.length)
    } else {
      // 如果没有 /uploads/，尝试直接提取文件名
      const parts = pathname.split('/')
      relativePath = parts[parts.length - 1]
    }
    
    if (relativePath) {
      // 切换到后端代理接口
      const proxyUrl = `/api/gallery/proxy?path=${encodeURIComponent(relativePath)}`
      console.log('Switching to proxy for image:', relativePath)
      img.src = proxyUrl
      // 移除错误监听，避免循环
      img.onerror = null
    } else {
      console.error('Could not extract relative path from:', originalSrc)
    }
  } catch (e) {
    console.error('Error parsing image URL:', e)
  }
}

let cleanupParticles = null

// 触发相册淡入动画
const triggerGalleryAnimation = () => {
  nextTick(() => {
    setTimeout(() => {
      fadeInElements('.gallery-item', 50)
    }, 100)
  })
}

// 滚动到底部自动加载更多
const handleScroll = () => {
  if (!hasMore.value || loadingMore.value) return

  const scrollBottom = window.innerHeight + window.scrollY
  const docHeight = document.documentElement.scrollHeight

  const distance = docHeight - scrollBottom

  // 距离底部小于一定阈值，或内容本身不足一屏时，加载更多
  if (distance < 400 || docHeight <= window.innerHeight + 10) {
    loadPhotos(false)
  }
}

// 监听标签切换，当切换回相册时重新触发动画

onMounted(async () => {
  await loadPhotos()
  // 添加淡入动画
  triggerGalleryAnimation()
  
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
  window.addEventListener('scroll', handleScroll)

  // 标题点击彩蛋逻辑
  const titleEl = document.querySelector('.gallery-wall-title')
  if (titleEl) {
    titleEl.addEventListener('click', () => {
      titleClickCount++
      if (titleClickTimer) clearTimeout(titleClickTimer)
      titleClickTimer = setTimeout(() => { titleClickCount = 0 }, 800)

      // 第一阶段：解锁上传入口
      if (titleClickCount >= 5 && !showUploadFab.value) {
        showUploadFab.value = true
        showToast('已解锁相册上传入口')
        titleClickCount = 0
      }
      // 第二阶段：解锁后再次快速点击5次触发管理员登录
      else if (titleClickCount >= 5 && showUploadFab.value && !adminLoginTriggered) {
        adminLoginTriggered = true
        showToast('🎉 发现彩蛋！')
        // 跳转到管理员登录页面
        setTimeout(() => {
          router.push('/admin/login')
        }, 1000)
        titleClickCount = 0
      }
    })
  }
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
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
.gallery-wall-page {
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

.gallery-wall-header {
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

.gallery-wall-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-family);
}

.tab-container {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  background: var(--card-bg);
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.tab-button--active {
  background: var(--accent);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.gallery-content {
  position: relative;
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

.gallery-item__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-secondary);
  background: linear-gradient(135deg, #f5f0e5, #fbe7e7);
}

.gallery-item__pin {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 0;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.gallery-item__pin--active {
  background: var(--accent-solid);
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

.gallery-item__cover {
  border: 0;
  background: transparent;
  color: var(--accent-solid);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  -webkit-tap-highlight-color: transparent;
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

.gallery-load-more {
  display: flex;
  justify-content: center;
  margin: var(--spacing-lg) 0 var(--spacing-xl);
}

.gallery-load-more__btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: rgba(212, 175, 55, 0.06);
  color: var(--text-primary);
  font-size: var(--font-size-small);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.gallery-load-more__btn:disabled {
  opacity: 0.6;
  cursor: default;
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

.message-content {
  min-height: 60vh;
}
</style>

