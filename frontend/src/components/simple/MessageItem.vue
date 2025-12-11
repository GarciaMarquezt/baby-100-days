<template>
  <div class="simple-message-card">
    <div style="display: flex; align-items: center; gap: 8px">
      <div
        style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        "
      >
        {{ initial }}
      </div>
      <div>
        <div style="font-weight: 700">{{ msg.name }}</div>
        <div class="simple-small">{{ msg.time }}</div>
      </div>
    </div>
    <div style="margin-top: 8px">{{ msg.text }}</div>
    <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center">
      <button class="simple-btn simple-btn-ghost" @click="$emit('like', msg.id)">❤ {{ msg.likes }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  msg: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like'])

const initial = computed(() => (props.msg && props.msg.name ? props.msg.name[0] : '匿'))
</script>

<style scoped>
.simple-message-card {
  border-radius: 14px;
  padding: 12px;
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  margin-bottom: 8px;
}

.simple-small {
  font-size: 13px;
  color: var(--text-secondary);
}

.simple-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  padding: 0 16px;
  height: 44px;
  border: 1px solid var(--gold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.simple-btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>

