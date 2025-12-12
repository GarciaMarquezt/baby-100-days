/**
 * 动画工具函数
 */

// 导入 GSAP
import { gsap } from 'gsap'

// Framer Motion Vue 动画配置
export const motionConfig = {
  // 页面进入动画
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  // 卡片悬停动画
  cardHover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // 列表项依次出现
  staggerItem: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
}

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

/**
 * GSAP 动画工具函数
 */

// 页面进入动画
export function pageEnterAnimation(element, duration = 0.8) {
  if (!element) return

  gsap.set(element, { opacity: 0, y: 30 })
  gsap.to(element, {
    opacity: 1,
    y: 0,
    duration,
    ease: "power2.out"
  })
}

// 卡片悬停动画
export function cardHoverAnimation(element, isHover) {
  if (!element) return

  gsap.to(element, {
    scale: isHover ? 1.02 : 1,
    y: isHover ? -4 : 0,
    duration: 0.3,
    ease: "power2.out"
  })
}

// 列表项依次出现动画
export function staggerAnimation(container, itemSelector = '.gallery-item', delay = 0.1) {
  if (!container) return

  const items = container.querySelectorAll(itemSelector)
  if (items.length === 0) return

  gsap.set(items, { opacity: 0, y: 30, scale: 0.9 })

  gsap.to(items, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: "power2.out",
    stagger: delay,
    delay: 0.2
  })
}

// 心跳动画
export function heartbeatAnimation(element, scale = 1.1, duration = 0.8) {
  if (!element) return

  const tl = gsap.timeline({ repeat: -1 })
  tl.to(element, {
    scale,
    duration: duration * 0.3,
    ease: "power2.out"
  })
  .to(element, {
    scale: 1,
    duration: duration * 0.7,
    ease: "power2.out"
  })

  return tl // 返回timeline以便后续控制
}

// 闪烁动画
export function sparkleAnimation(element, intensity = 0.3, duration = 2) {
  if (!element) return

  const tl = gsap.timeline({ repeat: -1 })
  tl.to(element, {
    opacity: 1 - intensity,
    duration: duration * 0.5,
    ease: "power2.inOut"
  })
  .to(element, {
    opacity: 1,
    duration: duration * 0.5,
    ease: "power2.inOut"
  })

  return tl
}

// 旋转动画
export function rotateAnimation(element, degrees = 360, duration = 2) {
  if (!element) return

  gsap.to(element, {
    rotation: degrees,
    duration,
    ease: "none",
    repeat: -1
  })
}

// 弹跳动画
export function bounceInAnimation(element, delay = 0) {
  if (!element) return

  gsap.set(element, { scale: 0.3, opacity: 0 })
  gsap.to(element, {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    delay,
    ease: "back.out(1.7)"
  })
}

// 滑动进入动画
export function slideInAnimation(element, direction = 'up', distance = 50, duration = 0.5) {
  if (!element) return

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  }

  gsap.set(element, { ...directions[direction], opacity: 0 })
  gsap.to(element, {
    x: 0,
    y: 0,
    opacity: 1,
    duration,
    ease: "power2.out"
  })
}

// 放大镜效果
export function magnifyingGlassAnimation(element, scale = 1.2, duration = 0.3) {
  if (!element) return

  gsap.to(element, {
    scale,
    duration,
    ease: "power2.out",
    yoyo: true,
    repeat: 1
  })
}

// 波纹扩散动画
export function rippleAnimation(centerElement, color = 'rgba(212, 175, 55, 0.3)', duration = 0.8) {
  if (!centerElement) return

  const ripple = document.createElement('div')
  ripple.style.position = 'absolute'
  ripple.style.border = `2px solid ${color}`
  ripple.style.borderRadius = '50%'
  ripple.style.pointerEvents = 'none'
  ripple.style.zIndex = '1000'

  const rect = centerElement.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  ripple.style.width = size + 'px'
  ripple.style.height = size + 'px'
  ripple.style.left = (rect.left + rect.width / 2 - size / 2) + 'px'
  ripple.style.top = (rect.top + rect.height / 2 - size / 2) + 'px'

  document.body.appendChild(ripple)

  gsap.set(ripple, { scale: 0, opacity: 1 })
  gsap.to(ripple, {
    scale: 1,
    opacity: 0,
    duration,
    ease: "power2.out",
    onComplete: () => {
      document.body.removeChild(ripple)
    }
  })
}

// 滚动优化工具
export class ScrollOptimizer {
  constructor() {
    this.scrollY = 0
    this.isScrolling = false
    this.scrollTimeout = null
    this.callbacks = new Set()
  }

  // 添加滚动监听器
  addListener(callback) {
    this.callbacks.add(callback)
  }

  // 移除滚动监听器
  removeListener(callback) {
    this.callbacks.delete(callback)
  }

  // 初始化滚动优化
  init() {
    const handleScroll = () => {
      this.scrollY = window.scrollY || window.pageYOffset
      this.isScrolling = true

      // 清除之前的定时器
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
      }

      // 触发回调
      this.callbacks.forEach(callback => callback(this.scrollY, this.isScrolling))

      // 设置滚动结束检测
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false
        this.callbacks.forEach(callback => callback(this.scrollY, this.isScrolling))
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
      }
    }
  }

  // 获取当前滚动状态
  getScrollState() {
    return {
      scrollY: this.scrollY,
      isScrolling: this.isScrolling
    }
  }
}

// 全局滚动优化器实例
export const scrollOptimizer = new ScrollOptimizer()

// 触摸反馈动画
export function touchFeedbackAnimation(element, type = 'tap') {
  if (!element) return

  const animations = {
    tap: { scale: 0.95, duration: 0.1 },
    press: { scale: 0.98, duration: 0.15 },
    release: { scale: 1, duration: 0.2 }
  }

  const config = animations[type] || animations.tap

  gsap.to(element, {
    scale: config.scale,
    duration: config.duration,
    ease: "power2.out",
    yoyo: type === 'tap',
    repeat: type === 'tap' ? 1 : 0
  })
}

// 长按检测
export function createLongPressHandler(element, callback, duration = 500) {
  if (!element) return null

  let timeoutId = null
  let startTime = 0

  const start = (e) => {
    startTime = Date.now()
    timeoutId = setTimeout(() => {
      callback(e)
    }, duration)
  }

  const end = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const move = (e) => {
    // 如果移动距离太大，取消长按
    if (Math.abs(e.movementX) > 10 || Math.abs(e.movementY) > 10) {
      end()
    }
  }

  element.addEventListener('touchstart', start, { passive: true })
  element.addEventListener('touchend', end, { passive: true })
  element.addEventListener('touchmove', move, { passive: true })

  // 支持鼠标事件
  element.addEventListener('mousedown', start)
  element.addEventListener('mouseup', end)
  element.addEventListener('mousemove', move)

  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', start)
    element.removeEventListener('touchend', end)
    element.removeEventListener('touchmove', move)
    element.removeEventListener('mousedown', start)
    element.removeEventListener('mouseup', end)
    element.removeEventListener('mousemove', move)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

// 滚动到元素动画
export function scrollToElement(element, offset = 0, duration = 1) {
  if (!element) return

  const elementTop = element.getBoundingClientRect().top + window.pageYOffset
  const targetY = elementTop + offset

  gsap.to(window, {
    scrollTo: { y: targetY, autoKill: true },
    duration,
    ease: "power2.inOut"
  })
}

// 视差滚动效果
export function createParallaxEffect(element, speed = 0.5) {
  if (!element) return null

  const initialY = element.offsetTop
  let currentY = initialY

  const updatePosition = (scrollY) => {
    currentY = initialY - scrollY * speed
    gsap.set(element, { y: currentY - initialY })
  }

  scrollOptimizer.addListener(updatePosition)

  return () => {
    scrollOptimizer.removeListener(updatePosition)
  }
}

