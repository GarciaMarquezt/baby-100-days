<template>
  <div class="baby-stepper">
    <button
      :class="['baby-stepper__button', { 'baby-stepper__button--disabled': value <= min }]"
      :disabled="value <= min || disabled"
      @click="decrement"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="baby-stepper__value">{{ value }}</div>
    <button
      :class="['baby-stepper__button', { 'baby-stepper__button--disabled': value >= max }]"
      :disabled="value >= max || disabled"
      @click="increment"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 99
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const increment = () => {
  if (value.value < props.max) {
    value.value = Math.min(value.value + props.step, props.max)
  }
}

const decrement = () => {
  if (value.value > props.min) {
    value.value = Math.max(value.value - props.step, props.min)
  }
}
</script>

<style scoped>
.baby-stepper {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--muted);
  border: 1px solid var(--gold-light);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.baby-stepper__button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold);
  background: var(--card-bg);
  color: var(--gold-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.baby-stepper__button:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold-dark);
  box-shadow: var(--shadow-gold);
}

.baby-stepper__button:active:not(:disabled) {
  transform: scale(0.95);
}

.baby-stepper__button--disabled,
.baby-stepper__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.baby-stepper__value {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}
</style>

