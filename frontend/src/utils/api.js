import axios from 'axios'
import { showToast } from 'vant'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { data } = response
    // 如果后端返回的格式是 { code, data, message }
    if (data.code !== undefined) {
      if (data.code === 0) {
        return data.data || data
      } else {
        showToast(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    return data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        showToast('未授权，请重新登录')
        localStorage.removeItem('token')
        // 可以跳转到登录页
      } else if (status === 403) {
        showToast('没有权限')
      } else if (status === 500) {
        showToast('服务器错误')
      } else {
        showToast(data?.message || '网络错误')
      }
    } else {
      showToast('网络连接失败')
    }
    return Promise.reject(error)
  }
)

// 图片上传
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await api.post('/admin/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // 后端返回的是 URL 字符串，包装成对象格式
    const url = typeof response === 'string' ? response : (response.url || response)
    return { url }
  } catch (error) {
    // 如果上传失败，返回本地预览 URL（开发环境）
    if (process.env.NODE_ENV === 'development') {
      return { url: URL.createObjectURL(file) }
    }
    throw error
  }
}

// 导出 api 实例
export { api }
export default api

