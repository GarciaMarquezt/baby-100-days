<template>
  <div class="message-page">
    <!-- 顶部导航：独立页面显示返回按钮 -->
    <div v-if="!hideNav" class="message-header">
      <button class="message-header__back" @click="goBack">
        <van-icon name="arrow-left" />
      </button>
      <div class="message-header__title" @click="handleTitleClick">祝福留言</div>
      <button
        class="message-header__write message-header__write--enter"
        @click="showWrite = true"
      >
        写祝福
      </button>
    </div>

    <!-- 嵌入模式下的简化标题 -->
    <div v-else class="message-header message-header--simple">
      <div class="message-header__title" @click="handleTitleClick">祝福留言</div>
      <button
        class="message-header__write message-header__write--enter"
        @click="showWrite = true"
      >
        写祝福
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="message-stats" v-if="total > 0">
      已收到 <span class="message-stats__count">{{ total }}</span> 条暖心祝福
    </div>

    <!-- 留言列表 -->
    <div class="message-list">
      <div
        v-for="(item, index) in messages"
        :key="item.id"
        class="message-card message-card--enter"
        :style="{ animationDelay: (index * 0.06) + 's' }"
      >
        <div class="message-card__content">
          {{ item.content }}
        </div>
        <div class="message-card__footer">
          <span class="message-card__author">—— {{ item.guestName || '匿名' }}</span>
          <span class="message-card__time">{{ formatTime(item.createTime) }}</span>
        </div>
      </div>

      <div v-if="!loading && messages.length === 0" class="message-empty">
        暂时还没有留言，欢迎您留下第一句祝福～
      </div>

      <div v-if="hasMore" class="message-load-more">
        <button
          class="message-load-more__btn"
          :disabled="loading"
          @click="loadMore"
        >
          {{ loading ? '加载中...' : '查看更多祝福' }}
        </button>
      </div>
    </div>

    <!-- 写祝福弹窗 -->
    <van-popup
      v-model:show="showWrite"
      position="bottom"
      round
      :style="{ height: '50%' }"
      :close-on-click-overlay="true"
    >
      <div class="write-panel">
        <h3 class="write-panel__title">送上您的祝福</h3>
        <van-field
          v-model="form.content"
          type="textarea"
          rows="4"
          maxlength="200"
          show-word-limit
          placeholder="写下对宝宝的美好祝愿..."
        />
        <van-field
          v-model="form.guestName"
          placeholder="您的姓名（可选，留空则为匿名）"
        />
        <div class="write-panel__submit-wrap">
          <BabyButton
            type="primary"
            class="write-panel__submit"
            :loading="submitting"
            @click="handleSubmit"
          >
            贴上留言列
          </BabyButton>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { sendMessage, getMessageList } from '../api/message'
import { showToast } from 'vant'
import BabyButton from '../components/Button.vue'

const props = defineProps({
  hideNav: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const showWrite = ref(false)
const submitting = ref(false)
const form = ref({
  content: '',
  guestName: ''
})

const messages = ref([])
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loading = ref(false)
const total = ref(0)

// 隐藏入口：点击标题 5 次进入后台登录
let titleClickCount = 0
let titleClickTimer = null

const handleTitleClick = () => {
  titleClickCount++
  if (titleClickTimer) clearTimeout(titleClickTimer)
  titleClickTimer = setTimeout(() => {
    titleClickCount = 0
  }, 8000)

  if (titleClickCount >= 5) {
    titleClickCount = 0
    showToast('已进入管理登录页')
    router.push('/admin/login')
  }
}

const goBack = () => {
  router.back()
}

const formatTime = (t) => {
  if (!t) return ''
  return dayjs(t).format('MM-DD HH:mm')
}

const loadMessages = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await getMessageList({ page: page.value, size: pageSize })
    const records = res?.records || []

    if (page.value === 1) {
      messages.value = records
    } else {
      messages.value = messages.value.concat(records)
    }

    total.value = res?.total ?? messages.value.length

    const totalPages = res?.pages || 1
    if (page.value >= totalPages || records.length < pageSize) {
      hasMore.value = false
    } else {
      page.value += 1
    }
  } catch (e) {
    console.warn('Load messages failed:', e)
    if (messages.value.length === 0) {
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadMessages()
}

onMounted(() => {
  loadMessages()
})

const handleSubmit = async () => {
  const content = form.value.content.trim()
  const guestName = form.value.guestName.trim()

  if (!content) {
    return showToast('写点什么再发送～')
  }
  if (content.length < 2) {
    return showToast('祝福再多写几个字吧～')
  }

  if (submitting.value) return
  submitting.value = true

  try {
    const ok = await sendMessage({
      guestName: guestName || '匿名',
      content
    })

    if (ok) {
      showToast('祝福已送达，感谢您的祝福～')
      showWrite.value = false
      form.value.content = ''
      form.value.guestName = ''

      // 重新加载第一页
      page.value = 1
      hasMore.value = true
      messages.value = []
      await loadMessages()
    } else {
      showToast('发送失败，请稍后重试')
    }
  } catch (e) {
    console.error('sendMessage error', e)
    showToast('发送失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background: var(--bg);
  padding: calc(var(--safe-area-top) + 12px) var(--spacing-md) var(--safe-area-bottom);
  box-sizing: border-box;
  font-family: var(--font-family);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.message-header--simple {
  justify-content: space-between;
}

.message-header__back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.message-header__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.message-header__write {
  border-radius: 999px;
  padding: 6px 14px;
  border: 1px solid var(--accent-solid);
  background: transparent;
  color: var(--accent-solid);
  font-size: var(--font-size-small);
}

.message-header__write--enter {
  animation: message-btn-fade-up 0.4s ease-out both;
  animation-delay: 0.15s;
}

.message-stats {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.message-stats__count {
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.message-card {
  background: linear-gradient(135deg, #fff8f0, #ffe9e3);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.message-card--enter {
  animation: message-card-fade-up 0.45s ease-out both;
}

@keyframes message-btn-fade-up {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.85);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes message-card-fade-up {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-card__content {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
}

.message-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.message-card__author {
  font-style: italic;
}

.message-card__time {
  opacity: 0.75;
}

.message-empty {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-secondary);
}

.message-load-more {
  display: flex;
  justify-content: center;
  margin: var(--spacing-lg) 0;
}

.message-load-more__btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: rgba(212, 175, 55, 0.06);
  color: var(--text-primary);
  font-size: var(--font-size-small);
}

.message-load-more__btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.write-panel {
  padding: 24px 20px 16px;
}

.write-panel__title {
  text-align: center;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-h4);
  color: var(--text-primary);
}

.write-panel :deep(.van-field) {
  margin-bottom: 8px;
}

.write-panel__submit {
  margin-top: 8px;
  width: 100%;
}

.write-panel__submit-wrap {
  margin-top: 16px;
}
</style>


