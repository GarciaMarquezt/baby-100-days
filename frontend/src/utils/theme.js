/**
 * 主题切换工具
 */
export const ThemeManager = {
  // 获取当前主题
  getTheme() {
    return localStorage.getItem('baby_theme') || 'light'
  },

  // 设置主题
  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('baby_theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('baby_theme', 'light')
    }
  },

  // 切换主题
  toggleTheme() {
    const current = this.getTheme()
    this.setTheme(current === 'light' ? 'dark' : 'light')
    return this.getTheme()
  },

  // 初始化主题
  init() {
    const saved = this.getTheme()
    this.setTheme(saved)
  }
}

