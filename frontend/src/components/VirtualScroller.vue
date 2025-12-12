<template>
  <div class="virtual-scroller" ref="scrollerRef">
    <!-- 虚拟滚动容器 -->
    <div
      class="virtual-container"
      :style="containerStyle"
      @scroll.passive="handleScroll"
    >
      <!-- 渲染的元素 -->
      <div
        class="virtual-item"
        v-for="item in visibleItems"
        :key="item.id"
        :style="getItemStyle(item)"
      >
        <slot :item="item" :index="item.index"></slot>
      </div>
    </div>

    <!-- 滚动条指示器 -->
    <div
      v-if="showScrollbar"
      class="scroll-indicator"
      :style="scrollbarStyle"
    >
      <div class="scroll-thumb"></div>
    </div>

    <!-- 加载更多指示器 -->
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 120
  },
  containerHeight: {
    type: Number,
    default: 600
  },
  bufferSize: {
    type: Number,
    default: 5
  },
  showScrollbar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['scroll', 'load-more'])

// 响应式数据
const scrollerRef = ref(null)
const scrollTop = ref(0)
const loading = ref(false)

// 计算属性
const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize
  const end = Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.bufferSize

  return {
    start: Math.max(0, start),
    end: Math.min(props.items.length, end)
  }
})

const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return props.items.slice(start, end).map((item, index) => ({
    ...item,
    index: start + index,
    offsetTop: (start + index) * props.itemHeight
  }))
})

const containerStyle = computed(() => ({
  height: `${props.containerHeight}px`,
  overflow: 'auto'
}))

const scrollbarStyle = computed(() => ({
  height: `${(props.containerHeight / totalHeight.value) * props.containerHeight}px`,
  top: `${(scrollTop.value / totalHeight.value) * props.containerHeight}px`
}))

// 方法
const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
  emit('scroll', scrollTop.value)

  // 检查是否需要加载更多
  const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = e.target
  if (scrollHeight - currentScrollTop - clientHeight < 200 && !loading.value) {
    loading.value = true
    emit('load-more', () => {
      loading.value = false
    })
  }
}

const getItemStyle = (item) => ({
  position: 'absolute',
  top: `${item.offsetTop}px`,
  width: '100%',
  height: `${props.itemHeight}px`
})

const scrollToIndex = (index, smooth = true) => {
  const targetScrollTop = index * props.itemHeight
  if (scrollerRef.value) {
    const container = scrollerRef.value.querySelector('.virtual-container')
    if (container) {
      container.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }
}

const scrollToTop = (smooth = true) => {
  scrollToIndex(0, smooth)
}

const scrollToBottom = (smooth = true) => {
  const lastIndex = props.items.length - 1
  scrollToIndex(lastIndex, smooth)
}

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getScrollTop: () => scrollTop.value
})

// 生命周期
onMounted(() => {
  // 监听容器大小变化
  const resizeObserver = new ResizeObserver(() => {
    // 可以在这里添加响应式调整逻辑
  })

  if (scrollerRef.value) {
    resizeObserver.observe(scrollerRef.value)
  }

  onUnmounted(() => {
    resizeObserver.disconnect()
  })
})
</script>

<style scoped>
.virtual-scroller {
  position: relative;
  width: 100%;
}

.virtual-container {
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: var(--gold) transparent;
}

.virtual-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-container::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-container::-webkit-scrollbar-thumb {
  background: var(--gold);
  border-radius: 3px;
}

.virtual-container::-webkit-scrollbar-thumb:hover {
  background: var(--gold-dark);
}

.virtual-item {
  will-change: transform;
  contain: layout style paint;
}

.scroll-indicator {
  position: absolute;
  right: 2px;
  top: 0;
  width: 4px;
  background: rgba(212, 175, 55, 0.3);
  border-radius: 2px;
  transition: all 0.1s ease;
}

.scroll-thumb {
  width: 100%;
  height: 100%;
  background: var(--gold);
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.loading-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  z-index: 10;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--gold-light);
  border-top: 2px solid var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 性能优化 */
.virtual-scroller {
  contain: layout style;
}

.virtual-item {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}
</style>
