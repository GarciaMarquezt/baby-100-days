<template>
  <div :class="['baby-card', { 'baby-card--no-padding': noPadding }]">
    <div v-if="$slots.header" class="baby-card__header">
      <slot name="header"></slot>
    </div>
    <div class="baby-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.actions" class="baby-card__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  noPadding: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.baby-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.baby-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.baby-card--no-padding {
  padding: 0;
}

.baby-card__header {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--divider-color);
  position: relative;
}

.baby-card__header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}

.baby-card__body {
  /* Body content */
}

.baby-card__actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--divider-color);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  position: relative;
}

.baby-card__actions::before {
  content: '';
  position: absolute;
  top: -2px;
  right: 0;
  width: 60px;
  height: 2px;
  background: var(--gold);
  border-radius: 2px;
}
</style>

