<template>
  <Transition name="viewer">
    <div v-if="open" class="image-viewer" @click.self="close">
      <div class="image-viewer__container">
        <button class="image-viewer__close" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="image-viewer__nav image-viewer__nav--prev" @click="prev" v-if="images.length > 1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <div class="image-viewer__nav image-viewer__nav--next" @click="next" v-if="images.length > 1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <img 
          :src="imageSrc" 
          :alt="currentImage?.description || ''"
          class="image-viewer__image"
          @load="onImageLoad"
          @error="handleImageError"
        />
        
        <div class="image-viewer__info" v-if="currentImage">
          <div class="image-viewer__title">{{ currentImage.description || '美好瞬间' }}</div>
          <div class="image-viewer__counter" v-if="images.length > 1">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  index: {
    type: Number,
    default: 0
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'update:index', 'close'])

const currentIndex = computed({
  get: () => props.index,
  set: (val) => emit('update:index', val)
})

const currentImage = computed(() => {
  return props.images[currentIndex.value] || null
})

// 当前图片的URL（支持备用方案）
const imageSrc = ref('')

// 从URL中提取相对路径并转换为代理URL
const getProxyUrl = (originalUrl) => {
  try {
    const url = new URL(originalUrl)
    const pathname = url.pathname
    
    // 提取 /uploads/ 之后的部分
    const uploadsIndex = pathname.indexOf('/uploads/')
    if (uploadsIndex !== -1) {
      const relativePath = pathname.substring(uploadsIndex + '/uploads/'.length)
      return `/api/gallery/proxy?path=${encodeURIComponent(relativePath)}`
    }
  } catch (e) {
    console.error('Error parsing URL:', e)
  }
  return null
}

// 更新图片源
const updateImageSrc = () => {
  if (currentImage.value) {
    const originalUrl = currentImage.value.imageUrl || currentImage.value.url
    imageSrc.value = originalUrl
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  const img = event.target
  const originalSrc = img.src
  
  // 如果已经切换到备用方案，不再重试
  if (originalSrc.includes('/api/gallery/proxy')) {
    console.error('Image load failed even with proxy:', originalSrc)
    return
  }
  
  // 尝试使用备用方案
  const proxyUrl = getProxyUrl(originalSrc)
  if (proxyUrl) {
    console.log('Switching to proxy for image viewer:', proxyUrl)
    imageSrc.value = proxyUrl
    // 移除错误监听，避免循环
    img.onerror = null
  }
}

// 监听当前图片变化
watch(() => currentImage.value, () => {
  updateImageSrc()
}, { immediate: true })

const close = () => {
  emit('update:open', false)
  emit('close')
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.images.length - 1
  }
}

const onImageLoad = () => {
  // 图片加载完成
}

// 键盘事件
const handleKeydown = (e) => {
  if (!props.open) return
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'ArrowRight') {
    next()
  }
}

// 触摸滑动
let touchStartX = 0
let touchEndX = 0

const handleTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX
}

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.open, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.image-viewer__container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 0;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: background var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.image-viewer__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-viewer__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 0;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: background var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.image-viewer__nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-viewer__nav--prev {
  left: 20px;
}

.image-viewer__nav--next {
  right: 20px;
}

.image-viewer__image {
  max-width: 95%;
  max-height: 85%;
  object-fit: contain;
  border-radius: var(--radius-md);
  user-select: none;
  -webkit-user-drag: none;
}

.image-viewer__info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #fff;
  z-index: 1001;
}

.image-viewer__title {
  font-size: var(--font-size-body);
  margin-bottom: var(--spacing-xs);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.image-viewer__counter {
  font-size: var(--font-size-small);
  opacity: 0.8;
}

/* Transitions */
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity var(--transition-base);
}

.viewer-enter-active .image-viewer__container,
.viewer-leave-active .image-viewer__container {
  transition: transform var(--transition-base);
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}

.viewer-enter-from .image-viewer__container,
.viewer-leave-to .image-viewer__container {
  transform: scale(0.9);
}
</style>

