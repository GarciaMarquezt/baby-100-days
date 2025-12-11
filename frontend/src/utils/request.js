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
        if (res.code === 0) {
            return res.data
        } else {
            showToast(res.msg || 'Error')
            return Promise.reject(new Error(res.msg || 'Error'))
        }
    },
    error => {
        showToast(error.message)
        return Promise.reject(error)
    }
)

export default service

