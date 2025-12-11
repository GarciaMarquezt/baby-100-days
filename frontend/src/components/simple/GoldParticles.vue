<template>
  <canvas ref="canvasRef" class="simple-particle-canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
let raf = null
let ctx = null
let w = 0
let h = 0
const particles = []

function rand(min, max) {
  return Math.random() * (max - min) + min
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')

  function resize() {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  }

  resize()
  window.addEventListener('resize', resize)

  // create particles
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(1, 4),
      alpha: rand(0.2, 0.9),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.3, 0.3)
    })
  }

  function loop() {
    ctx.clearRect(0, 0, w, h)
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0

      ctx.beginPath()
      ctx.fillStyle = `rgba(233, 198, 138, ${p.alpha})` // gold tone
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    })
    raf = requestAnimationFrame(loop)
  }

  loop()

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  })
})
</script>

<style scoped>
.simple-particle-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}
</style>

