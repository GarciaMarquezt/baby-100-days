import { reactive, readonly } from 'vue'
import { getConfig } from '../api/config'

const state = reactive({
  loaded: false,
  loading: false,
  data: {}
})

async function loadConfig(force = false) {
  if (state.loaded && !force) return
  if (state.loading) return
  state.loading = true
  try {
    const res = await getConfig()
    // getConfig 返回完整的响应对象 {code, msg, data}，需要提取 data 字段
    state.data = res?.data || {}
    state.loaded = true
  } catch (e) {
    // 失败时保持默认值，页面使用兜底文案
    console.warn('loadConfig failed', e)
  } finally {
    state.loading = false
  }
}

function getValue(key, defaultValue = '') {
  if (!key) return defaultValue
  const v = state.data[key]
  return (v === undefined || v === null || v === '') ? defaultValue : v
}

export function useConfig() {
  return {
    state: readonly(state),
    loadConfig,
    getValue
  }
}


