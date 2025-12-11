/**
 * 动画工具函数
 */

/**
 * 金箔粒子动画（Canvas）
 */
export function initGoldParticles(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return null

  const ctx = canvas.getContext('2d')
  const {
    particleCount = 50,
    colors = ['#D4AF37', '#E8D5A3', '#B8941F'], // 雅金色系
    speed = { min: 0.3, max: 0.8 },
    size = { min: 1, max: 3 }
  } = options

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * (size.max - size.min) + size.min
      this.speedY = Math.random() * (speed.max - speed.min) + speed.min
      this.speedX = (Math.random() - 0.5) * 0.6
      this.opacity = Math.random() * 0.6 + 0.3
      this.rotation = Math.random() * Math.PI * 2
      this.rotationSpeed = (Math.random() - 0.5) * 0.05
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.isStar = Math.random() > 0.7
    }

    update() {
      this.y += this.speedY
      this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3
      this.rotation += this.rotationSpeed

      if (this.y > canvas.height) {
        this.y = -10
        this.x = Math.random() * canvas.width
      }
      if (this.x > canvas.width) this.x = 0
      if (this.x < 0) this.x = canvas.width
    }

    draw() {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.globalAlpha = this.opacity

      if (this.isStar) {
        // 绘制星星
        ctx.fillStyle = this.color
        ctx.strokeStyle = '#B8941F' // 深金色描边
        ctx.lineWidth = 0.5
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
          const x = Math.cos(angle) * this.size
          const y = Math.sin(angle) * this.size
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else {
        // 绘制圆形粒子
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(0, 0, this.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }
  }

  // 初始化粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  let animationId = null

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.update()
      p.draw()
    })
    animationId = requestAnimationFrame(animate)
  }

  animate()

  // 返回清理函数
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

/**
 * 信封打开动画
 */
export function createEnvelopeAnimation(element, onComplete) {
  if (!element) return

  element.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
  element.style.transform = 'scale(1.1) rotateY(180deg)'

  setTimeout(() => {
    element.style.opacity = '0'
    if (onComplete) onComplete()
  }, 800)
}

/**
 * 卡片翻转动画
 */
export function createCardFlip(element) {
  if (!element) return

  element.style.transition = 'transform 0.6s ease-in-out'
  element.style.transform = 'rotateY(180deg)'

  setTimeout(() => {
    element.style.transform = 'rotateY(0deg)'
  }, 600)
}

/**
 * 淡入动画（用于列表项）
 */
export function fadeInElements(selector, delay = 100) {
  const elements = document.querySelectorAll(selector)
  elements.forEach((el, index) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'

    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, index * delay)
  })
}

/**
 * 图片加载动画
 */
export function imageLoadAnimation(imgElement) {
  if (!imgElement) return

  imgElement.style.opacity = '0'
  imgElement.style.transform = 'scale(0.9)'
  imgElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease'

  imgElement.onload = () => {
    imgElement.style.opacity = '1'
    imgElement.style.transform = 'scale(1)'
  }
}

