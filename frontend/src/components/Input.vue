<template>
  <div class="baby-input-wrapper">
    <label v-if="label" :for="inputId" class="baby-input__label">
      {{ label }}
      <span v-if="required" class="baby-input__required">*</span>
    </label>
    <div class="baby-input__container">
      <textarea
        v-if="type === 'textarea'"
        :id="inputId"
        :class="['baby-input', 'baby-input--textarea', { 'baby-input--error': error }]"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :maxlength="maxlength"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      <input
        v-else
        :id="inputId"
        :class="['baby-input', { 'baby-input--error': error }]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div v-if="maxlength && showWordLimit" class="baby-input__limit">
        {{ modelValue?.length || 0 }}/{{ maxlength }}
      </div>
    </div>
    <div v-if="error" class="baby-input__error">{{ error }}</div>
    <div v-if="hint && !error" class="baby-input__hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: null
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleFocus = (e) => {
  emit('focus', e)
}

const handleBlur = (e) => {
  emit('blur', e)
}
</script>

<style scoped>
.baby-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.baby-input__label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
}

.baby-input__required {
  color: var(--accent-solid);
  margin-left: 2px;
}

.baby-input__container {
  position: relative;
}

.baby-input {
  width: 100%;
  height: var(--touch-target);
  border: 2px solid var(--gold-light);
  border-radius: var(--radius-sm);
  padding: 0 var(--spacing-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: var(--font-size-body);
  font-family: var(--font-family-body);
  transition: all var(--transition-base);
  -webkit-appearance: none;
}

.baby-input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1), var(--shadow-gold);
}

.baby-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--muted);
}

.baby-input--error {
  border-color: #FF4757;
}

.baby-input--error:focus {
  border-color: #FF4757;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.15);
}

.baby-input--textarea {
  height: auto;
  min-height: 80px;
  padding: var(--spacing-md);
  resize: vertical;
  line-height: 1.5;
}

.baby-input__limit {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.baby-input__error {
  font-size: var(--font-size-small);
  color: #FF4757;
}

.baby-input__hint {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}
</style>

