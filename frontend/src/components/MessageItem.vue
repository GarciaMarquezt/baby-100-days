<template>
  <div class="message-item">
    <div class="message-item__header">
      <div class="message-item__avatar">
        {{ getInitial(msg.guestName || msg.name) }}
      </div>
      <div class="message-item__info">
        <div class="message-item__name">{{ msg.guestName || msg.name || '匿名' }}</div>
        <div class="message-item__time">{{ formatTime(msg.createTime || msg.time) }}</div>
      </div>
    </div>
    
    <div class="message-item__content">
      {{ msg.content || msg.text }}
    </div>
    
    <div class="message-item__actions">
      <button 
        class="message-item__like" 
        :class="{ 'message-item__like--active': msg.isLiked }"
        @click="handleLike"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path 
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            :fill="msg.isLiked ? 'currentColor' : 'none'"
            :stroke="msg.isLiked ? 'currentColor' : 'currentColor'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ msg.likes || 0 }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { getInitial, formatRelativeTime } from '../utils/helpers'

const props = defineProps({
  msg: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like'])

const formatTime = (time) => {
  if (!time) return '刚刚'
  return formatRelativeTime(time)
}

const handleLike = () => {
  emit('like', props.msg.id)
}
</script>

<style scoped>
.message-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.message-item:hover {
  box-shadow: var(--shadow-md);
}

.message-item__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.message-item__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: var(--accent);
  border: 2px solid var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: var(--font-weight-bold);
  font-size: 16px;
  flex-shrink: 0;
  font-family: var(--font-family);
  box-shadow: var(--shadow-gold);
}

.message-item__info {
  flex: 1;
  min-width: 0;
}

.message-item__name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-body);
  color: var(--accent-solid);
  margin-bottom: 2px;
  font-family: var(--font-family);
}

.message-item__time {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.message-item__content {
  font-size: var(--font-size-body);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
  word-break: break-word;
  font-family: var(--font-family-body);
}

.message-item__actions {
  display: flex;
  justify-content: flex-end;
}

.message-item__like {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.message-item__like:hover {
  background: var(--muted);
}

.message-item__like--active {
  color: var(--gold-dark);
}

.message-item__like svg {
  flex-shrink: 0;
}
</style>

