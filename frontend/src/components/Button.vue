<template>
  <button
    :class="['baby-button', `baby-button--${type}`, { 'baby-button--loading': loading, 'baby-button--disabled': disabled }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="baby-button__loading">
      <svg class="baby-button__spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<style scoped>
.baby-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  border: 0;
  min-height: var(--touch-target);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.baby-button:active {
  transform: scale(0.98);
}

.baby-button--primary {
  background-image: var(--accent);
  color: #FFFFFF;
  border: 2px solid var(--gold);
  box-shadow: var(--shadow-accent);
  position: relative;
  overflow: hidden;
}

.baby-button--primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.2) 50%, transparent 100%);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.baby-button--primary:hover:not(:disabled)::before {
  opacity: 1;
}

.baby-button--primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(199, 62, 29, 0.3), 0 0 12px rgba(212, 175, 55, 0.4);
  border-color: var(--gold-light);
}

.baby-button--secondary {
  background: var(--muted);
  color: var(--text-primary);
}

.baby-button--secondary:hover:not(:disabled) {
  background: var(--muted-dark);
}

.baby-button--ghost {
  background: transparent;
  border: 2px solid var(--gold);
  color: var(--text-primary);
}

.baby-button--ghost:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-dark);
  box-shadow: var(--shadow-gold);
}

.baby-button--danger {
  background: #FF4757;
  color: #FFFFFF;
}

.baby-button--danger:hover:not(:disabled) {
  background: #FF3838;
}

.baby-button--disabled,
.baby-button--disabled:active {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.baby-button--loading {
  pointer-events: none;
}

.baby-button__loading {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}

.baby-button__spinner {
  width: 16px;
  height: 16px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

