import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

/**
 * 格式化日期
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  const now = dayjs()
  const target = dayjs(date)
  const diff = now.diff(target, 'minute')
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 10080) return `${Math.floor(diff / 1440)}天前`
  return formatDate(date, 'MM-DD HH:mm')
}

/**
 * 获取姓名首字母
 */
export function getInitial(name) {
  if (!name) return 'A'
  return name.charAt(0).toUpperCase()
}

/**
 * 防抖函数
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 生成随机 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 图片预加载
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (err) {
    return false
  }
}

