<template>
  <div class="simple-viewer" @click.self="close">
    <img :src="images[index].url" alt="" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.simple-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.simple-viewer img {
  max-width: 95%;
  max-height: 85%;
}
</style>

