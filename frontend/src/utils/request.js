import axios from 'axios'
import { showToast } from 'vant'

// const service = axios.create({
//     baseURL: '/api', // 配合 vite proxy
//     timeout: 5000
// })
const service = axios.create({
    // 生产环境地址：使用相对路径，通过 Nginx 反向代理转发到后端
    // 这样可以避免 HTTPS 页面请求 HTTP 接口导致的 "Mixed Content" 报错
    baseURL: '/api',
    timeout: 5000
})
// 响应拦截
service.interceptors.response.use(
    response => {
        const res = response.data

        // 根据实际API响应调整：code为0表示成功
        if (res.code === 0) {
            return res // 返回完整的响应对象，包括code, msg, data
        } else {
            // 对于非0的响应，不自动显示错误提示，让组件自己处理
            console.warn('API Response:', res)
            return res // 仍然返回响应，让组件自己判断如何处理
        }
    },
    error => {
        console.error('Request Error:', error)

        // 更详细的错误处理
        if (error.response) {
            // 服务器返回了错误状态码
            const status = error.response.status
            const data = error.response.data

            if (status === 404) {
                showToast('接口不存在')
            } else if (status === 500) {
                showToast('服务器内部错误')
            } else if (status >= 400 && status < 500) {
                showToast('请求参数错误')
            } else {
                showToast(`请求失败 (${status})`)
            }
        } else if (error.request) {
            // 网络错误
            showToast('网络连接失败，请检查网络')
        } else {
            // 其他错误
            showToast('请求失败，请稍后重试')
        }

        return Promise.reject(error)
    }
)

export default service

