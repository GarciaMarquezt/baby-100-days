import request from '../utils/request'

// --- 认证 ---
export function login(data) {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    })
}

// --- 宾客管理 ---
export function getGuests(params) {
    return request({
        url: '/admin/guest/list',
        method: 'get',
        params
    })
}

export function deleteGuest(data) {
    return request({
        url: '/admin/guest/delete',
        method: 'post',
        data
    })
}

// --- 相册管理 ---
export function getGalleryList(params) {
    return request({
        url: '/admin/gallery/list',
        method: 'get',
        params
    })
}

export function deleteGallery(data) {
    return request({
        url: '/admin/gallery/delete',
        method: 'post',
        data
    })
}

export function updateGallery(data) {
    return request({
        url: '/admin/gallery/update',
        method: 'post',
        data
    })
}

export function batchMoveGallery(data) {
    return request({
        url: '/admin/gallery/batch-move',
        method: 'post',
        data
    })
}

export function batchDeleteGallery(data) {
    return request({
        url: '/admin/gallery/batch-delete',
        method: 'post',
        data
    })
}

// 上传接口地址 (用于 Vant Uploader 直接调用)
export const uploadUrl = '/api/admin/gallery/upload';

// --- 系统设置 ---
export function updateConfig(data) {
    return request({
        url: '/admin/config/update',
        method: 'post',
        data
    })
}

// 获取配置 (复用公共接口)
export function getConfig() {
    return request({
        url: '/config/info',
        method: 'get'
    })
}

// --- 留言管理 ---
export function getMessageList(params) {
    return request({
        url: '/admin/message/list',
        method: 'get',
        params
    })
}

export function approveMessage(data) {
    return request({
        url: '/admin/message/approve',
        method: 'post',
        data
    })
}

export function deleteMessage(data) {
    return request({
        url: '/admin/message/delete',
        method: 'post',
        data
    })
}
