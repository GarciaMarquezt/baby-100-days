<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="baby-modal-backdrop" @click.self="handleClose">
        <div :class="['baby-modal', { 'baby-modal--large': large }]">
          <div v-if="title || $slots.header" class="baby-modal__header">
            <slot name="header">
              <h3 class="baby-modal__title">{{ title }}</h3>
            </slot>
            <button v-if="closable" class="baby-modal__close" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="baby-modal__body">
            <slot></slot>
          </div>
          <div v-if="$slots.actions" class="baby-modal__actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  large: {
    type: Boolean,
    default: false
  },
  closeOnClickBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'close'])

const handleClose = () => {
  if (props.closable) {
    emit('update:show', false)
    emit('close')
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.baby-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  backdrop-filter: blur(4px);
}

.baby-modal {
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

.baby-modal--large {
  max-width: 420px;
}

.baby-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 2px solid var(--divider-color);
  position: relative;
}

.baby-modal__header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}

.baby-modal__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--accent-solid);
  margin: 0;
  font-family: var(--font-family);
}

.baby-modal__close {
  width: 32px;
  height: 32px;
  border: 1px solid var(--gold-light);
  background: transparent;
  color: var(--gold-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.baby-modal__close:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold);
  color: var(--gold-dark);
}

.baby-modal__body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.baby-modal__actions {
  padding: var(--spacing-lg);
  border-top: 2px solid var(--divider-color);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  position: relative;
}

.baby-modal__actions::before {
  content: '';
  position: absolute;
  top: -2px;
  right: 0;
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}

.modal-enter-active .baby-modal,
.modal-leave-active .baby-modal {
  transition: transform var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .baby-modal,
.modal-leave-to .baby-modal {
  transform: translateY(20px) scale(0.95);
}

@keyframes modalSlideUp {
  from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>

